import { Model } from '@nozbe/watermelondb'

export default class LpEvent extends Model {
  static table = 'lp_events'

  @field('event_id') eventId
  @field('address') address
  @field('event') event

}
