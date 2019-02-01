import IPFS from 'ipfs'
import fileReaderPullStream from 'pull-file-reader'

const ipfs = new IPFS()

export const captureFile = (event, cb) => {
  event.stopPropagation()
  event.preventDefault()
  const file = event.target.files[0]
  saveToIpfs(file, cb)
}


const saveToIpfs = (file, cb) => {
  let ipfsId
  const fileStream = fileReaderPullStream(file)
  ipfs.add(fileStream, { progress: (prog) => console.log(`received: ${prog}`) })
    .then((response) => {
      console.log(response)
      ipfsId = response[0].hash
      console.log(ipfsId)
      cb(`ipfs/${ipfsId}`)
    }).catch((err) => {
      console.error(err)
    })
}
