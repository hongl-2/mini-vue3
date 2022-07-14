import { createVNode, Fragment } from '../vnode'
// 渲染slot的辅助函数
export function renderSlots(slots, slotName, props) {
  // 获取到slot slot是一个函数
  // 此为component实例上的slot赋值操作
  // slots[key] = (props) => normalizeSlotValue(value(props))
  const slot = slots[slotName]
  if (slot) {
    if(typeof slot === 'function') {
      return createVNode(Fragment, {}, slot(props))
    }
  }
}
