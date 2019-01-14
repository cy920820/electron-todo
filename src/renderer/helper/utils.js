export function getLocal (key) {
  return JSON.parse(window.localStorage.getItem(key) || '[]')
}

export function setLocal (key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
