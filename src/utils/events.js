/*global web3*/
import LiquidPledging from '../embarkArtifacts/contracts/LiquidPledging'
import LPVault from '../embarkArtifacts/contracts/LPVault'

const AUTHORIZE_PAYMENT = 'AuthorizePayment'
export const GIVER_ADDED = 'GiverAdded'
export const DELEGATE_ADDED = 'DelegateAdded'
export const PROJECT_ADDED = 'ProjectAdded'
const ALL_EVENTS = 'allEvents'
const lookups = {
  [GIVER_ADDED]: {
    id: 'idGiver',
    type: 'Funder'
  },
  [DELEGATE_ADDED]: {
    id: 'idDelegate',
    type: 'Delegate'
  },
  [PROJECT_ADDED]: {
    id: 'idProject',
    type: 'Project'
  }
}

const hexToDecimal = hex => Number(parseInt(hex, 16))
const formatVaultEvent = async event => {
  const { returnValues } = event
  return {
    ...returnValues,
    ref: hexToDecimal(returnValues.ref)
  }
}

const getPastVaultEvents = async (event, raw = false, fromBlock = 0) => {
  const events = await LPVault.getPastEvents(event, {
    addr: await web3.eth.getCoinbase(),
    fromBlock,
    toBlock: 'latest'
  })
  if (raw) return events
  const formattedEvents = await Promise.all(
    events.map(formatVaultEvent)
  )
  return formattedEvents
}

const { getPledgeAdmin } = LiquidPledging.methods
export const formatFundProfileEvent = async event => {
  const lookup = lookups[event.event]
  const { id, returnValues: { url } } = event
  const idProfile = event.returnValues[lookup.id]
  const { addr, commitTime, name, canceled } = await getPledgeAdmin(idProfile).call()
  return {
    id,
    idProfile,
    url,
    commitTime,
    name,
    addr,
    canceled,
    type: lookups[event.event].type
  }
}

const getPastEvents = async (event, raw = false, fromBlock = 0) => {
  const events = await LiquidPledging.getPastEvents(event, {
    addr: await web3.eth.getCoinbase(),
    fromBlock,
    toBlock: 'latest'
  })
  if (raw) return events
  const formattedEvents = await Promise.all(
    events.map(formatFundProfileEvent)
  )
  return formattedEvents
}

export const lpEventsSubscription = async () => {
  //todo add on event handlers
  const events = await LiquidPledging.events.allEvents({
    fromBlock: 0,
    toBlock: 'latest'
  })
  return events
}
export const getFunderProfiles = async () => getPastEvents(GIVER_ADDED)
export const getDelegateProfiles = async () => getPastEvents(DELEGATE_ADDED)
export const getProjectProfiles = async () => getPastEvents(PROJECT_ADDED)
export const getAllLPEvents = async fromBlock => getPastEvents(
  ALL_EVENTS,
  true,
  fromBlock
)
export const getAuthorizedPayments = async () => getPastVaultEvents(AUTHORIZE_PAYMENT)
export const getAllVaultEvents = async (fromBlock = 0) => getPastVaultEvents(ALL_EVENTS,true, fromBlock)
export const getProfileEvents = async () => {
  const [funderProfiles, delegateProfiles, projectProfiles] =
        await Promise.all([getFunderProfiles(), getDelegateProfiles(), getProjectProfiles()])
  return [...funderProfiles, ...delegateProfiles, ...projectProfiles]
}
