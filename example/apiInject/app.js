import { h, inject, provide } from '../../lib/mini-vue.esm.js'

export const Provide = {
  name: 'provide',
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render() {
    return (
      h('div', {}, [
        h('p', {}, '这是最外层的Provide组件'),
        h(Provide2)
      ])
    )
  }
}

export const Provide2 = {
  name: 'provide2',
  setup() {
    provide('foo', 'fooValTwo')
    const foo = inject('foo')
    return {
      foo
    }
  },
  render() {
    return (
      h('div', {}, [
        h('p', {}, `这是的Provide2组件 foo: ${this.foo}`),
        h(Custom)
      ])
    )
  }
}

export const Custom = {
  name: 'custom',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const appData = inject('appData')
    const defaultInject = inject('test', 'defaultInject')
    const defaultWithFunc = inject('test', () => 'defaultFunc')
    return {
      foo,
      bar,
      appData,
      defaultInject,
      defaultWithFunc
    }
  },
  render() {
    return (
      h('div', {}, [
        h('div', {}, `这是provide提供的foo: ${this.foo}`),
        h('div', {}, `这是App提供的appData: ${this.appData}`),
        h('div', {}, `携带默认值的inject: ${this.defaultInject}`),
        h('div', {}, `携带默认值为函数的inject: ${this.defaultWithFunc}`)
      ])
    )
  }
}

export default {
  name: 'App',
  setup() {
    provide('appData', 'from app')
  },
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(Provide)]);
  },
};
