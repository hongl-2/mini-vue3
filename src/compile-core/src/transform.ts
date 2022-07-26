import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelper'

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 1. 遍历 深度优先搜索
  traverseNodes(root, context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
  root.codegenNode = root.children[0]
}

function traverseNodes(node, context) {
  // 2. 修改 text content
  const { nodeTransforms } = context
  for(let i = 0; i < nodeTransforms.length; i++) {
    nodeTransforms[i](node)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildrenNodes(node, context)
      break
    default:
      break
  }
}

function traverseChildrenNodes(node, context) {
  const children = node.children
  for(let i = 0; i < children.length; i++) {
    const node = children[i]
    traverseNodes(node, context)
  }
}

function createTransformContext(root, options) {
  // 返回一个执行上下文
  const context =  {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }
  return context
}

