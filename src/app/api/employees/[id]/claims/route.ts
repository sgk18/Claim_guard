import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const claims = db.getClaimsByEmployee(id);

    return NextResponse.json({
      success: true,
      data: claims,
      total: claims.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to fetch employee claims" } },
      { status: 500 }
    );
  }
}
