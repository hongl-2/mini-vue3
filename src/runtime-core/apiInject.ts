import { getCurrentInstance } from './component'

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    // 只在初始化的时候执行
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }
}


export function inject(key) {
  const currentInstance: any = getCurrentInstance()
  const parentProvides = currentInstance.parent.provides
  return parentProvides[key]
}
