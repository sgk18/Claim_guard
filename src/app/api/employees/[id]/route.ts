import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = db.getEmployeeById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: { message: `Employee ${id} not found` } },
        { status: 404 }
      );
    }

    const activeTrip = db.getActiveTripForEmployee(id);

    return NextResponse.json({
      success: true,
      data: {
        ...employee,
        activeTrip,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to fetch employee" } },
      { status: 500 }
    );
  }
}
