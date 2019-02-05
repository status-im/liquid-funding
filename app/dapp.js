import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import EmbarkJS from 'Embark/EmbarkJS'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import web3 from 'Embark/web3'
import { initVaultAndLP, vaultPledgingNeedsInit, standardTokenApproval, getLpAllowance } from './utils/initialize'
import { getAuthorizedPayments } from './utils/events'
import { FundingContext } from './context'
import MainCointainer from './components/MainCointainer'
import { getAndAddLpEvents } from './actions/lpEvents'
import { getAndAddVaultEvents } from './actions/vaultEvents'
import { addFormattedProfiles } from './actions/profiles'
import { updateStalePledges, getAndAddPledges } from './actions/pledges'

const { getNetworkType } = web3.eth.net

class App extends React.Component {
  state = {
    loading: true,
    lpAllowance: 0,
    needsInit: true,
  };

  componentDidMount(){
    EmbarkJS.onReady(async (err) => {
      getNetworkType().then(async network => {
        const { environment } = EmbarkJS
        const isInitialized = await vaultPledgingNeedsInit()
        if (!!isInitialized) {
          if (environment === 'development') console.log('mock_time:', await LiquidPledging.mock_time.call())

          const lpAllowance = await getLpAllowance()
          //TODO add block based sync
          const authorizedPayments = await getAuthorizedPayments()
          const account = await web3.eth.getCoinbase()
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
    await getAndAddPledges()
    await addFormattedProfiles()
    await updateStalePledges()
    this.setState({ loading: false })
  }

  render() {
    const { account, needsInit, lpAllowance, loading, authorizedPayments } = this.state
    const { appendFundProfile, appendPledges, transferPledgeAmounts } = this
    const fundingContext = { appendPledges, appendFundProfile, account, transferPledgeAmounts, authorizedPayments, needsInit, initVaultAndLP, standardTokenApproval  }
    return (
      <FundingContext.Provider value={fundingContext}>
        <Router>
          <MainCointainer loading={loading} />
        </Router>
      </FundingContext.Provider>
    )
  }
}

export default App
