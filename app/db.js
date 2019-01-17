import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import schema from './model/schema'
import LpEvent from './model/lpEvents'
import Profiles from './model/profiles'

const adapter = new LokiJSAdapter({
  schema,
})

const database = new Database({
  adapter,
  modelClasses: [
    LpEvent,
    Profiles
  ],
  actionsEnabled: true,
})

export default database
