import { ShapeFlags } from '../shared/ShapeFlags'
import { isObject } from '../shared'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export {
  createVNode as createElementVNode
}

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key: props && props.key,
    el: null,
    shapeFlag: getShapeFlag(type),
    component: null
  }
  // 给vnode添加shapeFlag
  if(typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if(isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}

// 给vnode 初始化 shapeFlag
function getShapeFlag(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

