import { reactive } from '../reactive';
import { effect, stop } from '../effect';

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge
    let nextAge2

    effect(() => {
      nextAge = user.age + 1
    })
    effect(() => {
      nextAge2 = user.age + 2
    })

    expect(nextAge).toBe(11)

    //update
    user.age++
    expect(nextAge).toBe(12)
  })

  it('should return runner while call effect', () => {
    // 1. effect(fn) => function (runner) => fn => return
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })

    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    // 1. 通过 effect 的第二个参数给定的一个 scheduler 的fn
    // 2. effect 第一次执行的时候还会执行 (传给effect的)fn
    // 3. 当响应式对象 set 即update的时候不会执行 (传给effect的)fn 而是执行 scheduler
    // 4. 如果当执行 runner 的时候 会再次执行 (传给effect的)fn
    let dummy
    let run : any
    const scheduler = jest.fn(() => {
      run = runner
    })

    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    const obj = reactive({
      foo: 1
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(() => {
      dummy = obj.foo
    }, { onStop })
    // 执行stop的时候立即执行onStop
    stop(runner)
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
