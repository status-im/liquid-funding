const typeMap = {
  'gif': 'image/gif',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'pdf': 'application/pdf'
}

export const getImageType = file => {
  const { name } = file
  const suffix = name.split('.').slice(-1)[0].toLowerCase()
  return typeMap[suffix] ? typeMap[suffix] : 'image/jpeg'
}
