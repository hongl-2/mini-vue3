import { h, renderSlots } from '../../lib/mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup() {
    return {}
  },
  render() {
    const age = 18
    const fooMain = h('p', {}, 'this is foo main')
    return h('div', {}, [
      // this.$slots['header'],
      renderSlots(this.$slots, 'header', {
        age
      }),
      fooMain,
      renderSlots(this.$slots, 'footer', {}),
    ])
  }
}
