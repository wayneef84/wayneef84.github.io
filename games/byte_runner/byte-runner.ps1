<#
.SYNOPSIS
  Byte Runner: watch a long file copy as a small self playing platformer.

.DESCRIPTION
  Point it at the folder (or folders) a copy is filling. Each folder is one stage,
  in the order the stages run. For a chained backup such as E: to D:, then D: to N:,
  give both destination folders and you get one game level per hop.

  Every few seconds it totals what has landed in the active folder, measures the real
  speed over the last 5 minutes, works out the ETA, reads the robocopy log for each
  stage if you give one, and writes status.js next to the Byte Runner page, which it
  opens in your browser. The page polls status.js every 3 seconds.

  Read only. It never starts, stops or changes a copy.

  Stage end detection, best first:
    1. robocopy log for that stage has its "Ended :" summary (also gives the FAILED count)
    2. the next stage's folder (or log) appears
    3. last stage only: size reached the total and stopped growing for 3 checks

.PARAMETER Dest
  Folder(s) the copy is filling, one per stage, in order. The folder for a later stage
  should not exist before that stage starts (or give a -Log for it).
.PARAMETER TotalGB
  Size of the data being copied, in GB (1 GB = 1024^3 bytes, the way Explorer counts).
.PARAMETER Source
  Instead of -TotalGB: a folder to measure once at the start to get the total.
.PARAMETER Label
  Optional short label per stage, for example "E: > D:".
.PARAMETER Log
  Optional robocopy log per stage, a full path or a wildcard like "D:\*stage1*.txt".
.PARAMETER GuessMBs
  Speed to assume per stage (MB/s) until 25 seconds of real data exist. One value covers all stages.
.PARAMETER Title
  Name shown on the page and used for the temp folder.
.PARAMETER IntervalSec
  Seconds between checks. Default 10.
.PARAMETER PageUrl
  Where to download the game page when index.html is not next to this script.
.PARAMETER NoBrowser
  Do not open the page automatically.

.EXAMPLE
  & "$HOME\Downloads\byte-runner.ps1" -Dest "D:\Backup" -TotalGB 250

.EXAMPLE
  & "$HOME\Downloads\byte-runner.ps1" -Title "Photo backup" -TotalGB 271 `
      -Dest "D:\Photos","N:\Photos" -Label "E: > D:","D: > N:" `
      -Log "D:\*stage1*.txt","D:\*stage2*.txt" -GuessMBs 30,120

.EXAMPLE
  & "$HOME\Downloads\byte-runner.ps1" -Source "E:\" -Dest "D:\Backup"

.NOTES
  Byte Runner v1.0.0, F.O.N.G. Arcade. Works in Windows PowerShell 5.1 and PowerShell 7.
  If Windows blocks the script: Unblock-File it, then Set-ExecutionPolicy -Scope Process Bypass.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string[]]$Dest,
  [double]$TotalGB = 0,
  [string]$Source = '',
  [string[]]$Label = @(),
  [string[]]$Log = @(),
  [string[]]$GuessMBs = @('30'),
  [string]$Title = 'Backup',
  [int]$IntervalSec = 10,
  [string]$PageUrl = 'https://wayneef84.github.io/games/byte_runner/index.html',
  [switch]$NoBrowser
)

$utf8 = New-Object System.Text.UTF8Encoding($false)

# powershell.exe -File passes "a,b" as one string, so lists are split here.
# A value that is an existing path is kept whole even if it contains a comma.
function Split-List([string[]]$Items, [switch]$Paths) {
  $out = New-Object System.Collections.ArrayList
  foreach ($item in $Items) {
    if ([string]::IsNullOrWhiteSpace($item)) { continue }
    if ($Paths -and (Test-Path -LiteralPath $item)) { $null = $out.Add($item.Trim()); continue }
    foreach ($part in ($item -split ',')) { if ($part.Trim()) { $null = $out.Add($part.Trim()) } }
  }
  return ,($out.ToArray())
}

