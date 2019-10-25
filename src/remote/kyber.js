/*global web3*/
import ERC20 from '../embarkArtifacts/contracts/ERC20'
import { isNil } from 'ramda'
import {
  TOKEN_API,
  generateHumanReadibleFn,
  generateChainReadibleFn,
  getLpAllowance,
  generateSetApprovalFn
} from '../utils/currencies'

function createERC20Instance(address) {
  return new web3.eth.Contract(ERC20._jsonInterface, address)
}

function mapToCurrencyFormat(currency) {
  const { id, address, symbol, decimals } = currency
  const contract = createERC20Instance(address)
  return {
    value: address,
    label: symbol,
    img: `${TOKEN_API}/${id}.png`,
    width: '2rem',
    contract,
    humanReadibleFn: generateHumanReadibleFn(decimals),
    chainReadibleFn: generateChainReadibleFn(decimals),
    getAllowance: () => getLpAllowance(contract),
    setAllowance: generateSetApprovalFn(contract)
  }
}

function currencyFilter(currency) {
  if (isNil(currency)) return false
  if (currency.symbol === 'ETH') return false
  return true
}

export const kyberCurrencies = {
  ropsten: 'https://ropsten-api.kyber.network/currencies',
  livenet: 'https://api.kyber.network/currencies'
}

export const getKyberCurrencies = async network => {
  const uri = kyberCurrencies[network]
  const res = await fetch(uri)
  let currencies = await res.json()
  currencies = currencies.data
  if (network !== 'livenet') {
    const res = await fetch(kyberCurrencies['livenet'])
    let livenetCurrencies = await res.json()
    livenetCurrencies = livenetCurrencies.data
    return currencies.map(currency => {
      const { symbol } = currency
      const livenetCurrency = livenetCurrencies.find(c => c.symbol === symbol)
      return livenetCurrency ? { ...currency, id: livenetCurrency.id } : null
    }).filter(currencyFilter).map(mapToCurrencyFormat)
  }
  return currencies.filter(currencyFilter).map(mapToCurrencyFormat)
}
