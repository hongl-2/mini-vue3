import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {

  const { shapeFlag } = vnode
  // 判断是组件类型还是 element 类型
  if(shapeFlag & ShapeFlags.ELEMENT) {
    // element 类型直接走处理元素的逻辑
    processElement(vnode, container)
  } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // component 类型走处理组件逻辑
    processComponent(vnode, container)
  }
}

// 处理元素分支
function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  // 创建当前分支节点
  const el = vnode.el = document.createElement(vnode.type)
  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }
  // 将当前分支节点挂载在父级节点上
  container.append(el)
}

// 递归处理子集
function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container)
  })
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

// 挂载组件流程
function mountComponent(initialVnode, container) {
  // 返回一个组件实例
  const instance = createComponentInstance(initialVnode)
  // 处理组件的setup逻辑
  setupComponent(instance) // 执行完以后会初始化instance setup 并且再instance上添加render方法
  // 将组件的render和组件的setup进行关联
  setupRenderEffect(instance, initialVnode, container)
}

// 将setup的值和render函数关联起来
function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  initialVnode.el = subTree.el
}
