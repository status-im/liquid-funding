import { action, field, relation } from '@nozbe/watermelondb/decorators'
import { Q } from '@nozbe/watermelondb'
import { LiquidModel } from '../utils/models'


export default class Pledge extends LiquidModel {
  static table = 'pledges'
  static associations = {
    profiles: { type: 'belongs_to', key: 'profile_id' },
  }

  @field('pledge_id') pledgeId
  @field('owner_id') owner
  @field('amount') amount
  @field('token') token
  @field('commit_time') commitTime
  @field('n_delegates') nDelegates
  @field('intended_project') intendedProject
  @field('pledge_state') pledgeState
  @relation('profiles', 'profile_id') profile

  @action async transferTo(to, amount) {
    const toPledgeQuery = await this.collections.get('pledges').query(
      Q.where('pledge_id', to)
    ).fetch()
    const toPledge = toPledgeQuery[0]
    await this.batch(
      this.prepareUpdate(pledge => {
        pledge.amount = (BigInt(pledge.amount) - BigInt(amount)).toString()
      }),
      toPledge.prepareUpdate(pledge => {
        pledge.amount = (BigInt(pledge.amount) + BigInt(amount)).toString()
      })
    )
  }
}
