import { h } from '../../lib/mini-vue.esm.js'

export const App = {
  render() {
    window.self = this
    return h('div', {},'hello ' + this.msg)
  },
  setup() {
    return {
      msg: 'mini vue'
    }
  }
}
