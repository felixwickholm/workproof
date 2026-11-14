/** "Good morning" before noon, "Good afternoon" until 18:00, "Good evening" after; from the visitor's own clock. */
export function dayGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * The home's h1: "Good evening, Olena. Kaari Home Care invited you." Without a name yet:
 * "Good evening. 12 challenges are open."
 */
export function greetingLine(firstName: string | null, fact: string, hour: number): string {
  const hello = dayGreeting(hour);
  return firstName ? `${hello}, ${firstName}. ${fact}` : `${hello}. ${fact}`;
}

/** Today's one fact: an open invitation first, otherwise how many challenges a person can start. */
export function homeFact(invitations: readonly { companyName: string; status: string }[], openChallenges: number): string {
  const waiting = invitations.find((i) => i.status === "invited");
  if (waiting) return `${waiting.companyName} invited you.`;
  if (openChallenges === 0) return "No challenge is open right now.";
  return `${openChallenges} ${openChallenges === 1 ? "challenge is" : "challenges are"} open.`;
}
