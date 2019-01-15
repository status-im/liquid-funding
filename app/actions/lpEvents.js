import { Q } from '@nozbe/watermelondb'
import database from '../db'

const lpCollection = database.collections.get('lp_events')
export const addEvent = async data => {
  await database.action(async () => {
    const res = await lpCollection.create(lpEvent => {
      const { event, address, id, blockNumber } = data
      lpEvent.eventId = id
      lpEvent.address = address
      lpEvent.event = event
      lpEvent.blockNumber = blockNumber
      return lpEvent
    })
    return res
  })
}

export const batchAddEvents = async events => {
  const batch = events.map(e => {
    return lpCollection.prepareCreate(lpEvent => {
      const { event, address, id, blockNumber } = e
      lpEvent.eventId = id
      lpEvent.address = address
      lpEvent.event = event
      lpEvent.blockNumber = blockNumber
      return lpEvent
    })
  })
  console.log({batch})
  return await database.action(async () => await database.batch(...batch))
}


export const getLpEventById = async id => {
  const event = await lpCollection.query(
    //Q.where('event_id', id)
  ).fetch()
  console.log({event})
  return event
}
