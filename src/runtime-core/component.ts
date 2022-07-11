export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  }

  return component
}

export function setupComponent(instance) {
  // todo
  // initProps()
  // initSlots()

  setupStateFulComponent(instance)
}

function setupStateFulComponent(instance) {
  const Component = instance.vnode.type
  const { setup } = Component
  if(setup) {
    // function or object
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {

  if(typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  // todo function
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type
  // if(Component.render) {
  instance.render = Component.render
  // }
}
