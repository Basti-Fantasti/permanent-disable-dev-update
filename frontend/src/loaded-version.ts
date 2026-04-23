/**
 * Parse the `v` query parameter out of a module URL.
 *
 * The backend registers panel.js with `?v=<manifest-version>` so the loaded
 * bundle can learn its own version from `import.meta.url`. Returns null when
 * the parameter is missing, empty, or the URL is malformed.
 */
export function parseLoadedVersion(url: string): string | null {
  try {
    const value = new URL(url).searchParams.get("v");
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export const LOADED_VERSION: string | null = parseLoadedVersion(import.meta.url);
