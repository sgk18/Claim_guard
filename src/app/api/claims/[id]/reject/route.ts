import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { managerId = "mgr_priya_01", notes } = body;

    const claim = db.getClaimById(id);
    if (!claim) {
      return NextResponse.json(
        { success: false, error: { message: `Claim ${id} not found` } },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    claim.status = "REJECTED";
    claim.managerId = managerId;
    claim.managerNotes = notes || "Rejected by finance manager";
    claim.updatedAt = now;

    db.addAuditLog(id, {
      id: `aud_${Date.now()}_rej`,
      claimId: id,
      actorType: "MANAGER",
      actorId: managerId,
      action: "CLAIM_REJECTED",
      details: { notes: claim.managerNotes },
      createdAt: now,
    });

    db.saveClaim(claim);

    return NextResponse.json({
      success: true,
      data: claim,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to reject claim" } },
      { status: 500 }
    );
  }
}
