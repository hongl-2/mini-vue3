import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './foo.js'

export const App = {
  render() {
    window.self = this
    return h(
      'div',
      {
        id: 'root',
        class: ['root1', 'root2'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
          console.log('Mousedown')
        }
      },
      [
        h('div', {}, 'hello ' + this.msg),
        h(Foo, { count: 1 })
      ])
  },
  setup() {
    return {
      msg: 'mini vue'
    }
  }
}
