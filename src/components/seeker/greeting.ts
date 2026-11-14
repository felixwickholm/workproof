/** The home's h1: "Hi Mikko. What work do you want?", or the question alone before the person has given a name. */
export function greetingLine(firstName: string | null): string {
  return firstName ? `Hi ${firstName}. What work do you want?` : "What work do you want?";
}

/** One short line when a company waits for an answer, so the home can point to My work without the whole card. */
export function inviteNotice(invitations: readonly { companyName: string; status: string }[]): string | null {
  const waiting = invitations.find((i) => i.status === "invited");
  return waiting ? `${waiting.companyName} wants to meet you.` : null;
}
