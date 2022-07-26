import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

export function baseParse (content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}


function parseChildren(context, ancestors) {
  const nodes: any = []

  while(!isEnd(context, ancestors)) {
    const s = context.source
    let node
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if(s[0] === '<') {
      node = parseElement(context, ancestors)
    }

    if(!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

function isEnd(context, ancestors) {
  const s = context.source
  if(s.startsWith(`</`)) {
    for(let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if(startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
  return !s
}

function parseText(context) {
  const s = context.source
  let endIndex = s.length
  const endTokens = ['{{', '<']

  endTokens.forEach((token) => {
    const index = s.indexOf(token)
    if(index > -1 && index < endIndex) {
      endIndex = index
    }
  })

  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  // </div>
  // 如果字符串是以</ 开头的  且</后的标签名与之前的element.tag名称一致, 则执行消费</${element.tag}> 的逻辑
  // if (context.source.startsWith('</') && context.source.slice(2, 2 + element.tag.length) === element.tag) {
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    // 报错
    throw new Error(`缺少结束标签:${element.tag}`)
  }
  return element
}

function parseTag(context, tagType) {
  const tagRegExp = /^<\/?([a-z]*)/i
  const match: any = tagRegExp.exec(context.source)
  const tag = match[1]
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if(tagType === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag,
    children: []
  }
}

function startsWithEndTagOpen(source, tag) {
  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

// 解析 {{ message }} 模板字符串
function parseInterpolation(context) {
  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = parseTextData(context, rawContentLength)
  advanceBy(context, closeDelimiter.length)
  const content = rawContent.trim()

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    },
  }
}
// 获取指定的字符串并且推进
function parseTextData(context: any, length) {
  const content = context.source.slice(0, length)

  advanceBy(context, length)
  return content;
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
