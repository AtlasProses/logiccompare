# LogicCompare Cloudflare DNS Setup Guide

Configure these DNS records in your Cloudflare dashboard for `logiccompare.com` to enable professional email sending (SPF, DKIM, DMARC) and link your Pages project.

---

## 📧 1. Email Deliverability Records (Brevo & Resend)

To guarantee that transaction emails (forgot password) and user notifications (price alerts) land directly in the **Inbox** rather than the Spam folder, add these records to your Cloudflare DNS zone.

### A. SPF Record (Sender Policy Framework)
Prevents email spoofing by authorizing our email senders.
*   **Type:** `TXT`
*   **Name (Host):** `@` (or `logiccompare.com`)
*   **Value:** `v=spf1 include:spf.sendinblue.com include:sendgrid.net ~all`
*   *(Note: Adjust the include statement depending on which sender keys you get during dashboard setups).*

### B. DKIM Record (DomainKeys Identified Mail)
Signs outgoing emails cryptographically to verify authenticity.
*   **Type:** `TXT`
*   **Name (Host):** `mail._domainkey` (or the custom key provided by Resend/Brevo)
*   **Value:** `k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...` (Copy the long key provided in your email sender settings page).

### C. DMARC Record (Crucial for Gmail/Yahoo Inbox placement)
Tells recipient servers how to handle emails failing SPF/DKIM verification.
*   **Type:** `TXT`
*   **Name (Host):** `_dmarc`
*   **Value:** `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@logiccompare.com`
*   *(Note: This quarantine policy keeps your domain reputation safe if someone tries to spoof your domain).*

---

## 🌐 2. Cloudflare Pages Domain Mapping

After deploying the React app to Cloudflare Pages, map it to your custom domain:

1.  In the Cloudflare Dashboard, go to **Workers & Pages** -> select your project -> **Custom Domains**.
2.  Click **Set up a custom domain** and enter `logiccompare.com`.
3.  Cloudflare will automatically manage the CNAME records pointing `logiccompare.com` and `www.logiccompare.com` directly to your Pages deployment, managing SSL certificates automatically for free.
