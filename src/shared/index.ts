export * from './toDisplayString'

export const extend = Object.assign

export const EMPTY_OBJ = {}

export function warn(text: string) {
  console.warn(`[mini vue3 warn] ${text}`)
}

export function isObject(object) {
  return object !== null && typeof object === 'object'
}

export function isString(value): value is string {
  return typeof value === 'string'
}

export function hasChanged(val, newValue) {
  return !Object.is(val, newValue)
}

export function hasOwn(val, key) {
  return Object.prototype.hasOwnProperty.call(val, key)
}
// 将 add-foo 处理成 addFoo
export function camelize(str: string) {
  return str.replace(/-(\w)/g, (_, $1) => {
    return $1 ? $1.toUpperCase() : ''
  })
}
// 将 addFoo 处理成 AddFoo
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const isArray = Array.isArray
export const isFunc = (fn) => typeof fn === 'function'

export const isOn = (key) => /^on[A-Z]/.test(key)

