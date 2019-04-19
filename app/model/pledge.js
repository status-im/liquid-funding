import { action, field, relation, json } from '@nozbe/watermelondb/decorators'
import { Q } from '@nozbe/watermelondb'
import { LiquidModel } from '../utils/models'

const createPledgeFromFunding = (pledge, newId, amount, oldPledge, project = 0) => {
  const { owner, token, commitTime, nDelegates, pledgeState, delegates, profile } = oldPledge
  pledge.idPledge = Number(newId)
  pledge.owner = Number(owner)
  pledge.amount = amount
  pledge.token = token
  pledge.commitTime = Number(commitTime)
  pledge.nDelegates = Number(nDelegates)
  pledge.pledgeState = Number(pledgeState)
  pledge.intendedProject = Number(project)
  pledge.delegates = delegates
  pledge.profile.set(profile)
}

const sanitizeValues = json => json
export default class Pledge extends LiquidModel {
  static table = 'pledges'
  static associations = {
    profiles: { type: 'belongs_to', key: 'profile_id' },
  }

  @field('id_pledge') idPledge
  @field('owner_id') owner
  @field('amount') amount
  @field('token') token
  @field('commit_time') commitTime
  @field('n_delegates') nDelegates
  @field('intended_project') intendedProject
  @field('pledge_state') pledgeState
  @field('block_number') blockNumber
  @relation('profiles', 'profile_id') profile
  @json('delegates', sanitizeValues) delegates

  @action async transferTo(to, amount, projectId) {
    const toPledgeQuery = await this.collections.get('pledges').query(
      Q.where('pledge_id', to)
    ).fetch()
    const pledgesCollection = await this.collections.get('pledges')
    const toPledge = toPledgeQuery[0]
    const args = [
      this.prepareUpdate(pledge => {
        pledge.amount = (BigInt(pledge.amount) - BigInt(amount)).toString()
      })
    ]
    if (toPledge) {
      args.push(
        toPledge.prepareUpdate(pledge => {
          pledge.amount = (BigInt(pledge.amount) + BigInt(amount)).toString()
        })
      )
    } else {
      args.push(
        pledgesCollection.prepareCreate(pledge => {
          createPledgeFromFunding(pledge, to, amount, this, projectId)
        })
      )
    }
    await this.batch(...args)
  }

  @action async updateFields(newPledge) {
    const { amount, nDelegates, pledgeState, blockNumber } = newPledge
    this.prepareUpdate(pledge => {
      pledge.amount = amount
      pledge.nDelegates = Number(nDelegates)
      pledge.pledgeState = pledgeState
      pledge.blockNumber = blockNumber
    })

  }
}
