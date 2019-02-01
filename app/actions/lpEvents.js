import { Q } from '@nozbe/watermelondb'
import database from '../db'
import { getAllLPEvents, GIVER_ADDED, DELEGATE_ADDED, PROJECT_ADDED } from '../utils/events'

const lpCollection = database.collections.get('lp_events')
export const addEvent = async data => {
  await database.action(async () => {
    const res = await lpCollection.create(lpEvent => {
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
    return lpCollection.prepareCreate(lpEvent => {
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

export const getLatestProfileEvents = async eventIds => {
  const events = await lpCollection.query(
    Q.where(
      'id',
      Q.notIn(eventIds)
    ),
    Q.where(
      'event',
      Q.oneOf([GIVER_ADDED, DELEGATE_ADDED, PROJECT_ADDED])
    )
  ).fetch()
  return events
}


export const getLpEventById = async id => {
  const event = await lpCollection.query(
    Q.where('event_id', id)
  ).fetch()
  return event
}

export const getLastBlockStored = async () => {
  const col = await lpCollection.query().fetch()
  const blockNumber = col.length
        ? col.sort((a,b) => b.blockNumber - a.blockNumber)[0].blockNumber
        : 0
  return blockNumber
}

export const getAndAddLpEvents = async () => {
  const lastBlock = await getLastBlockStored()
  const events = await getAllLPEvents(lastBlock + 1)
  batchAddEvents(events)
}
