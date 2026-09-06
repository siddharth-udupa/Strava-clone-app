/**
 * Lightweight GPX verification — runs cheap structural checks on the raw XML
 * string *before* the full parse, so obviously invalid files are rejected
 * without ever touching fast-xml-parser.
 *
 * This is NOT a GPX schema validator. It checks necessary conditions only:
 *   1. File size within limit
 *   2. <gpx root element present
 *   3. At least one <trkpt element present
 *   4. First <trkpt has plausible lat/lon attributes
 */

const MAX_GPX_SIZE = 10_000_000 // 10 MB

export type GpxVerificationResult =
  | { ok: true }
  | { ok: false; reason: string }

export function verifyGpx(xmlString: string): GpxVerificationResult {
  // 1. Size cap — O(1)
  if (xmlString.length > MAX_GPX_SIZE) {
    return {
      ok: false,
      reason: `File exceeds the maximum allowed size of ${MAX_GPX_SIZE / 1_000_000} MB`,
    }
  }

  // 2. Root <gpx element — only need to scan the first ~1 KB
  const head = xmlString.slice(0, 1024)
  if (!head.includes("<gpx")) {
    return {
      ok: false,
      reason: "Missing <gpx> root element — this does not appear to be a GPX file",
    }
  }

  // 3. At least one <trkpt element anywhere in the file
  const trkptIndex = xmlString.indexOf("<trkpt")
  if (trkptIndex === -1) {
    return {
      ok: false,
      reason: "No <trkpt> elements found — the GPX file contains no track points",
    }
  }

  // 4. First <trkpt has valid lat/lon — probe a small window around it
  const window = xmlString.slice(trkptIndex, trkptIndex + 200)
  const latMatch = window.match(/lat\s*=\s*["']([^"']+)["']/)
  const lonMatch = window.match(/lon\s*=\s*["']([^"']+)["']/)

  if (!latMatch || !lonMatch) {
    return {
      ok: false,
      reason: "First <trkpt> is missing lat/lon attributes",
    }
  }

  const lat = parseFloat(latMatch[1]!)
  const lon = parseFloat(lonMatch[1]!)

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return {
      ok: false,
      reason: "First <trkpt> has non-numeric lat/lon values",
    }
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return {
      ok: false,
      reason: `First <trkpt> has out-of-range coordinates (lat: ${lat}, lon: ${lon})`,
    }
  }

  return { ok: true }
}
