interface Placed {
  placesLeft: number;
  mine: boolean;
}

/**
 * The list in three groups, each keeping the server's order: challenges you can start, challenges that
 * have all their answers, and challenges you already did. Nothing is ranked for the person.
 */
export function arrangeTasks<T extends Placed>(tasks: readonly T[]): { open: T[]; full: T[]; sent: T[] } {
  return {
    open: tasks.filter((t) => !t.mine && t.placesLeft > 0),
    full: tasks.filter((t) => !t.mine && t.placesLeft === 0),
    sent: tasks.filter((t) => t.mine),
  };
}
