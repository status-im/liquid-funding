/*global web3*/
import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import EmbarkJS from './embarkArtifacts/embarkjs'
import LiquidPledging from './embarkArtifacts/contracts/LiquidPledging'
import Snackbar from '@material-ui/core/Snackbar'
import { initVaultAndLP, vaultPledgingNeedsInit, standardTokenApproval, getLpAllowance } from './utils/initialize'
import { getAuthorizedPayments } from './utils/events'
import { FundingContext } from './context'
import MainCointainer from './components/MainCointainer'
import { getAndAddLpEvents } from './actions/lpEvents'
import { getAndAddVaultEvents } from './actions/vaultEvents'
import { addFormattedProfiles } from './actions/profiles'
import { updateStalePledges, getAndAddPledges } from './actions/pledges'
import { updateDelegates } from './actions/delegates'
import { MySnackbarContentWrapper } from './components/base/SnackBars'

const { getNetworkType } = web3.eth.net

class App extends React.Component {
  state = {
    loading: true,
    lpAllowance: 0,
    needsInit: true,
  };

  componentDidMount(){
    EmbarkJS.onReady(async (err) => {
      if (err) {
        console.error(err);
      }
      getNetworkType().then(async network => {
        const { environment } = EmbarkJS
        const isInitialized = await vaultPledgingNeedsInit()
        if (isInitialized) {
          if (environment === 'development') console.log('mock_time:', await LiquidPledging.mock_time.call())

          const account = await web3.eth.getCoinbase()
          this.setState({ account })
          const lpAllowance = await getLpAllowance()
          //TODO add block based sync
          const authorizedPayments = await getAuthorizedPayments()
          this.syncWithRemote()
          this.setState({
            account,
            network,
            environment,
            lpAllowance,
            authorizedPayments,
            needsInit: false
          })
        }
      })
    })
  }

  async syncWithRemote() {
    // not running in parallel due to possible metamask / infura limitation
    await getAndAddLpEvents()
    await getAndAddVaultEvents()

    // Profiles must be loaded before pledges to set profile on pledge model
    await addFormattedProfiles()
    await getAndAddPledges()
    await updateStalePledges()
    await updateDelegates()
    this.setState({ loading: false })
  }

  openSnackBar = (variant, message) => {
    this.setState({ snackbar: { variant, message } })
  }

  closeSnackBar = () => {
    this.setState({ snackbar: null })
  }

  render() {
    const { account, needsInit, lpAllowance: _lpAllowance, loading, authorizedPayments, snackbar } = this.state
    const { appendFundProfile, appendPledges, transferPledgeAmounts, openSnackBar, closeSnackBar } = this
    const fundingContext = { appendPledges, appendFundProfile, account, transferPledgeAmounts, authorizedPayments, needsInit, initVaultAndLP, standardTokenApproval, openSnackBar, closeSnackBar  }
    return (
      <FundingContext.Provider value={fundingContext}>
        <Router>
          <MainCointainer loading={loading} />
        </Router>
        {snackbar && <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={snackbar}
          autoHideDuration={6000}
          onClose={closeSnackBar}
        >
          <MySnackbarContentWrapper
            variant={snackbar && snackbar.variant}
            message={snackbar && snackbar.message}
          />
        </Snackbar>}
      </FundingContext.Provider>
    )
  }
}

export default App
