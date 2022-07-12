import { createVNode } from './vnode'
import { render } from './render'

// 暴露出createApp 入口方法
export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 组件先转 vnode  后续所有的逻辑都基于 vnode 处理
      const vnode = createVNode(rootComponent)
      // 进行渲染操作
      render(vnode, rootContainer)
    }
  }
}

