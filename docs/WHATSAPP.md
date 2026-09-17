# CLAIMGUARD — WhatsApp Integration Architecture

## 1. Channel Decoupling Strategy
ClaimGuard separates messaging channels from core domain processing using the `MessagingProvider` abstraction:

```
[Employee WebView]                  [WhatsApp Business Platform]
        │                                        │
        ▼                                        ▼
 [WebViewChannel]                        [WhatsAppChannel]
        │                                        │
        └───────────────────┬────────────────────┘
                            │
                            ▼
              [ClaimGuard Processing Core]
```

The core backend services (`StorageProvider`, `OCRProvider`, `FraudEngine`, `RiskEngine`, `AIProvider`) do not know whether an expense claim arrived via the web browser or WhatsApp.

---

## 2. Meta WhatsApp Cloud API Implementation
- **Webhook Route**: `src/app/api/whatsapp/webhook/route.ts`
  - `GET`: Handles Meta challenge verification (`hub.challenge`).
  - `POST`: Receives inbound messages, media payloads, and interactive button clicks.
- **Outbound Adapter**: `src/services/messaging/whatsapp.ts`
  - Sends interactive template cards and status notifications via Meta Graph API v20.0.
  - Automatically operates in mock simulation mode when `CLAIMGUARD_MOCK_MODE=true`.
