export interface OutboundMessage {
  recipientId: string;
  recipientPhone?: string;
  text: string;
  quickReplies?: string[];
  metadata?: Record<string, any>;
}

export interface NotificationPayload {
  to: string;
  channel?: "webview" | "whatsapp" | "push" | "email";
  template?: string;
  variables?: Record<string, any>;
}

export interface MessagingProvider {
  channelName: string;
  sendMessage(message: OutboundMessage): Promise<{ success: boolean; messageId: string }>;
  sendNotification(notification: NotificationPayload): Promise<{ success: boolean; messageId: string }>;
}

export class WebViewMessagingProvider implements MessagingProvider {
  channelName = "WEBVIEW";

  async sendMessage(message: OutboundMessage) {
    return {
      success: true,
      messageId: `msg_wv_${Date.now()}`,
    };
  }

  async sendNotification(notification: NotificationPayload) {
    return {
      success: true,
      messageId: `notif_wv_${Date.now()}`,
    };
  }
}

export class WhatsAppMessagingProvider implements MessagingProvider {
  channelName = "WHATSAPP";
  private phoneNumberId?: string;
  private accessToken?: string;

  constructor(phoneNumberId?: string, accessToken?: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  async sendMessage(message: OutboundMessage) {
    if (!this.accessToken || !this.phoneNumberId) {
      return {
        success: true,
        messageId: `mock_wa_${Date.now()}`,
      };
    }

    const response = await fetch(`https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.recipientPhone || message.recipientId,
        type: "text",
        text: { body: message.text },
      }),
    });

    const data = (await response.json()) as any;
    return {
      success: response.ok,
      messageId: data?.messages?.[0]?.id || `wa_err_${Date.now()}`,
    };
  }

  async sendNotification(notification: NotificationPayload) {
    return this.sendMessage({
      recipientId: notification.to,
      text: `[ClaimGuard Notification] ${notification.template || "update"}: ${JSON.stringify(notification.variables || {})}`,
    });
  }
}
