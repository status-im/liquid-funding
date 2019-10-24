/*global web3*/
import { memoizeWith, identity } from 'ramda'
import SNT from '../embarkArtifacts/contracts/SNT'
import DAI from '../embarkArtifacts/contracts/DAI'
import cDAI from '../embarkArtifacts/contracts/cDAI'
import cETH from '../embarkArtifacts/contracts/cETH'
import SwapProxy from '../embarkArtifacts/contracts/SwapProxy'
import { toEther, toWei, compoundWhole, compoundToChain } from './conversions'

export const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/images'
export const TOKEN_COIN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/coins'
export const TOKEN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
export const currencies = [
  {
    value: SNT._address,
    label: 'SNT',
    img: `${TOKEN_API}/0x744d70fdbe2ba4cf95131626614a1763df805b9e.png`,
    width: '2rem',
    contract: SNT,
    humanReadibleFn: toEther,
    chainReadibleFn: toWei,
    getAllowance: () => getLpAllowance(SNT),
    setAllowance: (amount) => transferApproval(SNT, amount)

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
  },
  {
    value: 'ETH',
    label: 'ETH',
    img: `${TOKEN_COIN_API}/60.png`,
    width: '2rem',
    humanReadibleFn: toEther,
    chainReadibleFn: toWei
  },
  {
    value: DAI._address,
    label: 'DAI',
    img: `${TOKEN_API}/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png`,
    width: '2rem',
    contract: DAI,
    humanReadibleFn: toEther,
    chainReadibleFn: toWei,
    getAllowance: () => getLpAllowance(DAI),
    setAllowance: (amount, spender = SwapProxy) => transferApproval(DAI, amount, spender)

  }
]

export const getTokenByAddress = memoizeWith(identity, value => currencies.find(currency => currency.value.toLowerCase() === value.toLowerCase()))
export const getHumanAmountFormatter = tokenAddress => getTokenByAddress(tokenAddress).humanReadibleFn
export const getTokenLabel = value => {
  const token = getTokenByAddress(value)
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

export const getAllowanceFromAddress = tokenAddress => {
  const token = getTokenByAddress(tokenAddress)
  return token.getAllowance()
}

export const setAllowanceFromAddress = async (tokenAddres, amount) => {
  const token = getTokenByAddress(tokenAddres)
  return token.setAllowance(amount)
}

export const getLpAllowance = async contract => {
  const { methods: { allowance } } = contract || SNT
  const account = await web3.eth.getCoinbase()
  const spender = SwapProxy._address
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
