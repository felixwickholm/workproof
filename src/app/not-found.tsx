import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";

export default function NotFound() {
  return (
    <Screen
      title="This page is not here"
      subtitle="The link may be old, or the task was taken down. Your proofs are safe."
      bottom={<Button href="/">Back to the start</Button>}
    >
      <Button href="/challenges" variant="secondary">
        See open challenges
      </Button>
    </Screen>
  );
}
