import { publicInstanceProxyHandlers } from './componentPublicInstance'

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  }

  return component
}
// 处理组件
export function setupComponent(instance) {
  // todo
  // initProps()
  // initSlots()

  // 初始化组件的setup 并将setup的结果(状态 state)保存起来
  setupStateFulComponent(instance)
}
// 初始化组件的setup 并将setup的结果(状态 state)保存起来
function setupStateFulComponent(instance) {
  // 组件的对象
  const Component = instance.vnode.type
  // 设置组件实例的代理对象, 之后通过此属性获取 setup 返回的状态
  instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers)

  const { setup } = Component
  if(setup) {

    // 执行setup函数 得到返回的结果 结果可能是 function or object
    const setupResult = setup()
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
