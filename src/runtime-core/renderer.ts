import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Text, Fragment } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity'

export function createRenderer (options) {

  const {
    createElement,
    patchProp,
    insert
  } = options

  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null)
  }
  // n1 为老的vnode
  // n2 为新的vnode
  function patch(n1, n2, container, parentComponent) {
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        // 判断是组件类型还是 element 类型
        if(shapeFlag & ShapeFlags.ELEMENT) {
          // element 类型直接走处理元素的逻辑
          processElement(n1, n2, container, parentComponent)
        } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // component 类型走处理组件逻辑
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  // 处理slot中的children (fragment)
  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  // 处理文本节点
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  // 处理元素分支
  function processElement(n1, n2, container, parentComponent) {
    if(!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
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

  function patchElement(n1, n2, container) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
  }

  // 递归处理子集
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent)
    })
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
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
    // 次数需要分清楚是初始化还是更新流程
    effect(() => {
      if (!instance.isMounted) {
        console.log('初始化')
        const { proxy } = instance
        // 将subtree存储在实例上
        const subTree = instance.subTree = instance.render.call(proxy)
        patch(null, subTree, container, instance)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('更新')
        const { proxy } = instance
        // 将subtree存储在实例上
        const subTree = instance.subTree = instance.render.call(proxy)
        const prevTree = instance.subTree
        patch(prevTree, subTree, container, instance)
        // initialVnode.el = subTree.el
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

