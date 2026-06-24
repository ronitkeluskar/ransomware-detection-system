const AUTH_KEY = 'xenon_auth'

export function loadPersistedUser() {
  try {
    const fromLocal = localStorage.getItem(AUTH_KEY)
    if (fromLocal) {
      const { user } = JSON.parse(fromLocal)
      if (user && typeof user === 'object') return user
    }
    const fromSession = sessionStorage.getItem(AUTH_KEY)
    if (fromSession) {
      const { user } = JSON.parse(fromSession)
      if (user && typeof user === 'object') return user
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null
}

/** @param {boolean} rememberMe - true: survive app restart until logout */
export function saveSession(user, rememberMe) {
  const payload = JSON.stringify({ user, remember: rememberMe })
  if (rememberMe) {
    localStorage.setItem(AUTH_KEY, payload)
    sessionStorage.removeItem(AUTH_KEY)
  } else {
    sessionStorage.setItem(AUTH_KEY, payload)
    localStorage.removeItem(AUTH_KEY)
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(AUTH_KEY)
}
