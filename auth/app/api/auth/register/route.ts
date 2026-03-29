import { NextResponse } from "next/server";
import { verifyTokenFromBody } from "@/lib/verify-firebase-token";
import { getServiceSupabase } from "@/lib/supabase/service";
import { getUserTableConfig } from "@/lib/supabase/user-table-config";
import { buildProfileUpsertRow } from "@/lib/types/profile";

type RegisterBody = {
  token?: string;
  idToken?: string;
  role?: string;
};

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const idToken =
    typeof body.token === "string"
      ? body.token
      : typeof body.idToken === "string"
        ? body.idToken
        : null;
  const role = typeof body.role === "string" ? body.role : null;

  if (!idToken || !role) {
    return NextResponse.json(
      {
        error:
          "Expected JSON body with { token, role } (token = Firebase ID token)",
      },
      { status: 400 },
    );
  }

  const auth = await verifyTokenFromBody(idToken);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const { uid, email } = auth;

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch {
    return NextResponse.json(
      { error: "Server is not configured for Supabase" },
      { status: 500 },
    );
  }

  const { table } = getUserTableConfig();
  const row = buildProfileUpsertRow({
    id: uid,
    role,
    ...(email ? { email } : {}),
  });

  const { error } = await supabase.from(table).insert(row);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User already registered for this Firebase account" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ registered: true, uid });
}
