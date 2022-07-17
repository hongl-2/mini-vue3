import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Text, Fragment } from './vnode'
import { createAppAPI } from './createApp'

export function createRenderer (options) {

  const {
    createElement,
    patchProp,
    insert
  } = options

  function render(vnode, container) {
    // patch
    patch(vnode, container, null)
  }

  function patch(vnode, container, parentComponent) {
    const { shapeFlag, type } = vnode

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        // 判断是组件类型还是 element 类型
        if(shapeFlag & ShapeFlags.ELEMENT) {
          // element 类型直接走处理元素的逻辑
          processElement(vnode, container, parentComponent)
        } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // component 类型走处理组件逻辑
          processComponent(vnode, container, parentComponent)
        }
        break
    }
  }

  // 处理slot中的children (fragment)
  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent)
  }

  // 处理文本节点
  function processText(vnode, container) {
    const { children } = vnode
    const textNode = vnode.el = document.createTextNode(children)
    container.append(textNode)
  }

  // 处理元素分支
  function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  function mountElement(vnode, container, parentComponent) {
    // 创建当前分支节点
    // const el = vnode.el = document.createElement(vnode.type)
    const el = vnode.el = createElement(vnode.type)
    const { children, shapeFlag, props } = vnode

    // 通过位运算的 & 查询children 是否是 TEXT_CHILDREN 类型
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
      // 通过位运算的 & 查询children 是否是 ARRAY_CHILDREN 类型
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    // 设置元素的属性
    for(const key in props) {
      const value = props[key]
      patchProp(el, key, value)
    }

    // 将当前分支节点挂载在父级节点上
    insert(el, container)
  }

  // 递归处理子集
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(v, container, parentComponent)
    })
  }

  function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent)
  }

  // 挂载组件流程
  function mountComponent(initialVnode, container, parentComponent) {
    // 返回一个组件实例
    const instance = createComponentInstance(initialVnode, parentComponent)
    // 处理组件的setup逻辑
    setupComponent(instance) // 执行完以后会初始化instance setup 并且再instance上添加render方法
    // 将组件的render和组件的setup进行关联
    setupRenderEffect(instance, initialVnode, container)
  }

  // 将setup的值和render函数关联起来
  function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container, instance)
    initialVnode.el = subTree.el
  }

  return {
    createApp: createAppAPI(render)
  }
}

