/*global web3*/
import EmbarkJS from 'Embark/EmbarkJS'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import { useState, useEffect, useMemo, useContext } from 'react'
import { unnest } from 'ramda'
import { timeSinceBlock } from '../../utils/dates'
import { getFiles, ipfs } from '../../utils/ipfs'
import { databaseExists } from '../../utils/db'
import { FundingContext } from '../../context'
import { getDelegateProfiles } from '../../actions/profiles'
import { getDelegatePledgesByProfile } from '../../actions/delegates'

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

async function getPledge(dPledge) {
  const pledge = await dPledge.pledge.fetch()
  dPledge.pledgeData = pledge
  return dPledge
}

async function fetchAndAddDelegateProfiles(account, setState) {
  const profiles = await getDelegateProfiles(account)
  setState(profiles)
}

async function fetchAndAddDelegatePledges(profiles, setState) {
  const dPledges = []
  profiles.forEach(profile => {
    const delegatePledges = getDelegatePledgesByProfile(profile)
    dPledges.push(delegatePledges)
  })
  const resolved = await Promise.all(dPledges)
  const unnested = unnest(resolved)
  const expanded = await Promise.all(unnested.map(getPledge))
  setState(expanded)
}

export function useProfileData(profiles) {
  const [delegatePledges, setDelegatePledges] = useState(null)

  useEffect(() => {
    fetchAndAddDelegatePledges(profiles, setDelegatePledges)
  }, [profiles])
  return delegatePledges
}

const getProjectManifest = assets => assets ? JSON.parse(assets.find(a => a.name.toLowerCase() === 'manifest.json').content) : null

export function useProjectData(projectId, profile, projectAddedEvents) {
  const [projectAge, setAge] = useState(null)
  const [projectAssets, setAssets] = useState(null)
  const [ipfsReady, setIpfsState] = useState(null)
  const [delegateProfiles, setDelegateProfiles] = useState(null)
  const { account, openSnackBar } = useContext(FundingContext)

  useEffect(() => {
    ipfs.on('ready', () => { setIpfsState(true) })
  }, [projectId])

  useEffect(() => {
    fetchAndAddDelegateProfiles(account, setDelegateProfiles)
  }, [account])

  useEffect(() => {
    getProjectAge(projectId, projectAddedEvents, setAge)
  }, [projectAddedEvents, projectId])

  useEffect(() => {
    getProjectAssets(projectId, setAssets)
  }, [projectId, ipfsReady])

  const manifest = useMemo(() => getProjectManifest(projectAssets), [projectAssets, projectId])

  return {
    projectAge,
    projectAssets,
    manifest,
    delegateProfiles,
    openSnackBar
  }
}
