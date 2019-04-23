import { Model } from '@nozbe/watermelondb'

export function getFields(obj) {
  const validTypes = new Set(['string', 'number', 'boolean'])
  const newObj = {}
  const proto = Object.getPrototypeOf(obj)
  const names = Object.getOwnPropertyNames(proto)
  names
    .filter(name => validTypes.has(typeof obj[name]))
    .forEach(name => { newObj[name] = obj[name] })
  return newObj
}

export class LiquidModel extends Model {
  getFields() {
    const validTypes = new Set(['string', 'number', 'boolean'])
    const newObj = {}
    const proto = Object.getPrototypeOf(this)
    const names = Object.getOwnPropertyNames(proto)
    names
      .filter(name => validTypes.has(typeof this[name]))
      .forEach(name => { newObj[name] = this[name] })
    return newObj
  }
}
