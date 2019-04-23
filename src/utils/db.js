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

export function databaseExists(name){
  return new Promise(function(resolve, reject){
    var db = indexedDB,
      req;

    try{
      // See if it exist
      req = db.webkitGetDatabaseNames();
      req.onsuccess = function(evt) {
        // eslint-disable-next-line
        ~([].slice.call(evt.target.result)).indexOf(name) ? resolve(true) : reject(new Error('unknown db'));
      }
    } catch (e) {
      // Try if it exist
      req = db.open(name);
      req.onsuccess = function () {
        req.result.close();
        resolve(true);
      }
      req.onupgradeneeded = function (evt) {
        evt.target.transaction.abort();
        reject(new Error('abort'));
      }
    }

  })
}
