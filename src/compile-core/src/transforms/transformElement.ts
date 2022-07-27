import { createVNodeCall, NodeTypes } from '../ast'
import { TransformCtx } from '../transform'

export function transformElement(node, context: TransformCtx){
  if(node.type === NodeTypes.ELEMENT) {
    return () => {
      // 处理tag
      const vnodeTag = `'${node.tag}'`

      // 处理props
      let vnodeProps

      // 处理children todo 这里有可能是一个数组的形式 得另外做处理
      // const vnodeChildren = node.children
      const vnodeChildren = node.children[0]
      node.codegenNode = createVNodeCall(vnodeTag, vnodeProps, vnodeChildren, context)
    }
  }
}
