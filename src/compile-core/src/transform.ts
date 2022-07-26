export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 1. 遍历 深度优先搜索
  traverseNodes(root, context)

  createRootCodegen(root)
}

function createRootCodegen(root) {
  root.codegenNode = root.children[0]
}

function createTransformContext(root, options) {
  // 返回一个执行上下文
  return {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
}

function traverseNodes(node, context) {
  // 2. 修改 text content
  const { nodeTransforms } = context
  for(let i = 0; i < nodeTransforms.length; i++) {
    nodeTransforms[i](node)
  }
  traverseChildrenNodes(node, context)
}

function traverseChildrenNodes(node, context) {
  const children = node.children
  if(children) {
    for(let i = 0; i < children.length; i++) {
      const node = children[i]
      traverseNodes(node, context)
    }
  }
}


