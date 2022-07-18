import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Text, Fragment } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity'
import { EMPTY_OBJ } from '../shared'

export function createRenderer (options) {

  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    setElementText: hostSetElementText,
    remove: hostRemove
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
    mountChildren(n2.children, container, parentComponent)
  }

  // 处理文本节点
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  // 处理元素分支
  function processElement(n1, n2, container, parentComponent) {
    // 如果没有老的vnode 可以直接进行元素挂载
    if(!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function mountElement(vnode, container, parentComponent) {
    // 创建当前分支节点
    // const el = vnode.el = document.createElement(vnode.type)
    const el = vnode.el = hostCreateElement(vnode.type)
    const { children, shapeFlag, props } = vnode

    // 通过位运算的 & 查询children 是否是 TEXT_CHILDREN 类型
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
      // 通过位运算的 & 查询children 是否是 ARRAY_CHILDREN 类型
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // todo 这一块是改变 container的时机
      mountChildren(vnode.children, el, parentComponent)
    }

    // 设置元素的属性
    for(const key in props) {
      const value = props[key]
      hostPatchProp(el, key, null, value)
    }
    // 真正将元素挂载到dom树上的操作, 也是最终的操作
    // 将当前分支节点挂载在父级节点上
    hostInsert(el, container)
  }

  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)
    // 对比props
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = n2.el = n1.el

    patchChildren(el, n1, n2, container, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  /**
   * 对比新旧虚拟node的children
   * @param el 当前节点的el
   * @param n1 老的vnode
   * @param n2 新的vnode
   * @param container 当前节点el的父级
   * @param parentComponent 父级组件
   */
  function patchChildren(el, n1, n2, container, parentComponent) {
    console.log('patchChildren el', el)
    console.log('patchChildren container', container)
    console.log('patchChildren parentComponent', parentComponent)
    const prevShapeFlag = n1.shapeFlag
    const nextShapeFlag = n2.shapeFlag

    const c1 = n1.children
    const c2 = n2.children
    // 1. 老的是 text 新的是 text
    // 2. 老的是 text 新的是 array
    // 3. 老的是 array 新的是 text
    // 4. 老的是 array 新的是 array
    if(nextShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 新的是text
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {  // 新的是text 老的是array
        unmountChildren(c1)
      }
      if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {  // 新的是text 老的是text
        hostSetElementText(el, c2)
      }
    } else { // 新的array
      if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 新的是array 老的是text
        hostSetElementText(el, '')
        mountChildren(c2, container, parentComponent)
      } else {  // 新的是array 老的是text
        c1.forEach(item1 => {
          c2.forEach(item2 => {
            patchChildren(item1.el, item1, item2, n2.el, parentComponent)
          })
        })
      }
    }
    // if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 1. 老的是 text 新的是 text
    //   if(nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
    //     hostSetElementText(el, c2)
    //   } else if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 2. 老的是 text 新的是 array
    //     unmountChildren(c1, container, parentComponent)
    //     hostSetElementText(el, c2)
    //
    //   }
    // }
  }

  // 删除所有的子节点
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      // el 为当前节点
      const el = children[i].el
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    // 直接遍历新的props对象
    for(const key in newProps) {
      const prevProp = oldProps[key]
      const nextProp = newProps[key]
      // 前后不相等时 (修改)
      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp)
      }
    }
    if(oldProps !== EMPTY_OBJ) {
      for(const key in oldProps) {
        if(!(key in newProps)) {
          hostPatchProp(el, key, null, null)
        }
      }
    }
  }

  // 递归处理子集
  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
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
        const subTree = instance.render.call(proxy)
        const prevTree = instance.subTree
        instance.subTree = subTree
        patch(prevTree, subTree, container, instance)
        // initialVnode.el = subTree.el
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

