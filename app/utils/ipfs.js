import IPFS from 'ipfs'
import fileReaderPullStream from 'pull-file-reader'
import { Matcher } from '@areknawo/rex'
import { getImageType } from './images'

const ipfsMatcher = new Matcher().begin().find('ipfs/')
export const ipfs = new IPFS()

ipfs.on('ready', () => {
  console.log('Node is ready to use!')
})

export const isIpfs = str => ipfsMatcher.test(str)
export const captureFile = (event, cb, imgCb) => {
  event.stopPropagation()
  event.preventDefault()
  const file = event.target.files[0]
  const files = event.target.files
  const formattedFiles = formatFileList(files)
  console.log({files, formattedFiles})
  saveToIpfs(formattedFiles, cb, imgCb)
}

export const formatFileList = files => {
  const formattedList = []
  for (let i=0; i<files.length; i++) {
    formattedList.push(formatForIpfs(files[i]))
  }
  return formattedList
}

export const formatForIpfs = file => {
  const { name, type } = file
  const content = fileReaderPullStream(file)
  return {
    path:  `/root/${name}`,
    content
  }
}
export const saveToIpfs = (files, cb, imgCb) => {
  let ipfsId
  ipfs.add(files, { progress: (prog) => console.log(`received: ${prog}`) })
    .then((response) => {
      console.log(response)
      ipfsId = response[0].hash
      cb(`ipfs/${ipfsId}`)
      getImageFromIpfs(ipfsId, imgCb)
    }).catch((err) => {
      console.error(err)
    })
}

export const uploadToIpfs = async files => {
  const res = await ipfs.add(files, { progress: (prog) => console.log(`received: ${prog}`) })
  return `ipfs/${res[0].hash}`
}

export const getImageFromIpfs = async (hash, cb) => {
  const res = await getFromIpfs(hash)
  cb(res)
}

export const getFromIpfs = async hash => {
  const files = await getFiles(hash)
  const file = files.slice(-1)[0]
  const { content } = file
  const arrayBufferView = new Uint8Array(content)
  const blob = new Blob([ arrayBufferView ], { type: getImageType(file) })
  const img = URL.createObjectURL(blob)
  return { ...file, img }
}

export const getFiles = CID => {
  const clean = CID.split('/').slice(-1)[0]
  return new Promise(function(resolve, reject) {
    ipfs.get(clean, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
}
