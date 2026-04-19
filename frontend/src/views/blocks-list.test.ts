import { describe, it, expect } from "vitest";
import { fixture, html as tplHtml } from "@open-wc/testing-helpers";
import "./blocks-list";
import type { BlocksListView } from "./blocks-list";

describe("<blocks-list>", () => {
  it("renders an empty state when no blocks", async () => {
    const el = await fixture<BlocksListView>(tplHtml`<blocks-list .blocks=${[]}></blocks-list>`);
    expect(el.shadowRoot!.textContent).toMatch(/No blocks/i);
  });

  it("renders one row per block", async () => {
    const blocks = [
      {
        id: "b1",
        device_id: "d1",
        reason: "r",
        last_known_version: "1.0",
        update_entity_ids: [],
        unique_ids: [],
        fingerprint: { manufacturer: "", model: "", name: "" },
        created_at: "",
        last_scan_at: null,
        last_scan_status: "ok",
        status: "active",
      },
    ];
    const el = await fixture<BlocksListView>(
      tplHtml`<blocks-list .blocks=${blocks}></blocks-list>`,
    );
    const rows = el.shadowRoot!.querySelectorAll("[data-test='block-row']");
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toMatch(/r/);
  });

  it("dispatches remove event when remove button clicked", async () => {
    const blocks = [
      {
        id: "b1",
        device_id: "d1",
        reason: "r",
        last_known_version: null,
        update_entity_ids: [],
        unique_ids: [],
        fingerprint: { manufacturer: "", model: "", name: "" },
        created_at: "",
        last_scan_at: null,
        last_scan_status: "ok",
        status: "active",
      },
    ];
    const el = await fixture<BlocksListView>(
      tplHtml`<blocks-list .blocks=${blocks}></blocks-list>`,
    );

    const events: CustomEvent[] = [];
    el.addEventListener("block-remove", (e) => events.push(e as CustomEvent));

    (el.shadowRoot!.querySelector("[data-test='remove-btn']") as HTMLButtonElement).click();
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({ block_id: "b1" });
  });

  it("detail dialog shows the current installed version", async () => {
    const blocks = [
      {
        id: "b1",
        device_id: "d1",
        reason: "",
        last_known_version: "2.0.0",
        installed_version: "1.9.0",
        update_entity_ids: [],
        unique_ids: [],
        fingerprint: { manufacturer: "", model: "", name: "Dev" },
        created_at: "",
        last_scan_at: null,
        last_scan_status: "ok",
        status: "active",
      },
    ];
    const el = await fixture<BlocksListView>(
      tplHtml`<blocks-list .blocks=${blocks}></blocks-list>`,
    );
    const link = el.shadowRoot!.querySelector(".device-link") as HTMLElement;
    link.click();
    await el.updateComplete;

    const text = el.shadowRoot!.textContent ?? "";
    expect(text).toMatch(/Current version/);
    expect(text).toMatch(/1\.9\.0/);
    expect(text).toMatch(/Latest version seen/);
    expect(text).toMatch(/2\.0\.0/);
  });

  it("detail dialog shows 'unknown' current version when installed_version is null", async () => {
    const blocks = [
      {
        id: "b1",
        device_id: "d1",
        reason: "",
        last_known_version: "2.0.0",
        installed_version: null,
        update_entity_ids: [],
        unique_ids: [],
        fingerprint: { manufacturer: "", model: "", name: "Dev" },
        created_at: "",
        last_scan_at: null,
        last_scan_status: "ok",
        status: "active",
      },
    ];
    const el = await fixture<BlocksListView>(
      tplHtml`<blocks-list .blocks=${blocks}></blocks-list>`,
    );
    (el.shadowRoot!.querySelector(".device-link") as HTMLElement).click();
    await el.updateComplete;

    const rows = el.shadowRoot!.querySelectorAll(".detail-row");
    const currentRow = Array.from(rows).find((r) =>
      r.textContent?.includes("Current version"),
    );
    expect(currentRow).toBeTruthy();
    expect(currentRow!.textContent).toMatch(/unknown/);
  });

  it("detail dialog does not use a fixed desktop minimum width", async () => {
    const { BlocksListView } = await import("./blocks-list");
    const cssText = (BlocksListView as unknown as { styles: { cssText: string } }).styles.cssText;
    expect(cssText).not.toMatch(/min-width:\s*360px/);
    expect(cssText).not.toMatch(/min-width:\s*400px/);
  });
});
