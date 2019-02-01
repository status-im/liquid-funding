import { Model } from '@nozbe/watermelondb'
import { action, field, json } from '@nozbe/watermelondb/decorators'


const sanitizeValues = json => json
export default class LpEvent extends Model {
  static table = 'lp_events'

  @field('address') address

  @field('event_id') eventId

  @field('event') event

  @field('block_number') blockNumber

  @json('return_values', sanitizeValues) returnValues

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

