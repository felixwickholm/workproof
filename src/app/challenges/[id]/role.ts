/**
 * The role a task is for, from its published need ("ML engineer: Model evaluation, Data quality").
 * The skills after the colon are listed with their reasons below, so they are not repeated.
 * A need without a role (the general task) has none.
 */
export function roleOf(need: string): string | null {
  const colon = need.indexOf(":");
  if (colon <= 0) return null;
  const role = need.slice(0, colon).trim();
  return role || null;
}
