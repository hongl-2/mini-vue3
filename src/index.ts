// vue 出口文件
import { baseCompile } from './compile-core/src'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-dom'
export * from './runtime-dom'


function compileToFunction(template) {
  const { code } = baseCompile(template)
  // 返回的是一个render函数
  return new Function("Vue", code)(runtimeDom)
}

registerRuntimeCompiler(compileToFunction)

