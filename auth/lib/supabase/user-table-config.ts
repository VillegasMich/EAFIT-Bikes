/** Supabase user profile table. */
const USER_TABLE = "users";
const USER_ID_COLUMN = "id";
const USER_ROLE_COLUMN = "role";
const USER_EMAIL_COLUMN = "email";

export function getUserTableConfig() {
  return {
    table: USER_TABLE,
    idColumn: USER_ID_COLUMN,
    roleColumn: USER_ROLE_COLUMN,
    emailColumn: USER_EMAIL_COLUMN,
  };
}
