import { NextRequest, NextResponse } from "next/server";
import { WhatsAppChannel } from "@/services/messaging/whatsapp";

const whatsappChannel = new WhatsAppChannel();

// Verification endpoint for Meta Graph API Webhook setup
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN ||
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    "claimguard_verify_token";

  if (mode === "subscribe" && token === expectedToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// Inbound message receiver
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const inbound = await whatsappChannel.parseInboundWebhook(rawBody);

    if (!inbound) {
      return NextResponse.json({ status: "ignored" });
    }

    // In a full production deployment, the inbound message would trigger the claim processing service
    // and send back interactive WhatsApp template messages
    return NextResponse.json({ status: "received", senderId: inbound.senderId });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err.message },
      { status: 500 }
    );
  }
}
