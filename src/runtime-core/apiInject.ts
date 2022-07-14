import { getCurrentInstance } from './component'
import { isFunc } from '../shared'

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    // 处理边缘case 当为最外层组件时:
    if(currentInstance.parent) {
      const parentProvides = currentInstance.parent.provides
      // 只在初始化的时候执行
      if (provides === parentProvides) {
        provides = currentInstance.provides = Object.create(parentProvides)
      }
    }
    provides[key] = value
    console.log(currentInstance)
  }
}


export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance()
  const parentProvides = currentInstance.parent.provides
  if(!parentProvides[key]) {
    if(isFunc(defaultValue)) {
      return defaultValue()
    } else {
      return defaultValue
    }
  }
  return parentProvides[key]
}
