/*global web3*/
import SNT from '../embarkArtifacts/contracts/SNT'
import SwapProxy from '../embarkArtifacts/contracts/SwapProxy'
import { toEther, toWei } from './conversions'

export const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/images'
export const TOKEN_COIN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/coins'
export const TOKEN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
export const NEW_TOKEN_ICON_API = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/'
export const currencies = [
  {
    value: 'ETH',
    label: 'ETH',
    img: `${TOKEN_COIN_API}/60.png`,
    width: '2rem',
    humanReadibleFn: toEther,
    chainReadibleFn: toWei,
    getAllowance: () => 2**255
  },
  {
    value: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    label: 'WBTC',
    img: `${TOKEN_API}/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png`,
    width: `2rem`,
  }
]

export const getTokenByAddress = (value, currencies = currencies) => currencies.find(currency => currency.value.toLowerCase() === value.toLowerCase())
export const getHumanAmountFormatter = (tokenAddress, currencies = currencies) => getTokenByAddress(tokenAddress, currencies).humanReadibleFn
export const getTokenLabel = (value, currencies = currencies) => {
  const token = getTokenByAddress(value, currencies)
  return token ? token.label : null
}

export const getTokenAddress = label => {
  const token = currencies.find(currency => currency.label === label)
  return token ? token.value : null
}

export const getFormattedPledgeAmount = pledge => {
  const { humanReadibleFn } = getTokenByAddress(pledge.token)
  return humanReadibleFn(pledge.amount)
}

export const getAllowanceFromAddress = (tokenAddress, currencies = currencies) => {
  const token = getTokenByAddress(tokenAddress, currencies)
  return token.getAllowance()
}

export const setAllowanceFromAddress = async (tokenAddres, amount) => {
  const token = getTokenByAddress(tokenAddres)
  return token.setAllowance(amount)
}

export const getLpAllowance = async (contract, spender = SwapProxy._address) => {
  const { methods: { allowance } } = contract || SNT
  const account = await web3.eth.getCoinbase()
  const allowanceAmt = await allowance(account, spender).call()
  return allowanceAmt
}

export const transferApproval = (contract, amount, spender = SwapProxy) => {
  const { methods: { approve } } = contract || SNT
  const spenderAddress = spender._address
  return approve(
    spenderAddress,
    amount
  )
}

export const generateSetApprovalFn = contract =>
  (amount, spender = SwapProxy) => transferApproval(contract, amount, spender)

export const generateHumanReadibleFn = decimals =>
  num => (num / (10**decimals)).toString()

export const generateChainReadibleFn = decimals =>
  num => (num * (10**decimals)).toString()

const order = ['ETH', 'SNT', 'DAI'].reverse()
export const currencyOrder = (a, b) => order.indexOf(b.label) - order.indexOf(a.label)
