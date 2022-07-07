import { extend } from '../shared';

class ReactiveEffect {
  private readonly _fn: any
  public scheduler: any = null;
  deps: any[] = []
  active = true
  onStop?: () => void

  constructor(fn, scheduler) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    // 将此响应式依赖映射至全局 后续加入到依赖列表中
    activeEffect = this
    return this._fn()
  }
  stop() {
    if(this.active) {
      cleanupEffect(this)
      if(this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

export function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

const targetMap = new Map()
/**
 * 在获取target中的值时, 收集依赖于此对象数据的值并保存至targetMap中的depsMap中
 * 🌰: effect(() => newData => original.age + 1)
 * 获取original.age的值时 将 () => newData => original.age + 1 存储在targetMap中的depsMap中 以待后续变更值的执行
 * @param target
 * @param key
 */
export function track(target, key) {
  // target -> keys -> deps
  // 收集所有关于这个对象(target)的依赖
  let depsMap = targetMap.get(target)

  if(!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)

  if (!dep) {
    dep = new Set()
    // 收集所有关于这个键的依赖
    depsMap.set(key, dep)
  }
  if(!activeEffect) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}
/**
 * 在target中的值发生变化时, 去更新依赖于此target中的key的dep更新
 * 🌰: effect(() => newData => original.age + 1)
 * original.age更新时 去执行() => newData => original.age + 1动态更新 newData
 * @param target
 * @param key
 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

let activeEffect
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // _effect.onStop = options.onStop
  extend(_effect, options)
  // 运行当前的run
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  // 将当前effect实例挂载在runner方法上
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
