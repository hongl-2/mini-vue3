import { mutableHandle, readonlyHandle } from './baseHandler'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandle)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandle)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}
