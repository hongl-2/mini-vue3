import { createTextVNode, h } from '../../lib/mini-vue.esm.js'
import { Foo } from './foo.js'

export const App = {
  name: 'App',
  render() {
    window.self = this
    return h(
      'div',
      {
        id: 'root',
        class: ['root1', 'root2']
      },
      [
        h(Foo, {}, {
          header: ({age}) => [
            h('p', {}, 'header' + age),
            createTextVNode('hello slot2')
          ],
          footer: () => h('p', {}, 'footer')
        })
      ])
  },
  setup() {
    return {
      msg: 'mini vue'
    }
  }
}
