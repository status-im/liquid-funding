/*global web3*/
/*global process*/
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
import Footer from './components/Footer'
import { getAndAddLpEvents } from './actions/lpEvents'
import { getAndAddVaultEvents } from './actions/vaultEvents'
import { addFormattedProfiles } from './actions/profiles'
import { updateStalePledges, getAndAddPledges } from './actions/pledges'
import { updateDelegates } from './actions/delegates'
import { MySnackbarContentWrapper } from './components/base/SnackBars'
import { getUsdPrice, getPrices, generatePairKey } from './utils/prices'
import { currencies, currencyOrder } from './utils/currencies'
import { uris } from './remote/graph'
import { getKyberCurrencies } from './remote/kyber'

const { getNetworkType } = web3.eth.net

class App extends React.Component {
  state = {
    loading: false,
    lpAllowance: 0,
    needsInit: true,
    prices: {}
  };

  componentDidMount(){
    const network = process.env.REACT_APP_NETWORK || 'ropsten'
    this.setCurrencies(network)
    this.setGraphClient(network)
    this.grabAddress()
  }

  grabAddress = () => {
    if (window.ethereum) {
      this.accountListener()
      const { selectedAddress: account } = window.ethereum
      if (account) this.setState({ account })
    } else {
      console.log('window.ethreum not found :', {window})
    }
  }

  setCurrencies = async network => {
    const kyberCurrencies = await getKyberCurrencies(network)
    this.currencies = [...currencies, ...kyberCurrencies].sort(currencyOrder)
    this.getAndSetPrices()
  }

  setGraphClient = network => {
    const graphUri = uris[network]
    const client = new ApolloClient({
      uri: graphUri
    })
    this.client = client
    this.setState({ clientReady: true })
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

  accountListener = () => {
    let self = this
    try {
      window.ethereum.on('accountsChanged', function (accounts) {
        const [account] = accounts
        self.setState({ account })
      })
    } catch (error) {
      console.error('accountsChanged listener : ', {error})
    }
  }

  enableEthereum = async () => {
    try {
      const accounts = await EmbarkJS.enableEthereum();
      const account = accounts[0]
      this.setState({ account })
      this.web3Init()
      return account
    } catch (error) {
      console.error('Enable Ethereum :', {error})
    }
  }

  getAndSetPrices = async () => {
    const currencies = this.currencies.map(c => c.label)
    const prices = await getPrices(currencies)
    this.setState({ prices })
  }

  openSnackBar = (variant, message) => {
    if (typeof message === 'object') {
      const msg = message.message
      this.setState({ snackbar: { variant, message: msg } })
    } else {
      this.setState({ snackbar: { variant, message } })
    }
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

  web3Init = () => {
    EmbarkJS.onReady(async (err) => {
      if (err) {
        console.error(err);
      } else {
        getNetworkType().then(async network => {
          const { environment } = EmbarkJS
          const isInitialized = await vaultPledgingNeedsInit()
          if (isInitialized) {
            if (environment === 'development') console.log('mock_time:', await LiquidPledging.mock_time.call())
            const authorizedPayments = await getAuthorizedPayments()
            this.syncWithRemote()
            this.setState({
              network,
              environment,
              authorizedPayments,
              needsInit: false
            })
          }
        })
      }
    })
  }

  render() {
    const { account, needsInit, lpAllowance: _lpAllowance, loading, authorizedPayments, snackbar, prices } = this.state
    const { appendFundProfile, appendPledges, transferPledgeAmounts, openSnackBar, closeSnackBar, currencies, syncWithRemote, updateUsdPrice, client, enableEthereum } = this
    const fundingContext = {
      appendPledges,
      appendFundProfile,
      account,
      currencies,
      enableEthereum,
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
            <MainCointainer loading={loading} enableEthereum={enableEthereum} account={account} />
            <Footer />
          </Router>
          {snackbar && <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={snackbar}
            autoHideDuration={6000}
            onClose={closeSnackBar}>
            <MySnackbarContentWrapper
              variant={snackbar && snackbar.variant}
              message={snackbar && snackbar.message}
            />
          </Snackbar>}
        </FundingContext.Provider>
      </ApolloProvider>
    )
    return null
  }
}

export default App
