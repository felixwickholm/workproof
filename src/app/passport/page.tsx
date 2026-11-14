import { redirect } from "next/navigation";

/** The old name of "My work". */
export default function PassportPage() {
  redirect("/my-work");
}
