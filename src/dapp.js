/*global web3*/
import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import EmbarkJS from './embarkArtifacts/embarkjs'
import LiquidPledging from './embarkArtifacts/contracts/LiquidPledging'
import Snackbar from '@material-ui/core/Snackbar'
import { ApolloProvider } from '@apollo/react-hooks'
import ApolloClient from 'apollo-boost'
import { initVaultAndLP, vaultPledgingNeedsInit, standardTokenApproval } from './utils/initialize'
import { getAuthorizedPayments } from './utils/events'
import { FundingContext } from './context'
import MainCointainer from './components/MainCointainer'
import { getAndAddLpEvents } from './actions/lpEvents'
import { getAndAddVaultEvents } from './actions/vaultEvents'
import { addFormattedProfiles } from './actions/profiles'
import { updateStalePledges, getAndAddPledges } from './actions/pledges'
import { updateDelegates } from './actions/delegates'
import { MySnackbarContentWrapper } from './components/base/SnackBars'
import { getUsdPrice, getPrices, generatePairKey } from './utils/prices'
import { uris } from './remote/graph'
import Loading from './components/base/Loading'

const { getNetworkType } = web3.eth.net

class App extends React.Component {
  state = {
    loading: true,
    lpAllowance: 0,
    needsInit: true,
    prices: {}
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

          const graphUri = uris[network]
          this.client = new ApolloClient({
            uri: graphUri,
          })
          const account = await web3.eth.getCoinbase()
          this.getAndSetPrices()
          this.setState({ account })
          //TODO add block based sync
          const authorizedPayments = await getAuthorizedPayments()
          this.syncWithRemote()
          this.setState({
            account,
            network,
            graphUri,
            environment,
            authorizedPayments,
            needsInit: false
          })
        }
      })
    })
  }

  syncWithRemote = async () => {
    this.setState({ loading: true })
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

  getAndSetPrices = async () => {
    const prices = await getPrices()
    this.setState({ prices })
  }

  openSnackBar = (variant, message) => {
    this.setState({ snackbar: { variant, message } })
  }

  closeSnackBar = () => {
    this.setState({ snackbar: null })
  }

  appendPledges = () => {
    // TODO check if this is correct
    getAndAddPledges()
  }

  updateUsdPrice = async ticker => {
    const { prices } = this.state
    const key = generatePairKey(ticker, 'USD')
    const price = await getUsdPrice(ticker)
    this.setState({ prices: { ...prices, [key]: price }})
  }

  render() {
    const { account, needsInit, lpAllowance: _lpAllowance, loading, authorizedPayments, snackbar, prices } = this.state
    const { appendFundProfile, appendPledges, transferPledgeAmounts, openSnackBar, closeSnackBar, syncWithRemote, updateUsdPrice, client } = this
    const fundingContext = {
      appendPledges,
      appendFundProfile,
      account,
      transferPledgeAmounts,
      authorizedPayments,
      needsInit,
      initVaultAndLP,
      standardTokenApproval,
      openSnackBar,
      closeSnackBar,
      syncWithRemote,
      prices,
      updateUsdPrice
    }

    if (client) return (
      <ApolloProvider client={client}>
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
      </ApolloProvider>
    )
    return <Loading />
  }
}

export default App
