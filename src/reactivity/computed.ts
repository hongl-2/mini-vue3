import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private readonly _getter: any
  private _value: any
  private _effect: any
  _dirty = true
  constructor(getter) {
    this._getter = getter
    this._effect = new ReactiveEffect(this._getter, () => {
      if(!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if(this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
