import IPFS from 'ipfs'
import fileReaderPullStream from 'pull-file-reader'
import { Matcher } from '@areknawo/rex'
import { getImageType } from './images'

const ipfsMatcher = new Matcher().begin().find('ipfs/')
const ipfs = new IPFS()

export const isIpfs = str => ipfsMatcher.test(str)
export const captureFile = (event, cb, imgCb) => {
  event.stopPropagation()
  event.preventDefault()
  const file = event.target.files[0]
  saveToIpfs(file, cb, imgCb)
}

const formatForIpfs = file => {
  const { name, type } = file
  const content = fileReaderPullStream(file)
  return [{
    path:  `/root/${name}`,
    content
  }]
}
const saveToIpfs = (file, cb, imgCb) => {
  let ipfsId
  ipfs.add(formatForIpfs(file), { progress: (prog) => console.log(`received: ${prog}`) })
    .then((response) => {
      console.log(response)
      ipfsId = response[0].hash
      cb(`ipfs/${ipfsId}`)
      getImageFromIpfs(ipfsId, imgCb)
    }).catch((err) => {
      console.error(err)
    })
}

export const getImageFromIpfs = async (hash, cb) => {
  const res = await getFromIpfs(hash)
  cb(res)
};

export const getFromIpfs = async hash => {
  const files = await getFile(hash)
  const file = files.slice(-1)[0]
  const { content } = file
  const arrayBufferView = new Uint8Array(content)
  const blob = new Blob([ arrayBufferView ], { type: getImageType(file) })
  const img = URL.createObjectURL(blob)
  return { ...file, img }
}

export const getFile = CID => {
  const clean = CID.split('/').slice(-1)[0]
  return new Promise(function(resolve, reject) {
    ipfs.get(clean, function (err, files) {
      if (err) reject(err)
      else resolve(files)
    })
  })
}
