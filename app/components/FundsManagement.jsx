import React from 'react'
import Divider from '@material-ui/core/Divider'
import { FundingContext } from '../context'
import PledgesTable from './PledgesTable'
import FunderProfilesTable from './FunderProfilesTable'
import AddFunder from './AddFunder'
import CreateFunding from './CreateFunding'

const FundsManagement = ({ open }) => {
  const windowWidth = window.visualViewport.width
  const maxWidth = open ? `${windowWidth * 0.80}px` : '90vw'
  const WebkitTransition = 'all 0.25s ease-out 0s'
  return (
    <FundingContext.Consumer>
      {({ appendPledges, appendFundProfile }) =>
        <div style={{ maxWidth, WebkitTransition }}>
          <PledgesTable />
          <FunderProfilesTable />
          <AddFunder appendFundProfile={appendFundProfile} />
          <Divider variant="middle" />
          <CreateFunding refreshTable={appendPledges} />
        </div>
      }
    </FundingContext.Consumer>
  )
}

export default FundsManagement
