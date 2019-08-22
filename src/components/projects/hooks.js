import { useState, useEffect, useMemo, useContext } from 'react'
import { unnest } from 'ramda'
import { timeSinceBlock } from '../../utils/dates'
import { getFiles, getFilesWeb, ipfs, getFilesWebTheGraph } from '../../utils/ipfs'
import { arrayToObject } from '../../utils/array'
import { FundingContext } from '../../context'
import { getDelegateProfiles } from '../../actions/profiles'
import { getDelegatePledgesByProfile } from '../../actions/delegates'

const callOrderFns = [getFilesWeb, getFilesWebTheGraph, getFiles]
async function getProjectAge(data, setState){
  if (data.profile) {
    setState(timeSinceBlock(data.profile.creationTime, 'days'))
  } else {
    setState(timeSinceBlock(false, 'days'))
  }
}

async function getProjectCreator(data, setState){
  if (!data.profile) return
  const { addr } = data.profile
  setState(addr)
}

async function tryIpfsGets(CID, setState, index=0){
  const ipfsFn = callOrderFns[index]
  ipfsFn(CID)
    .then((files) => {
      setState(files)
    })
    .catch(async (err) => {
      console.log('IPFS getFilesWeb error: ', err, 'Attempt: ', index + 1)
      if (callOrderFns[index + 1]) tryIpfsGets(CID, setState, index + 1)
    })
}

async function getProjectAssets(data, setState, debug=false){
  if (!data.profile) return
  const { profile: { url } } = data
  const CID = url.split('/').slice(-1)[0]
  if (debug) console.log({CID, data, ipfs})
  tryIpfsGets(CID, setState)
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

const isManifest = asset => {
  const name = asset.path.split('/').slice(-1)[0]
  return name.toLowerCase() === 'manifest.json'
}
const getProjectManifest = (data, assets) => {
  if (data && data.profile && data.profile.projectInfo) {
    const { isPlaying, type, file } = data.profile.projectInfo
    return {
      ...data.profile.projectInfo,
      media: {
        isPlaying,
        type,
        file
      }
    }
  }

  if (!assets) {
    return null;
  }

  const manifest = assets.find(isManifest);
  if (!manifest) {
    return null;
  }
  try {
    return JSON.parse(manifest.content)
  } catch (e) {
    return null;
  }
}

export function useProjectData(projectId, data) {
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
    getProjectAge(data, setAge)
  }, [data, projectId])

  useEffect(() => {
    getProjectCreator(data, setCreator)
  }, [data, projectId])

  useEffect(() => {
    getProjectAssets(data, setAssets)
  }, [ipfsReady, data])

  const manifest = useMemo(() => getProjectManifest(data, projectAssets), [data, projectAssets, projectId])

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
