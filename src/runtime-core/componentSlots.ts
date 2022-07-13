import { isArray } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'

export function initSlots(instance, children){
  const { vnode } = instance
  // 通过 vnode的 shapeFlag 判断是否是 slot 类型的 vnode
  // slot 类型的children是一个object 例子如下:
  // {
  //   header: () => h('p', {}, 'header'),
  //   footer: () => h('p', {}, 'footer')
  // }
  if(vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    // 如果是的话就初始化slots
    normalizeObjectSlots(children, instance.slots)
  }
}

function normalizeObjectSlots(children, slots) {
  // 遍历所有的slot
  for(const key in children) {
    // 1. 获取到slot的值 slot的值(value)是一个函数
    // 2. value函数执行后返回的是插槽的vnode
    const value = children[key]
    // 给component的实例上的slot添加元素(一个数组), props为后续slots['header'] 执行时传入的参数
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}
// default可能是一个数组,其他的为单个
function normalizeSlotValue(value) {
  return isArray(value) ? value : [value]
}
