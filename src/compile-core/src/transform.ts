import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelper'

export type TransformCtx = {
  root: any,
  nodeTransforms: any,
  helpers: any,
  helper: any
}

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 1. 遍历 深度优先搜索
  traverseNodes(root, context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
  const child = root.children[0]
  if(child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode
  } else {
    root.codegenNode = child
  }
}

function traverseNodes(node, context: TransformCtx) {
  // 2. 修改 text content
  const { nodeTransforms } = context
  const exitFns: any = []
  for(let i = 0; i < nodeTransforms.length; i++) {
    const transformFn = nodeTransforms[i]
    const onExit = transformFn(node, context)
    if(onExit) {
      exitFns.push(onExit)
    }
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
  let i = exitFns.length
  while(i--) {
    exitFns[i]()
  }
}

function traverseChildrenNodes(node, context) {
  const children = node.children
  for(let i = 0; i < children.length; i++) {
    const node = children[i]
    traverseNodes(node, context)
  }
}

function createTransformContext(root, options): TransformCtx {
  // 返回一个执行上下文
  const context: TransformCtx =  {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }
  return context
}

