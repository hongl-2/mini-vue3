import { isReadonly, shallowReadonly } from '../reactive'

describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 }})
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })

  it('warn when shallow readonly have been set', () => {
    console.warn = jest.fn()
    const obj = shallowReadonly({
      foo: 1
    })
    obj.foo = 2
    expect(console.warn).toHaveBeenCalled()
  })
})
