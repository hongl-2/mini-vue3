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
          // console.log('click')
        },
        onMousedown() {
          // console.log('Mousedown')
        }
      },
      [
        h('div', {}, 'hello ' + this.msg),
        h(Foo, {
          onAdd(a, b) {
            console.log('app.js log onAdd', a, b)
          },
          onAddFoo(a, b) {
            console.log('app.js log onAddFoo', a, b)
          }
        })
      ])
  },
  setup() {
    return {
      msg: 'mini vue'
    }
  }
}