# Fast folder size: plain .NET enumeration, far quicker than Get-ChildItem | Measure-Object.
# Unreadable folders are skipped instead of stopping the count; the recycle bin and
# System Volume Information are ignored so a drive root measures like Explorer does.
function Get-FolderBytes([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  [double]$sum = 0
  $stack = New-Object 'System.Collections.Generic.Stack[string]'
  $stack.Push($Path)
  while ($stack.Count -gt 0) {
    $dir = $stack.Pop()
    try {
      $di = New-Object System.IO.DirectoryInfo($dir)
      foreach ($f in $di.EnumerateFiles()) { $sum += $f.Length }
      foreach ($sub in $di.EnumerateDirectories()) {
        if (($sub.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { continue }
        if ($sub.Name -eq '$RECYCLE.BIN' -or $sub.Name -eq 'System Volume Information') { continue }
        $stack.Push($sub.FullName)
      }
    } catch { }
  }
  return $sum
}

function Resolve-Log([string]$Spec) {
  if (-not $Spec) { return $null }
  try {
    if (Test-Path -LiteralPath $Spec -PathType Leaf) { return Get-Item -LiteralPath $Spec }
    return Get-ChildItem -Path $Spec -File -ErrorAction Stop | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  } catch { return $null }
}

# Robocopy writes "Ended :" and a Files row (Total Copied Skipped Mismatch FAILED Extras) when it finishes.
function Read-LogState($LogFile) {
  $st = @{ Found = $false; Ended = $false; Failed = -1; Current = '' }
  if (-not $LogFile) { return $st }
  $st.Found = $true
  try { $tail = @(Get-Content -LiteralPath $LogFile.FullName -Tail 200 -ErrorAction Stop) } catch { return $st }
  foreach ($line in $tail) {
    if ($line -match '^\s*Ended\s*:') { $st.Ended = $true }
    if ($line -match '^\s*Files\s*:\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)') { $st.Failed = [int]$Matches[5] }
  }
  # Last file line, e.g. "<tab>New File<tab><tab>1.2 m<tab>IMG_0001.JPG" (name only, or full path with /FP)
  for ($i = $tail.Count - 1; $i -ge 0; $i--) {
    $line = [string]$tail[$i]
    if ($line -match '^\s*(Log File|Source|Dest|Files|Options|Started|Ended|Dirs|Bytes|Times|Speed)\s*:') { continue }
    if ($line -match '(New File|Newer|Older|Changed|Modified|Tweaked)\s+[\d\.]+(\s+[kmgt])?\s+(\S.*?)\s*$') {
      $st.Current = (($Matches[3] -replace '\s+\d+(\.\d+)?%.*$', '') -split '\\')[-1]; break
    }
  }
  return $st
}

# Copy speed in MB/s over a sliding 5 minute window; $null until there are 25 seconds of history.
function Measure-Rate($Stage) {
  $h = $Stage.Hist; $now = Get-Date
  $null = $h.Add(@($now, [double]$Stage.Bytes))
  while ($h.Count -gt 2 -and ($now - $h[0][0]).TotalSeconds -gt 300) { $h.RemoveAt(0) }
  $dt = ($now - $h[0][0]).TotalSeconds
  if ($dt -lt 25) { return $null }
  return [math]::Max(0, ($Stage.Bytes - $h[0][1]) / $dt / 1MB)
}

# ---------------- setup ----------------
$Dest  = Split-List $Dest -Paths
$Label = Split-List $Label
$Log   = Split-List $Log -Paths
$guess = @()
foreach ($g in (Split-List $GuessMBs)) { $guess += [double]$g }
if ($guess.Count -eq 0) { $guess = @(30.0) }
if ($Dest.Count -eq 0) { throw 'Give at least one -Dest folder.' }

if ($TotalGB -le 0) {
  if (-not $Source) { throw 'Give -TotalGB (size of the data being copied, in GB) or -Source (a folder to measure once).' }
  Write-Host "Measuring $Source once to get the total size. On a slow drive this can take a few minutes..." -ForegroundColor Yellow
  $srcBytes = Get-FolderBytes $Source
  if (-not $srcBytes) { throw "Could not read $Source" }
  $TotalGB = $srcBytes / 1GB
  Write-Host ('Source holds {0:N2} GB' -f $TotalGB)
}
$totalBytes = [double]$TotalGB * 1GB

$stages = @()
for ($i = 0; $i -lt $Dest.Count; $i++) {
  $stages += [pscustomobject]@{
    Dest    = $Dest[$i]
    Label   = $(if ($i -lt $Label.Count) { $Label[$i] } else { '> ' + $Dest[$i] })
    Log     = $(if ($i -lt $Log.Count) { $Log[$i] } else { '' })
    Guess   = $(if ($i -lt $guess.Count) { $guess[$i] } else { $guess[-1] })
    Bytes   = 0.0
    Started = $false
    Done    = $false
    DoneAt  = $null
    Failed  = -1
    Same    = 0
    Rate    = $null
    LogInfo = $null
    Hist    = (New-Object System.Collections.ArrayList)
  }
}

function Get-StageTotal([int]$Index) {
  if ($Index -gt 0 -and $stages[$Index - 1].Done -and $stages[$Index - 1].Bytes -gt 0) { return [double]$stages[$Index - 1].Bytes }
  return $totalBytes
}

# The page: a copy next to this script wins, otherwise download it from the arcade (cached for offline runs).
$slug = ($Title -replace '[^A-Za-z0-9]+', '_').Trim('_'); if (-not $slug) { $slug = 'run' }
$outDir = Join-Path (Join-Path $env:TEMP 'byte_runner') $slug
$null = New-Item -ItemType Directory -Force -Path $outDir
$pageOut = Join-Path $outDir 'index.html'
$jsOut = Join-Path $outDir 'status.js'
$localPage = $(if ($PSScriptRoot) { Join-Path $PSScriptRoot 'index.html' } else { '' })
if ($localPage -and (Test-Path -LiteralPath $localPage) -and (Select-String -LiteralPath $localPage -Pattern 'Byte Runner v' -SimpleMatch -Quiet)) {
  Copy-Item -LiteralPath $localPage -Destination $pageOut -Force
} else {
  try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $PageUrl -OutFile $pageOut -UseBasicParsing -ErrorAction Stop
  } catch {
    if (-not (Test-Path -LiteralPath $pageOut)) { throw "Could not download the game page from $PageUrl. Save it as index.html next to this script and run again." }
    Write-Host 'Offline: using the page saved last time.' -ForegroundColor DarkYellow
  }
}

Write-Host ''
Write-Host "Byte Runner: $Title" -ForegroundColor Yellow
for ($i = 0; $i -lt $stages.Count; $i++) {
  Write-Host ("  stage {0}: {1}{2}" -f ($i + 1), $stages[$i].Dest, $(if ($stages[$i].Log) { "   log: $($stages[$i].Log)" } else { '' }))
}
Write-Host ('  total:   {0:N2} GB' -f $TotalGB)
Write-Host "  page:    $pageOut"
Write-Host '  Ctrl+C stops the monitor. It only reads; the copy is not affected.' -ForegroundColor DarkGray
Write-Host '  (* after MB/s means the guessed speed is shown until 25 seconds of real data exist)' -ForegroundColor DarkGray
Write-Host ''

# ---------------- main loop ----------------
$opened = $false
while ($true) {
  $now = Get-Date
  foreach ($s in $stages) {
    $s.LogInfo = Read-LogState (Resolve-Log $s.Log)
    if (-not $s.Started) { $s.Started = $s.LogInfo.Found -or (Test-Path -LiteralPath $s.Dest) }
  }

  for ($i = 0; $i -lt $stages.Count; $i++) {
    $s = $stages[$i]
    if ($s.Done) { if ($s.Failed -lt 0 -and $s.LogInfo.Failed -ge 0) { $s.Failed = $s.LogInfo.Failed }; continue }
    if (-not $s.Started) { continue }
    $before = $s.Bytes
    $b = Get-FolderBytes $s.Dest
    if ($b -ne $null) { $s.Bytes = [double]$b }
    $s.Rate = Measure-Rate $s
    $s.Same = $(if ([math]::Abs($s.Bytes - $before) -lt 1) { $s.Same + 1 } else { 0 })
    $total = Get-StageTotal $i
    $next = $(if ($i + 1 -lt $stages.Count) { $stages[$i + 1] } else { $null })
    $ended = $false
    if ($s.LogInfo.Ended) { $ended = $true }
    elseif (-not $s.LogInfo.Found) {
      if ($next -and $next.Started) { $ended = $true }
      elseif (-not $next -and $s.Bytes -ge $total * 0.995 -and $s.Same -ge 3) { $ended = $true }
    }
    if ($ended) { $s.Done = $true; $s.DoneAt = $now; $s.Failed = $s.LogInfo.Failed; $s.Rate = $null }
  }

  $list = New-Object System.Collections.ArrayList
  $left = 0.0; $active = $null; $halted = $false
  for ($i = 0; $i -lt $stages.Count; $i++) {
    $s = $stages[$i]
    $total = Get-StageTotal $i
    $measured = ($s.Rate -ne $null)
    $mbs = $(if ($measured) { $s.Rate } else { $s.Guess })
    $etaRate = $(if ($measured -and $s.Rate -gt 0.5) { $s.Rate } else { $s.Guess })
    $eta = $(if ($s.Done) { 0 } else { [math]::Max(0, ($total - $s.Bytes) / ($etaRate * 1MB) / 60) })
    if (-not $s.Done) { $left += $eta; if (-not $active -and $s.Started) { $active = $s } }
    if ($s.Done -and $s.Failed -gt 0 -and ($i + 1) -lt $stages.Count -and -not $stages[$i + 1].Started -and $s.DoneAt -and ($now - $s.DoneAt).TotalSeconds -gt 120) { $halted = $true }
    $pct = $(if ($s.Done) { 100 } elseif ($total -gt 0) { [math]::Min(99.9, [math]::Round($s.Bytes / $total * 100, 1)) } else { 0 })
    $null = $list.Add([ordered]@{
      label   = [string]$s.Label
      gb      = [math]::Round($s.Bytes / 1GB, 2)
      total   = [math]::Round($total / 1GB, 2)
      pct     = $pct
      mbs     = [math]::Round($mbs, 1)
      est     = [bool](-not $measured -and -not $s.Done)
      eta     = [int][math]::Round($eta)
      started = [bool]$s.Started
      done    = [bool]$s.Done
      failed  = [int]$s.Failed
    })
  }
  $allDone = -not ($stages | Where-Object { -not $_.Done })
  $phase = $(if ($allDone) { 'done' } elseif ($halted) { 'halted' } else { 'run' })
  $cur = $(if ($active -and $active.LogInfo) { $active.LogInfo.Current } else { '' })
  $fin = $(if ($phase -eq 'run') { $now.AddMinutes($left).ToString('h:mm tt') } else { '' })

  $status = [ordered]@{
    v      = 2
    title  = $Title
    te     = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    ts     = $now.ToString('h:mm:ss tt')
    phase  = $phase
    left   = [int][math]::Round($left)
    fin    = $fin
    cur    = [string]$cur
    stages = $list
  }
  $json = ConvertTo-Json -InputObject $status -Compress -Depth 5
  try { [System.IO.File]::WriteAllText($jsOut, "window.hudData=$json;", $utf8) } catch { }

  if (-not $opened -and -not $NoBrowser) { Start-Process $pageOut; $opened = $true }

  $bits = @()
  for ($i = 0; $i -lt $list.Count; $i++) {
    $e = $list[$i]
    $tailText = $(if ($e.done) { ' done' } elseif ($e.started) { (' {0:N1} MB/s' -f $e.mbs) + $(if ($e.est) { '*' } else { '' }) } else { ' waiting' })
    $bits += ('S{0} {1:N1}/{2:N0} GB {3:N1}%{4}' -f ($i + 1), $e.gb, $e.total, $e.pct, $tailText)
  }
  $endText = $(if ($fin) { "finish ~$fin" } else { $phase.ToUpper() })
  Write-Host ($status.ts + '  ' + ($bits -join '  |  ') + '  |  ' + $endText) -ForegroundColor Cyan

  if ($phase -eq 'done') {
    Write-Host ''
    $fails = ($stages | ForEach-Object { $_.Failed }) -join ', '
    Write-Host "All stages finished. Failed files per stage: $fails (-1 means no robocopy summary was available)." -ForegroundColor Green
    break
  }
  if ($halted) { Write-Host 'A stage finished with failed files and the next stage has not started. Check its log.' -ForegroundColor Red }

  Start-Sleep -Seconds $IntervalSec
}
