import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Block } from "../api-client";

@customElement("blocks-list")
export class BlocksListView extends LitElement {
  @property({ attribute: false }) blocks: Block[] = [];
  @state() private _detailBlock: Block | null = null;

  static styles = css`
    :host { display: block; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--divider-color, #ccc); }
    .empty { padding: 16px; color: var(--secondary-text-color, #666); }
    button.remove { color: var(--error-color, #d33); }
    .device-link {
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      text-decoration: none;
    }
    .device-link:hover { text-decoration: underline; }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: grid;
      place-items: center;
      padding: 16px;
      box-sizing: border-box;
      z-index: 10;
    }
    .detail-dialog {
      background: var(--card-background-color, white);
      border-radius: 8px;
      padding: 20px;
      box-sizing: border-box;
      width: min(500px, calc(100vw - 32px));
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 32px);
      overflow: auto;
    }
    .detail-dialog h3 { margin: 0 0 12px; }
    .detail-row {
      display: flex;
      gap: 16px;
      padding: 6px 0;
      border-bottom: 1px solid var(--divider-color, #eee);
    }
    .detail-label {
      font-weight: 600;
      flex: 0 0 140px;
      color: var(--secondary-text-color, #666);
    }
    .detail-value { word-break: break-all; flex: 1; }
    .detail-actions { margin-top: 16px; display: flex; justify-content: flex-end; }
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
                <td>
                  <span
                    class="device-link"
                    @click=${() => (this._detailBlock = b)}
                    title="Click for details"
                  >${this._deviceDisplayName(b)}</span>
                </td>
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
      ${this._detailBlock ? this._renderDetail(this._detailBlock) : nothing}
    `;
  }

  private _deviceDisplayName(b: Block): string {
    const name = b.fingerprint?.name;
    return name || b.device_id;
  }

  private _renderDetail(b: Block) {
    const rows: [string, string][] = [
      ["Name", b.fingerprint?.name || "—"],
      ["Manufacturer", b.fingerprint?.manufacturer || "—"],
      ["Model", b.fingerprint?.model || "—"],
      ["Device ID", b.device_id],
      ["Status", b.status],
      ["Reason", b.reason || "—"],
      ["Current version", b.installed_version ?? "unknown"],
      ["Latest version seen", b.last_known_version ?? "unknown"],
      ["Last scan", b.last_scan_at ?? "never"],
      ["Created", b.created_at],
    ];
    return html`
      <div class="overlay" @click=${() => (this._detailBlock = null)}>
        <div class="detail-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <h3>${b.fingerprint?.name || b.device_id}</h3>
          ${rows.map(
            ([label, value]) => html`
              <div class="detail-row">
                <span class="detail-label">${label}</span>
                <span class="detail-value">${value}</span>
              </div>
            `,
          )}
          <div class="detail-actions">
            <button @click=${() => (this._detailBlock = null)}>Close</button>
          </div>
        </div>
      </div>
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
