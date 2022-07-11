'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // todo
    // initProps()
    // initSlots()
    setupStateFulComponent(instance);
}
function setupStateFulComponent(instance) {
    const Component = instance.vnode.type;
    const { setup } = Component;
    if (setup) {
        // function or object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    // todo function
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if(Component.render) {
    instance.render = Component.render;
    // }
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props
    };
    return vnode;
}

function render(vnode, container) {
    // patch
    patch(vnode);
}
function patch(vnode, container) {
    // 判断是组件类型还是 element 类型
    if (typeof vnode.type === 'string') ;
    else {
        // 去处理组价
        processComponent(vnode);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance); // 执行完以后会初始化instance setup 并且再instance上添加render方法
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 组件先转 vnode  后续所有的逻辑都基于 vnode 处理
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props);
}

exports.createApp = createApp;
exports.createComponentInstance = createComponentInstance;
exports.createVNode = createVNode;
exports.h = h;
exports.render = render;
exports.setupComponent = setupComponent;
