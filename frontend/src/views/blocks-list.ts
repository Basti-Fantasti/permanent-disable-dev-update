import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Block } from "../api-client";

@customElement("blocks-list")
export class BlocksListView extends LitElement {
  @property({ attribute: false }) blocks: Block[] = [];

  static styles = css`
    :host { display: block; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--divider-color, #ccc); }
    .empty { padding: 16px; color: var(--secondary-text-color, #666); }
    button.remove { color: var(--error-color, #d33); }
  `;

  render() {
    if (!this.blocks.length) {
      return html`<div class="empty">No blocks. Use "Add block" to create one.</div>`;
    }
    return html`
      <table>
        <thead>
          <tr>
            <th>Device</th><th>Reason</th><th>Last known version</th>
            <th>Last scan</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${this.blocks.map(
            (b) => html`
              <tr data-test="block-row">
                <td>${b.device_id}</td>
                <td>${b.reason || "—"}</td>
                <td>${b.last_known_version ?? "unknown"}</td>
                <td>${b.last_scan_at ?? "never"}</td>
                <td>${b.status}</td>
                <td>
                  <button
                    class="remove"
                    data-test="remove-btn"
                    @click=${() => this._emitRemove(b.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  }

  private _emitRemove(blockId: string) {
    this.dispatchEvent(
      new CustomEvent("block-remove", {
        detail: { block_id: blockId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
