import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body?.code;

    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json(
        { success: false, error: { message: "Company code is required." } },
        { status: 400 }
      );
    }

    const normalizedCode = rawCode.trim().toUpperCase();
    const validCode = (db.company.code || "APEX-2026").trim().toUpperCase();

    if (normalizedCode !== validCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Invalid company code "${rawCode}". Please enter active company code "${validCode}".`,
          },
        },
        { status: 400 }
      );
    }

    const employee = db.getEmployeeById("emp_rahul_102");

    return NextResponse.json({
      success: true,
      data: {
        company: db.company,
        employee,
        manager: db.manager,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      companyName: db.company.name,
      companyCode: db.company.code || "APEX-2026",
      employeeName: "Rahul Kumar",
      managerName: db.manager?.name || "Priya Sharma",
    },
  });
}
