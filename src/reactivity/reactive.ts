import { mutableHandle, readonlyHandle } from './baseHandler'

export function reactive(raw) {
  return createActiveObject(raw, mutableHandle)

}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandle)
}

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}
