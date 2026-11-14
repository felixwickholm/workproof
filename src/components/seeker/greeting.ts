/** "Good morning" before noon, "Good afternoon" until 18:00, "Good evening" after; from the visitor's own clock. */
export function dayGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * The home's h1: "Good morning, Olena. Kaari Home Care wants to meet you." Without a name yet:
 * "Good morning. Fourteen tasks are open today."
 */
export function greetingLine(firstName: string | null, fact: string, hour: number): string {
  const hello = dayGreeting(hour);
  return firstName ? `${hello}, ${firstName}. ${fact}` : `${hello}. ${fact}`;
}

const counted = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The grey line under the greeting: "3 proofs handed in · 2 read by a person · 2 written reasons · 1 invitation". */
export function homeCountLine(counts: { proofs: number; readByPeople: number; writtenAnswers: number; invitations: number }): string {
  return [
    `${counted(counts.proofs, "proof", "proofs")} handed in`,
    `${counts.readByPeople} read by a person`,
    counted(counts.writtenAnswers, "written reason", "written reasons"),
    counted(counts.invitations, "invitation", "invitations"),
  ].join(" · ");
}
