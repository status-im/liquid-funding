const typeMap = {
  'gif': 'image/gif',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'pdf': 'application/pdf'
}

export const getImageType = file => {
  const suffix = file.split('.').slice(-1)[0].toLowerCase()
  return typeMap[suffix] ? typeMap[suffix] : 'image/jpeg'
}

export const isVideo = file => file.type.includes('video')
