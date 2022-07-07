import { track, trigger } from './effect';
import { warn } from '../shared';

export function reactive(raw) {
  return new Proxy(raw, {
    get (target, key) {
      const res = Reflect.get(target, key)
      // 依赖收集
      track(target, key)
      return res
    },
    set (target, key, value) {
      const result = Reflect.set(target, key, value)
      // 触发依赖更新
      trigger(target, key)
      return result
    }
  })
}

export function readonly(raw) {
  return new Proxy(raw, {
    get (target, key) {
      const res = Reflect.get(target, key)
      // 依赖收集
      track(target, key)
      return res
    },
    set (target, key, value) {
      warn(`${key as string} is readonly, cannot been set, target:${target}`)
      return true
    }
  })
}
