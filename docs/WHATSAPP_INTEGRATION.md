# CLAIMGUARD — WhatsApp Business Platform Integration Guide

## 1. Architectural Decoupling Principle
ClaimGuard is architected with complete channel isolation. The core domain services (storage, OCR intelligence, deterministic fraud rules, risk scoring, AI explanation, and manager dashboard) interact solely through abstract interfaces.

```
+---------------------------+       +-------------------------------+
|  Employee Mobile WebView  |       |  WhatsApp Business Platform   |
|   (/employee - Next.js)   |       |      (Meta Cloud API)         |
+-------------+-------------+       +---------------+---------------+
              |                                     |
              v                                     v
+-------------+-------------+       +---------------+---------------+
|      WebViewChannel       |       |       WhatsAppChannel         |
|  (In-browser JSON stream) |       |   (Webhook & Graph API v20.0) |
+-------------+-------------+       +---------------+---------------+
              \                                     /
               \                                   /
                v                                 v
         +-----------------------------------------------+
         |     Agnostic ClaimGuard Processing Core       |
         |  - StorageProvider (Uploads & Sanitization)   |
         |  - OCRProvider (Receipt Extraction)           |
         |  - DeterministicFraudEngine (Rules & Hashing) |
         |  - DeterministicRiskEngine (0-100 Scoring)    |
         |  - AIProvider (Explainable Narratives)        |
         +-----------------------------------------------+
```

---

## 2. Meta WhatsApp Cloud API Setup

### 2.1 Developer Account Configuration
1. Register on Meta for Developers: `https://developers.facebook.com`.
2. Create an App of type **Business**.
3. Add the **WhatsApp** product to your app.
4. Retrieve your credentials and add to `.env.local`:
   ```bash
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_permanent_system_user_token
   WHATSAPP_VERIFY_TOKEN=your_custom_webhook_secret
   WHATSAPP_APP_SECRET=your_app_secret
   ```

### 2.2 Webhook Configuration
- Webhook Callback URL: `https://your-domain.com/api/whatsapp/webhook`
- Verify Token: Matches `WHATSAPP_VERIFY_TOKEN`.
- Webhook Subscriptions: Subscribe to `messages`.

---

## 3. Conversational Experience Mapping

| WebView Experience (`/employee`) | WhatsApp Business Platform Implementation |
|---|---|
| Initial Welcome Bubble | Interactive Template Message (`claimguard_welcome`) with button |
| Image Upload Drag/Drop/Camera | Inbound Media Message (`type: image`). Graph API downloads media |
| Extracted Receipt Summary Card | Interactive List Message or WhatsApp Flow form with pre-filled fields |
| `[Everything is correct]` Button | Interactive Quick Reply Button `confirm_submission` |
| `[Edit details]` Modal | WhatsApp Flow (dynamic JSON form) or conversational prompt: *"Reply with new amount"* |
| Real-time Status Updates | Outbound WhatsApp Template Notification: *"Your Claim #CLM-4471 was Approved"* |
