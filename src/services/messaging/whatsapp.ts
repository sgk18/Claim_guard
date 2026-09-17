import { MessagingProvider, OutboundMessage, InboundMessage } from "./index";

export class WhatsAppChannel implements MessagingProvider {
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  }

  async sendMessage(msg: OutboundMessage): Promise<{ messageId: string; success: boolean }> {
    // If mock mode or missing credentials, return mock success
    if (process.env.CLAIMGUARD_MOCK_MODE === "true" || !this.accessToken) {
      return {
        messageId: `wamid_mock_${Date.now()}`,
        success: true,
      };
    }

    try {
      const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: msg.recipientId,
          type: "text",
          text: { body: msg.content },
        }),
      });

      const data = await response.json();
      return {
        messageId: data.messages?.[0]?.id || `wamid_${Date.now()}`,
        success: response.ok,
      };
    } catch {
      return { messageId: "error", success: false };
    }
  }

  async parseInboundWebhook(rawBody: any): Promise<InboundMessage | null> {
    try {
      const entry = rawBody?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      if (!message) return null;

      const senderId = message.from;
      let content = "";
      let mediaUrl = "";
      let mimeType = "";

      if (message.type === "text") {
        content = message.text?.body || "";
      } else if (message.type === "image") {
        mediaUrl = message.image?.id || "";
        mimeType = message.image?.mime_type || "image/jpeg";
      }

      return {
        senderId,
        content,
        mediaUrl,
        mimeType,
        actionId: message.interactive?.button_reply?.id,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}
