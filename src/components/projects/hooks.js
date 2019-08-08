/*global web3*/
import EmbarkJS from '../../embarkArtifacts/embarkjs'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import { useState, useEffect, useMemo, useContext } from 'react'
import { unnest } from 'ramda'
import { timeSinceBlock } from '../../utils/dates'
import { getFiles, getFilesWeb, ipfs } from '../../utils/ipfs'
import { databaseExists } from '../../utils/db'
import { arrayToObject } from '../../utils/array'
import { FundingContext } from '../../context'
import { getDelegateProfiles } from '../../actions/profiles'
import { getDelegatePledgesByProfile } from '../../actions/delegates'

async function getProjectAge(id, events, setState){
  const event = events.find(e => e.returnValues.idProject === id)
  if (event) {
    const { timestamp } = await web3.eth.getBlock(event.blockNumber)
    setState(timeSinceBlock(timestamp, 'days'))
  } else {
    setState(timeSinceBlock(false, 'days'))
  }
}

async function getProjectCreator(id, events, setState){
  const event = events.find(e => e.returnValues.idProject === id)
  if (event) {
    const { address } = event
    setState(address)
  }
}

async function getProjectAssets(projectId, setState, debug=false){
  EmbarkJS.onReady(async (_err) => {
    const projectInfo = await LiquidPledging.methods.getPledgeAdmin(projectId).call()
    const CID = projectInfo.url.split('/').slice(-1)[0]
    if (debug) console.log({CID, projectInfo, ipfs})
    getFiles(CID)
      .then((files) => {
        setState(files)
        const manifest = files[2]
        if (debug) console.log({files}, JSON.parse(manifest.content))
      })
      .catch(async (err) => {
        console.log('IPFS getFiles error: ', err)
        databaseExists('ipfs')
          .catch(() => window.location.reload())

        getFilesWeb(CID)
          .then((files) => {
            setState(files)
            const manifest = files[2]
            if (debug) console.log({files}, JSON.parse(manifest.content))
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
  if (!profiles || !profiles.length) {
    return setState(dPledges)
  }
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

const getProjectManifest = assets => {
  if (!assets) {
    return null;
  }
  const manifest = assets.find(a => a.name.toLowerCase() === 'manifest.json');
  if (!manifest) {
    return null;
  }
  try {
    return JSON.parse(manifest.content)
  } catch (e) {
    return null;
  }
}

export function useProjectData(projectId, projectAddedEvents) {
  const [projectAge, setAge] = useState(null)
  const [creator, setCreator] = useState(null)
  const [projectAssets, setAssets] = useState(null)
  const [ipfsReady, setIpfsState] = useState(null)
  const [delegateProfiles, setDelegateProfiles] = useState(null)
  const { account, openSnackBar, syncWithRemote } = useContext(FundingContext)

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
    getProjectCreator(projectId, projectAddedEvents, setCreator)
  }, [projectAddedEvents, projectId])

  useEffect(() => {
    getProjectAssets(projectId, setAssets)
  }, [projectId, ipfsReady])

  const manifest = useMemo(() => getProjectManifest(projectAssets), [projectAssets, projectId])

  return {
    account,
    creator,
    projectAge,
    projectAssets,
    manifest,
    delegateProfiles,
    openSnackBar,
    syncWithRemote
  }
}

function mergePledgesAuthorizations(pledges, authorizations, setState) {
  const auths = arrayToObject(authorizations, 'ref')
  const enriched = pledges.map(pledge => {
    const { idPledge } = pledge
    if (auths[idPledge]) pledge.authorization = auths[idPledge]
    return pledge
  })
  setState(enriched)
}
export function usePledgesAuthorizations(pledges, authorizations, confirmedPayments) {
  const [enrichedPledges, setEnrichedPledges] = useState(pledges)
  const confirmedIds = confirmedPayments.map(p => p.returnValues.idPayment)
  const filteredAuths = authorizations.filter(
    a => !confirmedIds.includes(a.returnValues.idPayment)
  )

  useEffect(() => {
    mergePledgesAuthorizations(pledges, filteredAuths, setEnrichedPledges)
  }, [pledges, authorizations])

  return enrichedPledges
}
