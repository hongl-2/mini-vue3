import { h, ref } from '../../lib/mini-vue.esm.js'

export const App = {
  name: 'App',
  render() {
    return h(
      'div',
      {
        ...this.props
      },
      [
        h('div', {}, `count: ${this.count}`),
        h(
          'button',
          {
            onClick: this.onClick
          },
          'click'
        ),
        h(
          'button',
          {
            onClick: this.onChangePropsDemo1
          },
          '将foo改为new-foo'
        ),
        h(
          'button',
          {
            onClick: this.onChangePropsDemo2
          },
          '将foo改为undefined'
        ),
        h(
          'button',
          {
            onClick: this.onChangePropsDemo3
          },
          '将bar删除'
        ),
      ])
  },
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
    }

    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const onChangePropsDemo1 = () => {
      props.value.foo = 'new-foo'
    }

    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }

    const onChangePropsDemo3 = () => {
      props.value = {
        foo: 'foo'
      }
    }
    return {
      count,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      props
    }
  }
}
