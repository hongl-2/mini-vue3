import { isProxy, isReadonly, readonly } from '../reactive'

describe('readonly', () => {
  it('should make nested values readonly', () => {
    const obj = { foo: 1, bar: { baz: 2 }}
    const wrapped = readonly(obj)
    expect(wrapped).not.toBe(obj)
    expect(wrapped.foo).toBe(1)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(obj)).toBe(false)
    // add nested readonly test
    expect(isReadonly(wrapped.bar)).toBe(true)
    expect(isReadonly(obj.bar)).toBe(false)
    expect(isProxy(wrapped)).toBe(true)

    expect(wrapped.foo).toBe(1)
  })

  it('warn when readonly have been set', () => {
    console.warn = jest.fn()
    const obj = readonly({
      foo: 1
    })
    obj.foo = 2
    expect(console.warn).toHaveBeenCalled()
  })
})
