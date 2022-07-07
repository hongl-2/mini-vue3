import { readonly } from '../reactive';

describe('readonly', () => {
  it('happy path', () => {
    const obj = { foo: 1, bar: { baz: 2 }}
    const wrapped = readonly(obj)
    expect(wrapped).not.toBe(obj)
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
