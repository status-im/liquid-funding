import { action, field } from '@nozbe/watermelondb/decorators'
import { LiquidModel } from '../utils/models'


export default class Profile extends LiquidModel {
  static table = 'profiles'

  @field('addr') addr
  @field('event_id') eventId
  @field('canceled') canceled
  @field('commit_time') commitTime
  @field('type') type
  @field('name') name
  @field('url') url
  @field('id_profile') idProfile

  @action async markAsCanceled() {
    await this.update(profile => {
      profile.canceled = true
    })
  }
}
