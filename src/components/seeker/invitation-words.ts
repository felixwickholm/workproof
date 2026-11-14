/** "Meet at Table 2" from a slot such as "Sat 13:15, Table 2"; just "Meet" while the time is still to be agreed. */
export function meetLabel(slot: string): string {
  const table = /Table \d+/.exec(slot)?.[0];
  return table ? `Meet at ${table}` : "Meet";
}

/** The line under the invitation's buttons: what accepting changes, and for whom. */
export function acceptLine(companyName: string): string {
  return `Accepting shows your name to ${companyName} only.`;
}

/** After accepting: the meeting starts from the work, so the person knows what to bring. */
export function bringLine(reviewer: string): string {
  return `Bring your thinking, not a script: ${reviewer} will ask you to walk through one choice and change one constraint.`;
}
