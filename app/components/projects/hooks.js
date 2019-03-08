import EmbarkJS from 'Embark/EmbarkJS'
import web3 from 'Embark/web3'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import { useState, useEffect, useMemo, useContext } from 'react'
import { timeSinceBlock } from '../../utils/dates'
import { getFiles, ipfs } from '../../utils/ipfs'
import { databaseExists } from '../../utils/db'
import { FundingContext } from '../../context'
import { getDelegateProfiles } from '../../actions/profiles'

async function getProjectAge(id, events, setState){
  const event = events.find(e => e.returnValues.idProject === id)
  const { timestamp } = await web3.eth.getBlock(event.blockNumber)
  setState(timeSinceBlock(timestamp, 'days'))
}

async function getProjectAssets(projectId, setState){
  EmbarkJS.onReady(async (err) => {
    const projectInfo = await LiquidPledging.methods.getPledgeAdmin(projectId).call()
    const CID = projectInfo.url.split('/').slice(-1)[0]
    console.log({CID, projectInfo, ipfs})
    getFiles(CID)
      .then((files) => {
        setState(files)
        const manifest = files[2]
        console.log({files}, JSON.parse(manifest.content))
      })
      .catch(async (err) => {
        console.log('IPFS getFiles error: ', err)
        databaseExists('ipfs')
          .catch(() => location.reload())

        getFiles(CID)
          .then((files) => {
            setState(files)
            const manifest = files[2]
            console.log({files}, JSON.parse(manifest.content))
          })
          .catch((err) => {
            console.log('IPFS FAILED ON READY', err)
          })
      })
  })
}

async function fetchAndAddDelegateProfiles(account, setState) {
  const profiles = await getDelegateProfiles(account)
  setState(profiles)
}

const getProjectManifest = assets => assets ? JSON.parse(assets.find(a => a.name.toLowerCase() === 'manifest.json').content) : null

export function useProjectData(projectId, profile, projectAddedEvents) {
  const [projectAge, setAge] = useState(null)
  const [projectAssets, setAssets] = useState(null)
  const [ipfsReady, setIpfsState] = useState(null)
  const [delegateProfiles, setDelegateProfiles] = useState(null)
  const { account } = useContext(FundingContext)

  useEffect(() => {
    ipfs.on('ready', () => { setIpfsState(true) })
  }, [projectId])

  useEffect(() => {
    fetchAndAddDelegateProfiles(account, setDelegateProfiles)
  }, [account])

  useEffect(() => {
    getProjectAge(projectId, projectAddedEvents, setAge)
  }, [projectAddedEvents])

  useEffect(() => {
    getProjectAssets(projectId, setAssets)
  }, [projectId, ipfsReady])

  const manifest = useMemo(() => getProjectManifest(projectAssets), [projectAssets])

  return { projectAge, projectAssets, manifest, delegateProfiles }
}
