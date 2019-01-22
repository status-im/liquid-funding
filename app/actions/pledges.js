import { Q } from '@nozbe/watermelondb'
import database from '../db'
import { getAllPledges } from '../utils/pledges'
import { getProfilesById } from './profiles'

const createPledge = (pledge, data, profiles) => {
  const { id, owner, amount, token, commitTime, nDelegates, pledgeState, intendedProject } = data
  const profile = profiles.find(p => p.idProfile == owner)
  pledge.pledgeId = id
  pledge.owner = Number(owner)
  pledge.amount = Number(amount)
  pledge.token = token
  pledge.commitTime = Number(commitTime)
  pledge.nDelegates = Number(nDelegates)
  pledge.pledgeState = pledgeState
  pledge.intendedProject = Number(intendedProject)
  pledge.profile.id = profile.id
}

const pledgesCollection = database.collections.get('pledges')
export const addPledge = async data => {
  return await database.action(async () => {
    const res = await pledgesCollection.create(pledge => createPledge(pledge, data))
    return res
  })
}

export const batchAddPledges = async (pledges, profiles = []) => {
  const batch = pledges.map(data => {
    return pledgesCollection.prepareCreate(pledge => createPledge(pledge, data, profiles))
  })
  console.log({batch})
  return await database.action(async () => await database.batch(...batch))
}

const getLastPledge = pledges => {
  const pledgeId = pledges.length
        ? pledges.sort((a,b) => b.pledgeId - a.pledgeId)[0].pledgeId
        : 1
  return pledgeId
}
export const getAndAddPledges = async () => {
  const pledges = await getLocalPledges()
  const pledgeId = getLastPledge(pledges)
  const newPledges = await getAllPledges(pledgeId + 1)
  const pledgeIds = newPledges.map(p => p.owner)
  const profiles = await getProfilesById(pledgeIds)
  batchAddPledges(newPledges, profiles)
}

export const getLocalPledges = async () => {
  const events = await pledgesCollection.query().fetch()
  return events
}

export const getPledgeById = async id => {
  const event = await pledgesCollection.query(
    Q.where('id_profile', id)
  ).fetch()
  return event
}
