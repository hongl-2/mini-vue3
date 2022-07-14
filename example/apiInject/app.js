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
    return {
      foo,
      bar
    }
  },
  render() {
    return (
      h('div', {}, `这是provide提供的foo: ${this.foo}`)
    )
  }
}

export default {
  name: 'App',
  setup() {
  },
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(Provide)]);
  },
};
