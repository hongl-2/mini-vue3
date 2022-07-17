import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { initProps } from './componentProps'
import { proxyRefs, shallowReadonly } from '../reactivity'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    emit: () => {},
    provides: parent ? parent.provides : {},
    parent,
    slots: {},
    subTree: {}
  }

  component.emit = emit.bind(null, component) as any

  return component
}
// 处理组件
export function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props)
  // 初始化slots
  initSlots(instance, instance.vnode.children)

  // 初始化组件的setup 并将setup的结果(状态 state)保存起来
  setupStateFulComponent(instance)
}
// 初始化组件的setup 并将setup的结果(状态 state)保存起来
function setupStateFulComponent(instance) {
  // Component 为组件的对象
  const Component = instance.vnode.type
  // 设置组件实例的代理对象, 之后通过此属性获取 setup 返回的状态
  instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers)

  const { setup } = Component
  if(setup) {
    // 在setup执行之前先设置当前的实例
    setCurrentInstance(instance)
    // 执行setup函数 得到返回的结果 结果可能是 function or object
    // props是一个shallowReadonly类型数据
    const setupResult = proxyRefs(
      setup(shallowReadonly(instance.props), {
        emit: instance.emit
      })
    )
    // setup执行结束后将当前实例置空
    setCurrentInstance(null)
    // 处理setup返回的结果
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {

  if(typeof setupResult === 'object') {
    // setupResult 为对象时 则返回的结果是状态信息
    instance.setupState = setupResult
  } else if (typeof setupResult === 'function') {
    // todo function
    // setupResult 为函数时 则返回的结果是他的render函数
  }
  finishComponentSetup(instance)
}

// 将render函数挂载在组件实例上 等待后续调用
function finishComponentSetup(instance) {
  const Component = instance.type
  instance.render = Component.render
}

let currentInstance = null

export function getCurrentInstance () {
  return currentInstance
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}
