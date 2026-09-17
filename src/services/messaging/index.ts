export interface OutboundMessage {
  recipientId: string; // phone number or employeeId
  content: string;
  messageType: "TEXT" | "IMAGE_PROMPT" | "EXTRACTED_CARD" | "STATUS_UPDATE" | "ACTION_BUTTONS";
  payload?: any;
}

export interface InboundMessage {
  senderId: string;
  content?: string;
  mediaUrl?: string;
  mimeType?: string;
  actionId?: string;
  timestamp: string;
}

export interface MessagingProvider {
  sendMessage(msg: OutboundMessage): Promise<{ messageId: string; success: boolean }>;
  parseInboundWebhook(rawBody: any): Promise<InboundMessage | null>;
}
