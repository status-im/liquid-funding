import React from 'react'
import PropTypes from 'prop-types'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import withObservables from '@nozbe/with-observables'
import PledgeAllocationsChart from './dashboard/PledgeAllocationsChart'
import FundingSummary from './dashboard/FundingSummary'

const Dashboard = ({ pledges }) => (
  <div>
    <FundingSummary title="Funding Summary" pledges={pledges} />
    <PledgeAllocationsChart title="Pledge Allocations" pledges={pledges} />
  </div>
)

Dashboard.propTypes = {
  pledges: PropTypes.array.isRequired
}

export default withDatabase(withObservables([], ({ database }) => ({
  pledges: database.collections.get('pledges').query().observe()
}))(Dashboard))

