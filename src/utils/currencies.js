/*global web3*/
import SNT from '../embarkArtifacts/contracts/SNT'
import cDAI from '../embarkArtifacts/contracts/cDAI'
import cETH from '../embarkArtifacts/contracts/cETH'
import SwapProxy from '../embarkArtifacts/contracts/SwapProxy'
import { toEther, toWei, compoundWhole, compoundToChain } from './conversions'

export const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/images'
export const TOKEN_COIN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/coins'
export const TOKEN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
export const currencies = [
  {
    value: 'ETH',
    label: 'ETH',
    img: `${TOKEN_COIN_API}/60.png`,
    width: '2rem',
    humanReadibleFn: toEther,
    chainReadibleFn: toWei
  },
  {
    value: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    label: 'WBTC',
    img: `${TOKEN_API}/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png`,
    width: `2rem`,
  },
  {
    value: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
    label: 'cDAI',
    img: `${TOKEN_API}/0xf5dce57282a584d2746faf1593d3121fcac444dc.png`,
    width: '2rem',
    contract: cDAI,
    humanReadibleFn: compoundWhole,
    chainReadibleFn: compoundToChain,
    getAllowance: () => getLpAllowance(cDAI),
    setAllowance: (amount) => transferApproval(cDAI, amount)

  },
  {
    value: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    label: 'cETH',
    img: `${TOKEN_API}/0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5.png`,
    width: '2rem',
    contract: cETH,
    humanReadibleFn: compoundWhole,
    chainReadibleFn: compoundToChain,
    getAllowance: () => getLpAllowance(cETH),
    setAllowance: (amount) => transferApproval(cETH, amount)
  }
]

export const getTokenByAddress = (value, currencies = currencies) => currencies.find(currency => currency.value.toLowerCase() === value.toLowerCase())
export const getHumanAmountFormatter = tokenAddress => getTokenByAddress(tokenAddress).humanReadibleFn
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

