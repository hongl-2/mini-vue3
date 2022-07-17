import { h, ref, unRef } from '../../lib/mini-vue.esm.js'

export const App = {
  name: 'App',
  render() {
    return h(
      'div',
      {},
      [
        h('div', {}, `count: ${this.count}`),
        h('button', {
          onClick: this.onClick
        }, 'click'),
      ])
  },
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
      console.log(count)
    }
    return {
      count,
      onClick
    }
  }
}
