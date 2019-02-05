import { action, field, children } from '@nozbe/watermelondb/decorators'
import { LiquidModel } from '../utils/models'


export default class Profile extends LiquidModel {
  static table = 'profiles'
  static associations = {
    pledges: { type: 'has_many', foreignKey: 'profile_id' }
  }

  @field('addr') addr
  @field('event_id') eventId
  @field('canceled') canceled
  @field('commit_time') commitTime
  @field('type') type
  @field('name') name
  @field('url') url
  @field('id_profile') idProfile
  @field('block_number') blockNumber
  @children('pledges') pledges

  @action async markAsCanceled() {
    await this.update(profile => {
      profile.canceled = true
    })
  }
}
