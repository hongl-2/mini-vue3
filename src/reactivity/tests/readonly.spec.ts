import { isReadonly, readonly } from '../reactive'

describe('readonly', () => {
  it('happy path', () => {
    const obj = { foo: 1, bar: { baz: 2 }}
    const wrapped = readonly(obj)
    expect(wrapped).not.toBe(obj)
    expect(wrapped.foo).toBe(1)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(obj)).toBe(false)
    // add nested readonly test
    expect(isReadonly(wrapped.bar)).toBe(true)
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
