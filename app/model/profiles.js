import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'


export default class Profiles extends Model {

  static table = 'profiles'

  @field('addr') addr
  @field('canceled') canceled
  @field('commit_time') commitTime
  @field('type') type
  @field('name') name
  @field('url') url
  @field('id_profile') idProfile

}
