import { h } from '../../lib/mini-vue.esm.js'

export const Foo = {
  setup(props) {
    // props 不允许被修改 是有个readonly
    console.log(props)
    props.count++
    console.log(props)
  },
  render() {
    return h('div', {}, "foo: " + this.count)
  }
}
