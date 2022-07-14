import { h, getCurrentInstance } from '../../lib/mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  render() {
    return h('p', {}, 'foo container')
  },
  setup() {
    const instance = getCurrentInstance()
    console.log('Foo的实例:', instance)
    return {}
  }
}
