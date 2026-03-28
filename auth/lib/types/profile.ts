import { getUserTableConfig } from "@/lib/supabase/user-table-config";

/**
 * Logical shape of a user profile row in Supabase (Firebase uid + app fields).
 * Default DB columns: `id` (Firebase uid), `role`, optional `email` — change with SUPABASE_USER_*_COLUMN.
 */
export type ProfileRow = {
  id: string;
  role: string;
  email?: string | null;
};

/** Values we persist on register, before mapping to actual column names. */
export type ProfileUpsertInput = {
  id: string;
  role: string;
  email?: string;
};

export function buildProfileUpsertRow(
  input: ProfileUpsertInput,
): Record<string, string> {
  const { idColumn, roleColumn, emailColumn } = getUserTableConfig();
  const row: Record<string, string> = {
    [idColumn]: input.id,
    [roleColumn]: input.role,
  };
  if (emailColumn && input.email) {
    row[emailColumn] = input.email;
  }
  return row;
}

export function readStoredRoleFromRow(
  data: unknown,
  roleColumn: string,
): string | undefined {
  const row = data as Record<string, unknown>;
  const value = row[roleColumn];
  return typeof value === "string" ? value : undefined;
}
