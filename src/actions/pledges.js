/*global web3*/
import { Q } from '@nozbe/watermelondb'
import database from '../db'
import { getPledges, getAllPledges } from '../utils/pledges'
import { getProfilesById } from './profiles'

const createPledge = (pledge, data, profiles) => {
  const { id, owner, amount, blockNumber, token, commitTime, nDelegates, pledgeState, intendedProject, delegates } = data
  const profile = profiles.find(p => p.idProfile === Number(owner))
  pledge.idPledge = Number(id)
  pledge.owner = Number(owner)
  pledge.amount = amount
  pledge.token = token
  pledge.commitTime = Number(commitTime)
  pledge.nDelegates = Number(nDelegates)
  pledge.pledgeState = Number(pledgeState)
  pledge.intendedProject = Number(intendedProject)
  pledge.blockNumber = Number(blockNumber)
  pledge.delegates = delegates
  pledge.profile.set(profile)
}

const pledgesCollection = database.collections.get('pledges')
export const addPledge = async data => {
  return database.action(async () => {
    const res = await pledgesCollection.create(pledge => createPledge(pledge, data))
    return res
  })
}

export const batchAddPledges = async (pledges, profiles = []) => {
  const batch = pledges.map(data => {
    return pledgesCollection.prepareCreate(pledge => createPledge(pledge, data, profiles))
  })
  return database.action(async () => database.batch(...batch))
}

const getLastPledge = pledges => {
  const idPledge = pledges.length ? pledges.sort((a,b) => b.idPledge - a.idPledge)[0].idPledge : 0
  return idPledge
}
export const getAndAddPledges = async () => {
  const pledges = await getLocalPledges()
  const idPledge = getLastPledge(pledges)
  const newPledges = await getAllPledges(idPledge + 1)
  const idPledges = newPledges.map(p => p.owner)
  const profiles = await getProfilesById(idPledges)
  batchAddPledges(newPledges, profiles)
}

export const updateStalePledges = async () => {
  //TODO optimize fetch based only on events
  const stalePledges = await getStalePledges()
  const updatedPledges = await getPledges(stalePledges)
  const batch = stalePledges.map(p => {
    const updated = updatedPledges[p.idPledge - 1]
    return p.prepareUpdate(p => {
      const { amount, nDelegates, pledgeState, blockNumber, commitTime } = updated
      p.amount = amount
      p.nDelegates = Number(nDelegates)
      p.pledgeState = Number(pledgeState)
      p.blockNumber = blockNumber
      p.commitTime = Number(commitTime)
    })
  })
  database.action(() => database.batch(...batch))
  console.log('updated batch completed')
}

export const getLocalPledges = async () => {
  const events = await pledgesCollection.query().fetch()
  return events
}

export const getStalePledges = async () => {
  const blockNumber = await web3.eth.getBlockNumber()
  const pledges = await pledgesCollection.query(
    Q.where('block_number', Q.lt(blockNumber))
  ).fetch()
  return pledges
}

export const getPledgeById = async id => {
  const event = await pledgesCollection.query(
    Q.where('id_profile', id)
  ).fetch()
  return event
}

export const getPledgesWithDelegates = async () => {
  const event = await pledgesCollection.query(
    Q.where('n_delegates', Q.gt(0))
  ).fetch()
  return event
}
