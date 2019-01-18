import { field } from '@nozbe/watermelondb/decorators'
import { LiquidModel } from '../utils/models'


export default class Profiles extends LiquidModel {
  static table = 'profiles'

  @field('addr') addr
  @field('canceled') canceled
  @field('commit_time') commitTime
  @field('type') type
  @field('name') name
  @field('url') url
  @field('id_profile') idProfile
}
