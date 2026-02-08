# Data Policy

**Effective Date:** January 1, 2026
**Version:** 1.0 (Draft)

This Data Policy outlines the governance, storage, access control, and retention schedules for data within the F.O.N.G. ecosystem.

## 1. Project Classifications

| Classification | Description | Projects |
| :--- | :--- | :--- |
| **Public / Non-Sensitive** | Standard game data, high scores, user preferences. | Fong Arcade, Input A11y |
| **Enterprise / Confidential** | Logistics data, tracking numbers, internal API keys. | SkyLantern Logistics |
| **High Privacy / Cold Storage** | Personal archives, family photos, sensitive documents. | 16 TB Digital Archive |

## 2. Data Storage & Retention

### A. Fong Arcade (Public)
*   **Storage:** Browser `localStorage` (Client-side only).
*   **Retention:** Indefinite until browser cache cleared by user.
*   **Backup:** None (Local only).

### B. SkyLantern Logistics (Enterprise)
*   **Storage:** `IndexedDB` (Client-side encrypted) + Optional Cloud Sync.
*   **Retention:**
    *   Active shipments: Retained until delivery + 30 days.
    *   Archived shipments: Retained for 1 year (configurable).
    *   API Keys: Stored locally, never transmitted to F.O.N.G. servers.
*   **Deletion:** User-initiated deletion via app settings.

### C. 16 TB Digital Archive (High Privacy)
*   **Storage:** Physical Cold Storage (Offline HDD Arrays) + Encrypted Cloud Backup (AWS Glacier Deep Archive).
*   **Access:** Restricted to family members and authorized administrators.
*   **Retention:** Permanent preservation (Legacy/Heritage data).
*   **Deletion:** Only upon unanimous consent of data owners or legal requirement.

## 3. Access Control

*   **Public Projects:** Open access. No authentication required.
*   **SkyLantern Logistics:** Requires valid Carrier API keys. Enterprise features may require corporate SSO (Future).
*   **16 TB Archive:** Strict Role-Based Access Control (RBAC).
    *   **Admin:** Full read/write/delete.
    *   **Viewer:** Read-only.
    *   **No Access:** Default for all external agents/users.

## 4. Compliance & Audit
*   **GDPR/CCPA:** Users may request data export (JSON/CSV) or deletion at any time.
*   **Audit Logs:** Access to the 16 TB Archive and SkyLantern admin panels is logged.
*   **Amazon Compliance:** SkyLantern data handling adheres to Amazon Corporate security policies where applicable.

## 5. Contact
For data requests or inquiries, please contact the repository maintainer.
