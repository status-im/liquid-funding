import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'

import schema from './model/schema'
import LpEvent from './model/lpEvents'

const adapter = new LokiJSAdapter({
  schema,
})

const database = new Database({
  adapter,
  modelClasses: [
    LpEvent
  ],
  actionsEnabled: true,
})

export default database
