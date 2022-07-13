import { h } from '../../lib/mini-vue.esm.js'

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
      'hello ' + this.msg)
  },
  setup() {
    return {
      msg: 'mini vue'
    }
  }
}
