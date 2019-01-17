import { Q } from '@nozbe/watermelondb'
import database from '../db'

const profilesCollection = database.collections.get('profiles')
export const addProfile = async data => {
  await database.action(async () => {
    const res = await profilesCollection.create(profile => {
      const { addr, canceled, commitTime, type, name, url, idProfile } = data
      //TODO add assignemnts
    })
    return res
  })
}

export const batchAddProfiles = async profiles => {
  const batch = profiles.map(data => {
    return profilesCollection.prepareCreate(profile => {
      const { addr, canceled, commitTime, type, name, url, idProfile } = data
      profile.addr = addr
      profile.canceled = canceled
      profile.commitTime = Number(commitTime)
      profile.type = type
      profile.name = name
      profile.url = url
      profile.idProfile = Number(idProfile)
    })
  })
  console.log({batch})
  return await database.action(async () => await database.batch(...batch))
}

export const getProfileById = async id => {
  const event = await profilesCollection.query(
    Q.where('id_profile', id)
  ).fetch()
  return event
}
