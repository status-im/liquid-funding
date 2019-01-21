import { pick } from 'ramda'
import { Q } from '@nozbe/watermelondb'
import database from '../db'
import { getLatestProfileEvents } from './lpEvents'
import { formatFundProfileEvent } from '../utils/events'

const createPledge = (pledge, data) => {
  const { id, owner, amount, token, commitTime, nDelegates, pledgeState, intendedProject } = data
  pledge.pledgeId = id
  pledge.owner = Number(owner)
  pledge.amount = Number(amount)
  pledge.token = token
  pledge.commitTime = Number(commitTime)
  pledge.nDelegates = Number(nDelegates)
  pledge.pledgeState = pledgeState
  pledge.intendedProject = Number(intendedProject)
  pledge.profile.set(Number(id))
}

const pledgesCollection = database.collections.get('pledges')
export const addPledge = async data => {
  return await database.action(async () => {
    const res = await pledgesCollection.create(pledge => createPledge(pledge, data))
    return res
  })
}

export const batchAddPledges = async profiles => {
  const batch = profiles.map(data => {
    return pledgesCollection.prepareCreate(pledge => createPledge(pledge, data))
  })
  console.log({batch})
  return await database.action(async () => await database.batch(...batch))
}

export const addFormattedProfiles = async () => {
  const allProfiles = await getAllProfiles()
  const allEventIds = allProfiles.map(p => p.eventId)
  const events = await getLatestProfileEvents(allEventIds)
  const formattedEvents = await Promise.all(
    events.map(formatFundProfileEvent)
  )
  await batchAddPledges(formattedEvents)
}

export const getAllProfiles = async () => {
  const events = await pledgesCollection.query().fetch()
  return events
}

export const getPledgeById = async id => {
  const event = await pledgesCollection.query(
    Q.where('id_profile', id)
  ).fetch()
  return event
}
