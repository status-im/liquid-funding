/*global web3*/
import { uniqBy, length } from 'ramda'

const { utils } = web3

export const generateChatRoom = title => `#status-${title.replace(/\s/g, '').replace(/\W/g, '').toLowerCase()}`

export const formatProjectId = id => utils.toHex(id)
const getFile = filePath => filePath.split('/').slice(-1)[0]
const formatMedia = content => {
  const blob = new Blob([content])
  const src = URL.createObjectURL(blob)
  return src
}


const getName = asset => asset.path.split('/').slice(-1)[0]
const isManifest = asset => {
  const name = getName(asset)
  return name.toLowerCase() === 'manifest.json'
}
export const getProjectManifest = assets => {
  return assets ? JSON.parse(assets.find(isManifest).content) : null
}

export function getNumberOfBackers(pledges){
  return length(uniqBy(p => p.owner, pledges))
}

const hasManifest = assets => !!assets.find(isManifest)
export const getMediaType = assets => {
  if (!assets || !hasManifest(assets)) return false
  const { media } = getProjectManifest(assets)
  if (media.type.toLowerCase().includes('video')) return true
}

export function setMediaType(url) {
  if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) return 'image'
  return 'video'
}

export const getMediaSrc = assets => {
  if (!assets || !hasManifest(assets)) return null
  const { media } = getProjectManifest(assets)
  const validMedia = media.type.includes('video') || media.type.includes('image')
  if (validMedia) {
    if (media.url) return media.url
    if (media.file && media.file !== '/root/') {
      return formatMedia(
        assets.find(a => getName(a) === getFile(media.file)).content
      )
    }
  }
}
