/** Same-origin API (desktop + production) or Vite dev proxy (/api → backend). */
export function apiUrl(path) {
  if (path.startsWith('http')) return path
  return path.startsWith('/') ? path : `/${path}`
}

export function wsScanUrl() {
  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${scheme}//${window.location.host}/api/scan/ws`
}
