# Google Drive backup: one-time setup

This is done once, by the owner of the arcade, with a normal Google account. It costs nothing. It takes about 20 minutes. Google may rename screens, so match by the words, not the exact position.

You end up with one thing: a Client ID. It is a public id, not a secret. It is safe to keep in the code.

## Part 1: Create the project
1. Go to https://console.cloud.google.com and sign in.
2. Top bar, project picker, New Project. Name it `Fong Arcade`. Create. Make sure it is selected.

## Part 2: Turn on the Drive API
1. Menu, APIs & Services, Library.
2. Search `Google Drive API`. Open it. Press Enable.

## Part 3: Consent screen (called Google Auth Platform)
1. Menu, Google Auth Platform (or APIs & Services, OAuth consent screen). Press Get started.
2. App name: `Fong Arcade`. User support email: your email. Next.
3. Audience: External. Next.
4. Contact email: your email. Agree to the policy. Create.
5. Data Access, Add or remove scopes. Find or paste this one scope and tick it:
   `https://www.googleapis.com/auth/drive.appdata`
   (It is the hidden app-folder scope. It is not a sensitive scope. Do not add any other Drive scope.) Update, then Save.
6. Audience, Test users, Add users. Add the Google email of every family member who will use Drive backup (up to 100). The app stays in Testing mode. In Testing mode Google asks each person to sign in again about once a week. That is fine for a family.

## Part 4: Create the Client ID
1. Google Auth Platform, Clients, Create client.
2. Application type: Web application. Name: `Fong Arcade web`.
3. Authorized JavaScript origins, Add URI, add both:
   - `https://wayneef84.github.io`
   - `http://localhost:8765`  (only for testing on your own computer)
4. Leave Authorized redirect URIs empty. Create.
5. Copy the Client ID. It ends in `.apps.googleusercontent.com`.

## Part 5: Give it to the arcade
Open `js/gdrive-config.js` and paste the id between the quotes:
`window.FONG_GDRIVE_CLIENT_ID = 'PASTE-HERE.apps.googleusercontent.com';`
Commit and publish. The Back up to Google Drive buttons then turn on. Until the id is set they say Not set up yet and everything else keeps working.

## What a family member sees
1. Settings, Data, Back up to Google Drive (or the gear in Nightlite Choir+). A parent question comes first.
2. A Google pop-up: pick the account, press Continue or Allow. It says Fong Arcade wants to store its own data in your Drive.
3. Auto backup is on once you connect: the arcade saves one changed game at a time, in the background while the page is open. You can also make a save point yourself (Back up everything or Back up on one game, with an optional name). Restore picks from a dated list and always asks first.
If you connected before, the arcade quietly asks Google again when a page opens (no pop-up). If Google or the browser says no, a Tap to reconnect button shows. A device that never connected does not contact Google.
Google may show a "Google hasn't verified this app" page while the app is in Testing mode. Press Advanced, then Go to Fong Arcade. Only the test users you added can pass it.

## Later, optional: remove the weekly sign-in and the 100 person limit
Google Auth Platform, Audience, Publish app. Publishing needs a privacy policy web page that says what the app stores, and Google may ask for a short review. This is not needed for family use.

## What is stored, and where
Backups go into a hidden app folder (appDataFolder) as save points, one rolling auto file per game and up to 7 daily copies per game in the signed-in person's own Drive. The arcade cannot see any other Drive file. The person can delete the backups, or remove the app's access at https://myaccount.google.com/permissions. Nothing is sent to any server that belongs to the arcade.
