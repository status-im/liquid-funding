export const fieldGenerator = self => (column, name) => {
  Object.defineProperty(self, name || column, {
    get() { return self._getRaw(column) },
    set(value) { self._setRaw(column, value) },
    enumerable: true,
    configurable: true
  })
}

export function initialize(target, name, descriptor) {
  descriptor.initializer = true
}
