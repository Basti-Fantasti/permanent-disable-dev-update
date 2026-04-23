import { describe, it, expect } from "vitest";
import { parseLoadedVersion } from "./loaded-version";

describe("parseLoadedVersion", () => {
  it("returns the v query parameter when present", () => {
    expect(parseLoadedVersion("http://ha.local/update_blocklist/panel.js?v=1.0.3")).toBe("1.0.3");
  });

  it("returns null when the v parameter is absent", () => {
    expect(parseLoadedVersion("http://ha.local/update_blocklist/panel.js")).toBeNull();
  });

  it("returns null when the v parameter is empty", () => {
    expect(parseLoadedVersion("http://ha.local/update_blocklist/panel.js?v=")).toBeNull();
  });

  it("returns null for a malformed URL", () => {
    expect(parseLoadedVersion("not a url")).toBeNull();
  });
});
