import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'lp_events',
      columns: [
        { name: 'event_id', type: 'string', isIndexed: true },
        { name: 'address', type: 'string' },
        { name: 'event', type: 'string', isIndexed: true },
        { name: 'block_number', type: 'number', isIndexed: true },
        { name : 'return_values', type: 'string', isOptional: true }
      ]
    }),
    tableSchema({
      name: 'vault_events',
      columns: [
        { name: 'event_id', type: 'string', isIndexed: true },
        { name: 'address', type: 'string' },
        { name: 'event', type: 'string', isIndexed: true },
        { name: 'block_number', type: 'number', isIndexed: true },
        { name: 'ref', type: 'number', isIndexed: true },
        { name : 'return_values', type: 'string', isOptional: true }
      ]
    }),
    tableSchema({
      name: 'profiles',
      columns: [
        { name: 'event_id', type: 'string' },
        { name: 'addr', type: 'string', isIndexed: true },
        { name: 'canceled', type: 'boolean' },
        { name: 'commit_time', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'id_profile', type: 'number', isIndexed: true },
        { name: 'block_number', type: 'number', isIndexed: true }
      ]
    }),
    tableSchema({
      name: 'pledges',
      columns: [
        { name: 'id_pledge', type: 'number', isIndexed: true },
        { name: 'owner_id', type: 'number', isIndexed: true },
        { name: 'amount', type: 'string' },
        { name: 'token', type: 'string' },
        { name: 'commit_time', type: 'number' },
        { name: 'n_delegates', type: 'number', isIndexed: true },
        { name: 'intended_project', type: 'number' },
        { name: 'pledge_state', type: 'number' },
        { name: 'profile_id', type: 'string', isIndexed: true },
        { name: 'block_number', type: 'number', isIndexed: true },
        { name : 'delegates', type: 'string', isOptional: true }
      ]
    }),
    tableSchema({
      name: 'delegates',
      columns: [
        { name: 'profile_id', type: 'string', isIndexed: true },
        { name: 'pledge_id', type: 'string', isIndexed: true },
        { name: 'id_pledge', type: 'number', isIndexed: true },
        { name: 'delegate_index', type: 'number', isIndexed: true }
      ]
    })
  ]
})
