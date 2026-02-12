// Defined as a global for offline/file:// compatibility (ES5 safe)
var survivalData = [
  {
    "id": "deploy-prod",
    "title": "DEPLOYING TO PRODUCTION",
    "category": "ADVANCED SURVIVAL",
    "situation": "You are stranded in a high-traffic environment and need to push code immediately. The client is watching. The server is unstable.",
    "gear": ["Docker Container", "AWS CLI Credentials", "Rollback Plan (Printed)", "Strong Coffee"],
    "tips": "Always tag your release before pushing. It leaves a trail for rescue. Use 'git tag -a v1.0 -m \"Release\"'.",
    "worstCase": {
      "scenario": "DATABASE MIGRATION FAILS MID-DEPLOY",
      "immediateAction": "DO NOT PANIC. Rollback using the snapshot artifact immediately. Isolate the database from public traffic."
    }
  },
  {
    "id": "merge-conflict",
    "title": "NAVIGATING MERGE CONFLICTS",
    "category": "BASIC SURVIVAL",
    "situation": "Two developers have modified the same file. Git refuses to proceed. The history is diverging rapidly.",
    "gear": ["Git GUI (Optional)", "Diff Tool", "Patience", "Team Communication"],
    "tips": "Accept 'Current Change' or 'Incoming Change' with extreme caution. Whitespace is often a trap.",
    "worstCase": {
      "scenario": "YOU DELETED THE MAIN FUNCTION",
      "immediateAction": "Abort the merge immediately: 'git merge --abort'. Verify file integrity before retrying."
    }
  },
  {
    "id": "api-down",
    "title": "SURVIVING AN API OUTAGE",
    "category": "WILDERNESS",
    "situation": "Your frontend is throwing 500 errors. The backend team is unreachable. Users are clicking furiously.",
    "gear": ["Status Page", "Network Inspector", "Mock Data JSON"],
    "tips": "Implement a graceful fallback UI. Show a 'Maintenance Mode' screen instead of a blank page.",
    "worstCase": {
      "scenario": "CORS ERRORS EVERYWHERE",
      "immediateAction": "Check your headers. Verify the server allows your origin. If all else fails, proxy the request."
    }
  }
];
