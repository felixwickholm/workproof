"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";

/** Shown when a screen fails to render. Nothing the person typed on other screens is lost. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.warn("Screen failed to render", error);
  }, [error]);

  return (
    <Screen
      title="This screen did not load"
      subtitle="Something went wrong on our side. Try again, or start from the first screen."
      bottom={<Button onClick={retry}>Try again</Button>}
    >
      <Button href="/" variant="secondary">
        Back to the start
      </Button>
    </Screen>
  );
}
