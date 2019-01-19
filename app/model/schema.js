import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'lp_events',
      columns: [
        { name: 'event_id', type: 'string' },
        { name: 'address', type: 'string' },
        { name: 'event', type: 'string' },
        { name: 'block_number', type: 'number', isIndexed: true },
      ]
    }),
    tableSchema({
      name: 'profiles',
      columns: [
        { name: 'event_id', type: 'string' },
        { name: 'addr', type: 'string' },
        { name: 'canceled', type: 'boolean' },
        { name: 'commit_time', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'id_profile', type: 'number' }
      ]

    })
  ]
})
