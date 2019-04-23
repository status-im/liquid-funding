import { field, relation } from '@nozbe/watermelondb/decorators'
import { LiquidModel } from '../utils/models'


export default class Delegate extends LiquidModel {
  static table = 'delegates'
  static associations = {
    profiles:{ type: 'belongs_to', key: 'profile_id' },
    pledges: { type: 'belongs_to', key: 'pledge_id' }
  }

  @field('delegate_index') delegateIndex
  @field('id_pledge') idPledge
  @relation('profiles', 'profile_id') profile
  @relation('pledges', 'pledge_id') pledge
}
