import IPFS from 'ipfs'
import ipfsClient from 'ipfs-http-client'
import fileReaderPullStream from 'pull-file-reader'
import { Buffer } from 'buffer'
import { Matcher } from '@areknawo/rex'
import { getImageType } from './images'

const ipfsMatcher = new Matcher().begin().find('ipfs/')
export const ipfs = new IPFS()
const ipfsHttp = ipfsClient('test-ipfs.status.im', '2053', { protocol: 'https' })

window.ipfsHttp = ipfsHttp
window.jsIPFS = ipfs

ipfs.on('ready', () => {
  console.log('Node is ready to use!')
  // Add status ipfs node as peer
  ipfs.bootstrap.add('/ip4/35.188.209.83/tcp/4001/ipfs/QmZqW6QHdDVyHMvYktpA1PAuKgvqhwumbuFqFB5URedSbA')
})


export const isIpfs = str => ipfsMatcher.test(str)
export const captureFile = (event, cb, imgCb) => {
  event.stopPropagation()
  event.preventDefault()
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
  const { name, type: _type } = file
  const content = fileReaderPullStream(file)
  return {
    path:  `/root/${name}`,
    content
  }
}

export const formatForIpfsGateway = file => {
  const { name, type: _type } = file
  const content = file
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

export const uploadFilesToIpfs = async (files, manifest, gateway = false) => {
  let fileLists = []
  const formatFn = gateway ? formatForIpfsGateway : formatForIpfs
  const uploadFn = gateway ? uploadToIpfsGateway : uploadToIpfs
  Object.keys(files).forEach(k => {
    fileLists = [...fileLists, formatFn(files[k][0])]
  })
  fileLists.push({
    path: '/root/manifest.json', content: Buffer.from(manifest)
  })
  const res = await uploadFn(fileLists)
  return res
}

export const uploadToIpfs = async files => {
  const res = await ipfs.add(files, { progress: (prog) => console.log(`received: ${prog}`) })
  return `ipfs/${res[0].hash}`
}

export const uploadToIpfsGateway = async files => {
  const res = await ipfsHttp.add(files)
  return `ipfs/${res.slice(-1)[0].hash}`
}

export const pinToIpfs = async hash => {
  const cid = hash.split('/').slice(-1)[0]
  const res = await ipfs.pin.add(cid, { recursive: false })
  console.log({res})
}

export const pinToGateway = async hash => {
  const cid = hash.split('/').slice(-1)[0]
  const res = await ipfsHttp.pin.add(cid, { recursive: true })
  console.log({res})
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
  const blob = new Blob([arrayBufferView], { type: getImageType(file) })
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

export const getFilesWeb = CID => {
  const clean = CID.split('/').slice(-1)[0]
  return new Promise(function(resolve, reject) {
    ipfsHttp.get(clean, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
}

export const isWeb = str => str.includes('http')
export const formatMedia = str => {
  return isWeb(str) ? str : `/root/${str}`
}
