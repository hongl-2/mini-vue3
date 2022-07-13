import { camelize, capitalize } from '../shared'

export function emit(instance, event, ...args) {
  const toHandlerKey = (str: string) => {
    return str ? 'on' + capitalize(camelize(str)) : ''
  }
  const handlerName = toHandlerKey(event)
  const handler = instance.props[handlerName]
  handler && handler(...args)
}
