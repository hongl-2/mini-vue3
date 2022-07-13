'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const publicPropertiesMap = {
    $el: (i) => {
        return i.vnode.el;
    }
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
// 处理组件
function setupComponent(instance) {
    // todo
    // initProps()
    // initSlots()
    // 初始化组件的setup 并将setup的结果(状态 state)保存起来
    setupStateFulComponent(instance);
}
// 初始化组件的setup 并将setup的结果(状态 state)保存起来
function setupStateFulComponent(instance) {
    // 组件的对象
    const Component = instance.vnode.type;
    // 设置组件实例的代理对象, 之后通过此属性获取 setup 返回的状态
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // 执行setup函数 得到返回的结果 结果可能是 function or object
        const setupResult = setup();
        // 处理setup返回的结果
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        // setupResult 为对象时 则返回的结果是状态信息
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
// 将render函数挂载在组件实例上 等待后续调用
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    // 给vnode添加shapeFlag
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
// 给vnode 初始化 shapeFlag
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    // 判断是组件类型还是 element 类型
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        // element 类型直接走处理元素的逻辑
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        // component 类型走处理组件逻辑
        processComponent(vnode, container);
    }
}
// 处理元素分支
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 创建当前分支节点
    const el = vnode.el = document.createElement(vnode.type);
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // 将当前分支节点挂载在父级节点上
    container.append(el);
}
// 递归处理子集
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// 挂载组件流程
function mountComponent(initialVnode, container) {
    // 返回一个组件实例
    const instance = createComponentInstance(initialVnode);
    // 处理组件的setup逻辑
    setupComponent(instance); // 执行完以后会初始化instance setup 并且再instance上添加render方法
    // 将组件的render和组件的setup进行关联
    setupRenderEffect(instance, initialVnode, container);
}
// 将setup的值和render函数关联起来
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVnode.el = subTree.el;
}

// 暴露出createApp 入口方法
function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 组件先转 vnode  后续所有的逻辑都基于 vnode 处理
            const vnode = createVNode(rootComponent);
            // 进行渲染操作
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.createComponentInstance = createComponentInstance;
exports.createVNode = createVNode;
exports.h = h;
exports.render = render;
exports.setupComponent = setupComponent;
