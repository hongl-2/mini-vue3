import { h } from '../../lib/mini-vue.esm.js'

export const App = {
  render() {
    return h('div', {},'hello ')
  },
  setup() {
    return {
      msg: 'mini vue'
    }
  }
}
