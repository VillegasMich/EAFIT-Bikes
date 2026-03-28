import { NextResponse } from "next/server";

/**
 * Liveness / health probe for load balancers and orchestrators.
 * Does not check Firebase or Supabase — those belong in a separate readiness probe if needed.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "auth",
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
