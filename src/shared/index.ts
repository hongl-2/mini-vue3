export const extend = Object.assign

export function warn(text: string) {
  console.warn(`[mini vue3 warn] ${text}`)
}

export function isObject(object) {
  return object !== null && typeof object === 'object'
}

export function hasChanged(val, newValue) {
  return !Object.is(val, newValue)
}
