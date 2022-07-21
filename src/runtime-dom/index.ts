import { isOn } from '../shared'
import { createRenderer } from '../runtime-core'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
  // 判断on开头并且紧接着的字符为大写的字母就是事件名称
  if (isOn(key)) {
    // 获取事件名称 onClick => click
    const eventName = key.slice(2).toLowerCase()
    // 为元素添加事件监听
    el.addEventListener(eventName, nextVal)
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
  }
}

function insert(child, parent, anchor) {
  // 插入到anchor之前, 如果anchor为null 则将在最后
  // tip: 如果child是已经存在的子节点, 会将child移动在anchor之前
  parent.insertBefore(child, anchor || null)
}

function setElementText(el, text) {
  el.textContent = text
}

function remove(child) {
  const parent = child.parentNode
  if(parent) {
    parent.removeChild(child)
  }
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  setElementText,
  remove
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'

