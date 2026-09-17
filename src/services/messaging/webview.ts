import { MessagingProvider, OutboundMessage, InboundMessage } from "./index";

export class WebViewChannel implements MessagingProvider {
  async sendMessage(msg: OutboundMessage): Promise<{ messageId: string; success: boolean }> {
    // In WebView mode, responses are returned directly in HTTP payloads and local state
    return {
      messageId: `msg_wv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      success: true,
    };
  }

  async parseInboundWebhook(rawBody: any): Promise<InboundMessage | null> {
    return {
      senderId: rawBody.employeeId || "emp_guest",
      content: rawBody.content,
      mediaUrl: rawBody.mediaUrl,
      timestamp: new Date().toISOString(),
    };
  }
}
