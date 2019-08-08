import { uniqBy, length } from 'ramda'

const getFile = filePath => filePath.split('/').slice(-1)[0]
const formatMedia = content => {
  const type = 'video/mp4'
  const blob = new Blob([content], {type})
  const src = URL.createObjectURL(blob)
  return src
}

const getProjectManifest = assets => {
  return assets ? JSON.parse(assets.find(a => a.name.toLowerCase() === 'manifest.json').content) : null
}

export function getNumberOfBackers(pledges){
  return length(uniqBy(p => p.owner, pledges))
}

export const getMediaType = assets => {
  if (!assets) return false
  const { media } = getProjectManifest(assets)
  if (media.type.toLowerCase().includes('video')) return true
}

export function setMediaType(url) {
  if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) return 'image'
  return 'video'
}

export const getMediaSrc = assets => {
  if (!assets) return null
  const { media } = getProjectManifest(assets)
  const validMedia = media.type.includes('video') || media.type.includes('image')
  if (validMedia) {
    if (media.url) return media.url
    if (media.file && media.file !== '/root/') {
      return formatMedia(
        assets.find(a => a.name === getFile(media.file)).content
      )
    }
  }
}
