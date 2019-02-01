import { Q } from '@nozbe/watermelondb'
import database from '../db'
import { ALL_EVENTS, getAllVaultEvents } from '../utils/events'

const vaultCollection = database.collections.get('vault_events')
export const addEvent = async data => {
  await database.action(async () => {
    const res = await vaultCollection.create(lpEvent => {
      const { event, address, id, blockNumber } = data
      lpEvent.eventId = id
      lpEvent.address = address
      lpEvent.event = event
      lpEvent.blockNumber = blockNumber
    })
    return res
  })
}

export const batchAddEvents = async events => {
  const batch = events.map(e => {
    return vaultCollection.prepareCreate(lpEvent => {
      const { event, address, id, blockNumber, returnValues } = e
      lpEvent.eventId = id
      lpEvent.address = address
      lpEvent.event = event
      lpEvent.blockNumber = blockNumber
      lpEvent.returnValues = returnValues
    })
  })
  return await database.action(async () => await database.batch(...batch))
}

export const getVaultEventById = async id => {
  const event = await vaultCollection.query(
    Q.where('event_id', id)
  ).fetch()
  return event
}

export const getLastBlockStored = async () => {
  const col = await vaultCollection.query().fetch()
  const blockNumber = col.length
        ? col.sort((a,b) => b.blockNumber - a.blockNumber)[0].blockNumber
        : 0
  return blockNumber
}

export const getAndAddVaultEvents = async () => {
  const lastBlock = await getLastBlockStored()
  const events = await getAllVaultEvents(lastBlock + 1)
  batchAddEvents(events)
}
