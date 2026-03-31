import { NextResponse } from "next/server";
import { verifyTokenFromBody } from "@/lib/verify-firebase-token";
import { getServiceSupabase } from "@/lib/supabase/service";
import { getUserTableConfig } from "@/lib/supabase/user-table-config";
import { readStoredRoleFromRow } from "@/lib/types/profile";

type ValidateBody = {
  token?: string;
  idToken?: string;
  role?: string;
};

export async function POST(request: Request) {
  let body: ValidateBody;
  try {
    body = (await request.json()) as ValidateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const idToken =
    typeof body.token === "string"
      ? body.token
      : typeof body.idToken === "string"
        ? body.idToken
        : null;

  if (!idToken) {
    return NextResponse.json(
      {
        error:
          "Expected JSON body with { token } (token = Firebase ID token)",
      },
      { status: 400 },
    );
  }

  const auth = await verifyTokenFromBody(idToken);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const { uid } = auth;

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch {
    return NextResponse.json(
      { error: "Server is not configured for Supabase" },
      { status: 500 },
    );
  }

  const { table, idColumn, roleColumn } = getUserTableConfig();

  const { data, error } = await supabase
    .from(table)
    .select(roleColumn)
    .eq(idColumn, uid)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Supabase query failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "User not found for this Firebase uid" },
      { status: 404 },
    );
  }
  return NextResponse.json({ valid: true, uid });
}
