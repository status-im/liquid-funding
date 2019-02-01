import IPFS from 'ipfs'
import fileReaderPullStream from 'pull-file-reader'
import { Matcher } from '@areknawo/rex'

const ipfsMatcher = new Matcher().begin().find('/ipfs/')
const ipfs = new IPFS()

export const isIpfs = str => ipfsMatcher.test(str)
export const captureFile = (event, cb, imgCb) => {
  event.stopPropagation()
  event.preventDefault()
  const file = event.target.files[0]
  saveToIpfs(file, cb, imgCb)
}


const saveToIpfs = (file, cb, imgCb) => {
  let ipfsId
  const fileStream = fileReaderPullStream(file)
  ipfs.add(fileStream, { progress: (prog) => console.log(`received: ${prog}`) })
    .then((response) => {
      console.log(response)
      ipfsId = response[0].hash
      console.log(ipfsId)
      cb(`ipfs/${ipfsId}`)
      getImageFromIpfs(ipfsId, imgCb)
    }).catch((err) => {
      console.error(err)
    })
}

export const getImageFromIpfs = async (hash, cb) => {
  const files = await getFile(hash);
  const { content } = files[0];
  const arrayBufferView = new Uint8Array(content);
  const blob = new Blob([ arrayBufferView ], { type: "image/jpeg" });
  const img = URL.createObjectURL(blob);
  cb(img)
};

export const getFile = CID => {
  return new Promise(function(resolve, reject) {
    ipfs.get(CID, function (err, files) {
      if (err) reject(err)
      else resolve(files)
    })
  })
}
