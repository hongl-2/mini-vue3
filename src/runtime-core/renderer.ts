import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Text, Fragment } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity'
import { EMPTY_OBJ } from '../shared'
import { shouldUpdateComponent } from './componentUpdateUtils'

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
    patch(null, vnode, container, null, null)
  }
  // n1 为老的vnode
  // n2 为新的vnode
  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        // 判断是组件类型还是 element 类型
        if(shapeFlag & ShapeFlags.ELEMENT) {
          // element 类型直接走处理元素的逻辑
          processElement(n1, n2, container, parentComponent, anchor)
        } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // component 类型走处理组件逻辑
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  // 处理slot中的children (fragment)
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  // 处理文本节点
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  // 处理元素分支
  function processElement(n1, n2, container, parentComponent, anchor) {
    // 如果没有老的vnode 可以直接进行元素挂载
    if(!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function mountElement(vnode, container, parentComponent, anchor) {
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
      mountChildren(vnode.children, el, parentComponent, anchor)
    }

    // 设置元素的属性
    for(const key in props) {
      const value = props[key]
      hostPatchProp(el, key, null, value)
    }
    // 真正将元素挂载到dom树上的操作, 也是最终的操作
    // 将当前分支节点挂载在父级节点上
    hostInsert(el, container, anchor)
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    // 对比props
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = n2.el = n1.el

    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  /**
   * 对比新旧虚拟node的children
   * @param el 当前节点的el
   * @param n1 老的vnode
   * @param n2 新的vnode
   * @param container 当前节点el的父级
   * @param parentComponent 父级组件
   * @param anchor 锚点
   */
  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        hostSetElementText(container, c2)
      }
    } else { // 新的array
      if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 新的是array 老的是text
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {  // 新的是array 老的是array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }

  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    let l1 = c1.length
    let l2 = c2.length
    let i = 0 // 指针1: 针对nodeList的前端 从索引为0开始
    let e1 = l1 - 1 // 指针2: c1 的nodeList的后端 从索引为c1的最后一位开始
    let e2 = l2 - 1 // 指针3: c2 的nodeList的后端 从索引为c2的最后一位开始

    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 从前端开始比对, 一直到比对到不同的节点为止, 相同时指针1向后走一步
    while(i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break;
      }
      i++
    }

    // 从后端开始比对, 一直到比对到不同的节点为止, 相同时e1, e2 各往前走一步
    // while(e1 >= i && e2 >= i) {
    while(i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break;
      }
      e1--
      e2--
    }
    if (i > e1) {
      // 前面或者后面都一样 且新的更长的情况
      if(i <= e2) {
        // anchor
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        // 默认添加是添加在树的最后, 现在需要找到添加的具体位置(即锚点)
        while(i <= e2) {
          // 参数n1为null时后续触发insert的操作
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if(i > e2) {
      if(i <= e1) {
        while(i <= e1) {
          hostRemove(c1[i].el)
          i++
        }
      }
    } else {
      // 对比中间的
      let s1 = i
      let s2 = i

      const toBePatched = e2 - s2 + 1
      let patched = 0
      const keyToNewIndexMap = new Map()
      let moved = false
      // 在新老进行对比时记录最大无需移动的新索引  一旦后续对比时有一个小于这个数字则代表需要进行移动操作,并且将moved 设为true
      let maxNewIndexSoFar = 0
      // newIndex -> oldIndex 记录节点在新node中与在旧node中的索引映射表
      const newIndexToOldIndexMap = new Array(toBePatched)
      // 这里默认赋值为0, 若为0则代表新node不存在旧node中(**即为新增的**) 所以后续记录索引时需要 + 1
      for(let k = 0; k < toBePatched; k++)  newIndexToOldIndexMap[k] = 0

      // 建立新node的 key-> index 的映射对象, 后续通过对比key获取到新的node的索引
      for (let k = s2; k <= e2; k++) {
        const nextChild = c2[k]
        keyToNewIndexMap.set(nextChild.key, k)
      }

      // 遍历旧node 去查询是否在新node中存在
      for (let k = s1; k <= e1; k++) {
        const prevChild = c1[k]

        if(patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        let newIndex
        // 查询旧node是否存在新node中
        if(prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for(let j = s2; j <= e2; j++) {
            const nextChild = c2[j]
            if(isSameVNodeType(prevChild, nextChild)){
              newIndex = j
              break
            }
          }
        }
          // newIndex 等于 undefined 则表示在老的节点不存在新的里面
        if(newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          if(newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          // 新的在老的里面
          newIndexToOldIndexMap[newIndex - s2] = k + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }
      // 获取到的最长递增子序列
      // 优化: 如果上述得到无需移动的话则不执行这一步
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1
      for (let k = toBePatched - 1; k >= 0; k--) {
        const nextIndex = k + s2 // 下一个要处理的新node的索引
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null
        if(newIndexToOldIndexMap[k] === 0) {
          // 为0时是新增的节点, 执行新增逻辑
          patch(null, nextChild, container, parentComponent, anchor)
          // 如果上述得到是moved为true 则将相对应的节点进行移动操作(没错 insertBefore也可以执行移动的操作, 如果操作的节点已经在当前元素的子集里面)
        } else if(moved) {
          // 在最长递增子序列里面的对应缩索引的节点是无需移动的
          if (j < 0 || k !== increasingNewIndexSequence[j]) {
            // 移动下一个要处理的节点到锚点之前
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
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
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    // 如果没有老的vnode 可以直接进行组件挂载
    if(!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }

  }

  // 挂载组件流程
  function mountComponent(initialVnode, container, parentComponent, anchor) {
    // 返回一个组件实例
    const instance = initialVnode.component = createComponentInstance(initialVnode, parentComponent)
    // 处理组件的setup逻辑
    setupComponent(instance) // 执行完以后会初始化instance setup 并且再instance上添加render方法
    // 将组件的render和组件的setup进行关联
    setupRenderEffect(instance, initialVnode, container, anchor)
  }

  function updateComponent(n1, n2) {
    // 获取vnode上的组件实例信息, 并将老的vnode的组件实例赋值给新的vnode的组件实例上
    const instance = n2.component = n1.component

    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  // 将setup的值和render函数关联起来
  function setupRenderEffect(instance, initialVnode, container, anchor) {
    // 次数需要分清楚是初始化还是更新流程
    instance.update = effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        // 将subtree存储在实例上
        const subTree = instance.subTree = instance.render.call(proxy)
        patch(null, subTree, container, instance, anchor)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('进入到更新逻辑')
        console.log('更新逻辑的实例对象instance: ', instance)
        const { proxy, next, vnode } = instance
        if(next) {
          next.el = vnode.el
          updateComponentPerRender(instance, next)
        }
        // 将subtree存储在实例上
        const subTree = instance.render.call(proxy)
        const prevTree = instance.subTree
        instance.subTree = subTree
        patch(prevTree, subTree, container, instance, anchor)
        // initialVnode.el = subTree.el
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

function updateComponentPerRender (instance, nextVNode) {
  // 在更新前先改变实例中的虚拟node以及props信息
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}


// 获取最长递增子序列
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
