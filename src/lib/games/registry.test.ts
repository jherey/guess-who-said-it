import { describe, it, expect } from "vitest";
import { getAvailableGames, type GameRegistry } from "./registry";
import { makeMeta } from "@/test-utils/fixtures";

describe("getAvailableGames", () => {
  it("returns only entries whose status is 'available'", () => {
    const registry: GameRegistry = {
      "alpha": { meta: makeMeta({ status: "available" }) },
      "beta": { meta: makeMeta({ status: "coming-soon" }) },
      "gamma": { meta: makeMeta({ status: "available" }) },
    };

    const available = getAvailableGames(registry);

    expect(available.map(([key]) => key).sort()).toEqual(["alpha", "gamma"]);
  });

  it("returns an empty array when no games are available", () => {
    const registry: GameRegistry = {
      "soon-1": { meta: makeMeta({ status: "coming-soon" }) },
      "soon-2": { meta: makeMeta({ status: "coming-soon" }) },
    };

    expect(getAvailableGames(registry)).toEqual([]);
  });
});
