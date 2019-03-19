import database from '../db'
import { Q } from '@nozbe/watermelondb'
import { getPledgesWithDelegates } from './pledges'
import { getProfilesById, getProfileById } from './profiles'

const delegatesCollection = database.collections.get('delegates')
export const getDelegateProfiles = async pledges => {
  const ids = []
  pledges.forEach(pledge => {
    const { delegates } = pledge
    delegates.forEach(d => ids.push(d.idDelegate))
  })
  return getProfilesById(ids)
}

const createDelegate = (newDelegate, delegateInfo, pledge, profile, idx) => {
  newDelegate.profile.set(profile)
  newDelegate.pledge.set(pledge)
  newDelegate.idPledge = pledge.idPledge
  newDelegate.delegateIndex = idx
}

const delegateRecordExists = (profile, pledge, idx, existing) => {
  const record = existing.find(delegate => {
    const { delegateIndex } = delegate
    if (
        profile.id == delegate.profile.id &&
        pledge.idPledge == delegate.idPledge &&
        idx == delegateIndex
    ) return true
    return false
  })
  return record
}

const batchAddDelegates = async (pledges, profiles, existing) => {
  const batch = []
  pledges.forEach(pledge => {
    const { delegates } = pledge
    delegates.forEach((delegateInfo, idx) => {
      const profile = profiles.find(p => p.idProfile == delegateInfo.idDelegate)
      const exists = delegateRecordExists(profile, pledge, idx+1, existing)
      if (!exists) {
        batch.push(
          delegatesCollection.prepareCreate(
            newDelegate => createDelegate(newDelegate, delegateInfo, pledge, profile, idx+1)
          )
        )
      }
    })
  })
  return database.action(async () => await database.batch(...batch))
}

export const updateDelegates = async () => {
  const pledges = await getPledgesWithDelegates()
  const profiles = await getDelegateProfiles(pledges)
  const delegates = await getExistingDelegates()
  batchAddDelegates(pledges, profiles, delegates)
}

export const getExistingDelegates = async () => {
  const delegates = await delegatesCollection.query().fetch()
  return delegates
}

export const getDelegatePledgesByProfile = async profile => {
  const delegates = await delegatesCollection.query(
    Q.where('profile_id', profile.id)
  ).fetch()
  return delegates
}

export const delegateExists = async (profileId, idPledge, idx) => {
  const delegates = await delegatesCollection.query(
    Q.where('profile_id', profileId),
    Q.where('id_pledge', idPledge),
    Q.where('delegate_index', idx)
  ).fetch()
  return delegates
}
