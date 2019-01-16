import { Model } from '@nozbe/watermelondb'
import { fieldGenerator } from '../utils/db'

export default class Profiles extends Model {
  constructor(...args) {
    super(...args)
    const field = fieldGenerator(this)
    field('addr')
    field('canceled')
    field('commit_time', 'commitTime')
    field('type')
    field('name')
    field('url')
    field('id_profile', 'idProfile')
  }

  static table = 'profiles'

}

