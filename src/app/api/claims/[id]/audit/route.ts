import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const claim = db.getClaimById(id);

    if (!claim) {
      return NextResponse.json(
        { success: false, error: { message: `Claim ${id} not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: claim.auditLogs || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to fetch audit trail" } },
      { status: 500 }
    );
  }
}
