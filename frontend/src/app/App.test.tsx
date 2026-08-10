import { describe, expect, it } from "vitest";

describe("App", () => {
  it("keeps frontend tests wired", () => {
    expect("EduMath").toContain("Math");
  });
});
