import { action, field, relation } from '@nozbe/watermelondb/decorators'
import { LiquidModel } from '../utils/models'


export default class Pledge extends LiquidModel {
  static table = 'pledges'
  static associations = {
    profiles: { type: 'belongs_to', key: 'id_profile' },
  }

  @field('pledge_id') pledgeId
  @field('owner_id') owner
  @field('amount') amount
  @field('token') token
  @field('commit_time') commitTime
  @field('n_delegates') nDelegates
  @field('intended_project') intendedProject
  @field('pledge_state') pledgeState
  @relation('profiles', 'id_profile') profile

}
