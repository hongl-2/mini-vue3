import { createVNode } from './vnode'
import { render } from './render'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 组件先转 vnode  后续所有的逻辑都基于 vnode 处理
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}

