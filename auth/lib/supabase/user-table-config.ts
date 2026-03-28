/** Table that stores Firebase uid + extended profile (aligned with validate/register APIs). */
export function getUserTableConfig() {
  return {
    table: process.env.SUPABASE_USER_TABLE ?? "users",
    idColumn: process.env.SUPABASE_USER_ID_COLUMN ?? "id",
    roleColumn: process.env.SUPABASE_USER_ROLE_COLUMN ?? "role",
    emailColumn: process.env.SUPABASE_USER_EMAIL_COLUMN ?? "email",
  };
}
