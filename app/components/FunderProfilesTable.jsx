import React, { Fragment } from 'react'
import MaterialTable from 'material-table'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import withObservables from '@nozbe/with-observables'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import ProfileUrlViewer from './image/ProfileUrlViewer'
import { FundingContext } from '../context'

const { cancelProject } = LiquidPledging.methods

const convertToHours = seconds => seconds / 60 / 60
const cancelText = canceled => canceled ? 'Yes' : 'No'
const formatField = field => ({
  ...field.getFields(),
  commitTime: convertToHours(field.commitTime),
  canceled: cancelText(field.canceled)
})
const FunderProfilesTable = ({ profiles }) => (
  <FundingContext.Consumer>
    {({ account }) =>
      <Fragment>
        <MaterialTable
          columns={[
            { title: 'Profile Id', field: 'idProfile', type: 'numeric' },
            { title: 'Name', field: 'name' },
            { title: 'Url', field: 'url' },
            { title: 'Admin Address', field: 'addr'},
            { title: 'Commit Time', field: 'commitTime', type: 'numeric' },
            { title: 'Type', field: 'type' },
            { title: 'Canceled', field: 'canceled' }
          ]}
          data={profiles.map(formatField)}
          title="Funding Profiles"
          options={{ showEmptyDataSourceMessage: true }}
          actions={[
            rowData => ({
              icon: 'cancel',
              disabled: !account || rowData.addr.toLowerCase() != account.toLowerCase(),
              tooltip: 'Cancel',
              onClick: (event, rowData) => {
                cancelProject(rowData.idProject || rowData.idProfile)
                  .send()
                  .then(async res => {
                    console.log({res})
                    const profile = profiles.find(p => p.idProfile == rowData.idProfile)
                    await profile.markAsCanceled()
                  })
              }
            })
          ]}
          detailPanel={rowData => <ProfileUrlViewer url={rowData.url} />}
        />
      </Fragment>
    }
  </FundingContext.Consumer>
)

export default withDatabase(withObservables([], ({ database }) => ({
  profiles: database.collections.get('profiles').query().observeWithColumns(['canceled']),
}))(FunderProfilesTable))
