import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

export function baseParse (content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any = []
  let node
  if (context.source.startsWith('{{')) {
     node = parseInterpolation(context)
  } else if(context.source[0] === '<') {
    node = parseElement(context)
  }
  nodes.push(node)
  return nodes
}

function parseElement(context) {
  const element: any = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)
  return element
}

function parseTag(context, tagType) {
  const tagRegExp = /^<\/?([a-z]*)/i
  const match: any = tagRegExp.exec(context.source)
  console.log(match)
  const tag = match[1]
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if(tagType === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

// 解析 {{ message }} 模板字符串
function parseInterpolation(context) {
  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = context.source.slice(0, rawContentLength)
  advanceBy(context, rawContentLength + closeDelimiter.length)
  const content = rawContent.trim()

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  }
}

// 推进 删除content.source已经处理过的字符创
function advanceBy(context, length) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children
  }
}

function createParserContext(content: string) {
  return {
    source: content
  }
}
