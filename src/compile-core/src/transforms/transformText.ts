import { NodeTypes } from '../ast'
import { isText } from '../utils'

// 转换前 children: [text1, text2, element1, text3, text4]
/**
 * 经过transformText转化后
 * children[0]是一个compound复合类型 包括[text1, text2]
 * children[1]是 [element1]
 * children[2]是一个compound复合类型 包括[text3, text4]
 */

export function transformText(node) {

  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      let currentContainer
      const { children } = node
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          for(let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if(isText(next)) {
              if(!currentContainer) {
                children[i] = currentContainer = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child]
                }
              }
              currentContainer.children.push(' + ')
              currentContainer.children.push(next)
              children.splice(j, 1)
              j--
            } else {
              currentContainer = undefined
              break
            }
          }
        }
      }
    }
  }
}
