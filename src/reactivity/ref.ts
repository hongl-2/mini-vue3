import { triggerEffects, trackEffects, isTracking } from './effect'
import { hasChanged, isObject } from '../shared'
import { reactive } from './reactive'

class RefImpl {
  private _value: any
  public dep: Set<any>
  private _rawValue: any

  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if(hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function trackRefValue(ref) {
  if(isTracking()){
    trackEffects(ref.dep)
  }
}

export function triggerRefValue(ref, newValue) {
  if(hasChanged(ref._value, newValue)) {
    ref._value = newValue
    triggerEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}
