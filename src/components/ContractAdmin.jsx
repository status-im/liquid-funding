import React, { Fragment } from 'react'
import { Button, Divider } from '@material-ui/core'
import { FundingContext } from '../context'
import database from '../db'


async function resetDb(openSnackBar) {
  await database.unsafeResetDatabase()
  openSnackBar('success', 'Database has been reset. Refresh the page to populate it')
}

const ContractAdmin = () => (
  <FundingContext.Consumer>
    {({ needsInit, initVaultAndLP, standardTokenApproval, openSnackBar }) =>
      <Fragment>
        <Button color="secondary" variant="contained" onClick={() => resetDb(openSnackBar)}>RESET DATABASE</Button>
        <Divider />
        {needsInit && <Button variant="outlined" color="secondary" onClick={initVaultAndLP}>
          Initialize Contracts
        </Button>}
        {needsInit && <Button variant="outlined" color="primary" onClick={standardTokenApproval}>
          GIVE VAULT TOKEN APPROVAL
        </Button>}
      </Fragment>
    }
  </FundingContext.Consumer>
)

export default ContractAdmin
