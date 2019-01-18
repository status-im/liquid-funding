import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import schema from './model/schema'
import LpEvent from './model/lpEvents'
import Profile from './model/profile'

const adapter = new LokiJSAdapter({
  schema,
})

const database = new Database({
  adapter,
  modelClasses: [
    LpEvent,
    Profile
  ],
  actionsEnabled: true,
})

export default database
