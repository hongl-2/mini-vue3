import { reactive } from '../reactive'
import { computed } from '../computed'

describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 1
    })

    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(1)
  })

  it('should compute lazily', () => {
    const value = reactive({
      foo: 1
    })
    const getter = jest.fn(() => {
      return value.foo
    })
    const cValue = computed(getter)

    expect(getter).not.toHaveBeenCalled()
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    // 依赖的值改变时不会触发getter方法
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // 获取computed中的值时才会触发getter 更新内部的value值
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
