export const arrayToObject = (arr, keyField) => Object.assign(
  {},
  ...arr.map(item => ({[item[keyField]]: item}))
)
