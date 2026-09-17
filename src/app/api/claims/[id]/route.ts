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

    // If duplicate signal exists, find the matched historical claim for split comparison
    let matchedClaim = null;
    const dupSignal = claim.riskAssessment?.signals.find(
      (s) => s.type === "DUPLICATE_RECEIPT"
    );
    if (dupSignal?.metadata?.matchedClaimId) {
      matchedClaim = db.getClaimById(dupSignal.metadata.matchedClaimId);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...claim,
        matchedClaim,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to fetch claim" } },
      { status: 500 }
    );
  }
}
