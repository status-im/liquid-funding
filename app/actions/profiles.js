import { Q } from '@nozbe/watermelondb'
import database from '../db'
import { getLatestProfileEvents } from './lpEvents'
import { formatFundProfileEvent } from '../utils/events'

const profilesCollection = database.collections.get('profiles')
export const addProfile = async data => {
  return await database.action(async () => {
    const res = await profilesCollection.create(profile => {
      const { id, addr, canceled, commitTime, type, name, url, idProfile } = data
      profile.eventId = id
      profile.addr = addr
      profile.canceled = canceled
      profile.commitTime = Number(commitTime)
      profile.type = type
      profile.name = name
      profile.url = url
      profile.idProfile = Number(idProfile)
    })
    return res
  })
}

export const batchAddProfiles = async profiles => {
  const batch = profiles.map(data => {
    return profilesCollection.prepareCreate(profile => {
      const { id, addr, canceled, commitTime, type, name, url, idProfile } = data
      profile.eventId = id
      profile.addr = addr
      profile.canceled = canceled
      profile.commitTime = Number(commitTime)
      profile.type = type
      profile.name = name
      profile.url = url
      profile.idProfile = Number(idProfile)
    })
  })
  return await database.action(async () => await database.batch(...batch))
}

export const addFormattedProfiles = async () => {
  const allProfiles = await getAllProfiles()
  const allEventIds = allProfiles.map(p => p.eventId)
  const events = await getLatestProfileEvents(allEventIds)
  const formattedEvents = await Promise.all(
    events.map(formatFundProfileEvent)
  )
  await batchAddProfiles(formattedEvents)
}

export const getAllProfiles = async () => {
  const events = await profilesCollection.query().fetch()
  return events
}

export const getProfileById = async id => {
  const event = await profilesCollection.query(
    Q.where('id_profile', id)
  ).fetch()
  return event
}

export const getProfilesById = async ids => {
  const event = await profilesCollection.query(
    Q.where(
      'id_profile',
      Q.oneOf(ids)
    )
  ).fetch()
  return event
}

export const getDelegateProfiles = async addr => {
  const event = await profilesCollection.query(
    Q.where('addr', addr)
  ).fetch()
  return event
}
