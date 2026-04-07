import { NextResponse } from "next/server";

import { errorStatus, requireAdmin } from "@/lib/adminAuth";
import { getAdminDashboardData } from "@/lib/adminDashboard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const dashboard = await getAdminDashboardData();
    return NextResponse.json(dashboard);
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
