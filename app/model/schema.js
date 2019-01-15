import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'lp_events',
      columns: [
        { name: 'address', type: 'string' },
        { name: 'event', type: 'string' },
        { name: 'event_id', type: 'string' },
      ]
    })
  ]
})
