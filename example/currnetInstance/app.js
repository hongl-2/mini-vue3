import { h, getCurrentInstance } from '../../lib/mini-vue.esm.js'
import { Foo } from './foo.js'

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [h('p', {}, 'app container'), h(Foo)])
  },
  setup() {
    const instance = getCurrentInstance()
    console.log('app的实例:', instance)
    return {}
  }
}
