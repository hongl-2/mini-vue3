import { h } from '../../lib/mini-vue.esm.js'

export const Foo = {
  setup(props, { emit }) {

    const emitAdd = () => {
      console.log('emit add')
      emit('add', 1, 2)
      emit('addFoo', 1, 2)
    }
    return {
      emitAdd
    }
  },
  render() {
    const btn = h(
      'button',
      {
        onClick: this.emitAdd
      },
      'emitAdd-button'
    )
    const p = h('p', {}, 'foo-p')
    return h('div', {}, [btn, p])
  }
}
