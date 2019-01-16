import { Model } from '@nozbe/watermelondb'
import { action } from '@nozbe/watermelondb/decorators'
import { fieldGenerator } from '../utils/db'

export default class LpEvent extends Model {
  constructor(...args) {
    super(...args)
    const field = fieldGenerator(this)
    field('event_id', 'eventId')
    field('address')
    field('event')
    field('block_number', 'blockNumber')
  }

  static table = 'lp_events'

  @action async addEvent(data) {
    return await this.create(lpEvent => {
      const { event, address, id, blockNumber } = data
      lpEvent.eventId = id
      lpEvent.address = address
      lpEvent.event = event
      lpEvent.blockNumber = blockNumber
    })
  }
}
