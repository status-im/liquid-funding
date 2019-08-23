import { memoizeWith, identity } from 'ramda'
import SNT from '../embarkArtifacts/contracts/SNT'
import DAI from '../embarkArtifacts/contracts/DAI'
import cDAI from '../embarkArtifacts/contracts/cDAI'
import cETH from '../embarkArtifacts/contracts/cETH'
import sntIco from 'cryptocurrency-icons/svg/color/snt.svg'
import { toEther, toWei, compoundWhole, compoundToChain } from './conversions'

export const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/images'
export const TOKEN_COIN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/coins'
export const TOKEN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
export const currencies = [
  {
    value: SNT._address,
    label: 'SNT',
    img: sntIco,
    contract: SNT,
    humanReadibleFn: toEther,
    chainReadibleFn: toWei
  },
  {
    value: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
    label: 'cDAI',
    img: `${TOKEN_API}/0xf5dce57282a584d2746faf1593d3121fcac444dc.png`,
    width: '2rem',
    contract: cDAI,
    humanReadibleFn: compoundWhole,
    chainReadibleFn: compoundToChain
  },
  {
    value: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    label: 'cETH',
    img: `${TOKEN_API}/0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5.png`,
    width: '2rem',
    contract: cETH,
    humanReadibleFn: compoundWhole,
    chainReadibleFn: compoundToChain
  },
  {
    value: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    label: 'WETH',
    img: `${TOKEN_COIN_API}/60.png`,
    width: '2rem',
    humanReadibleFn: toEther,
    chainReadibleFn: toWei
  },
  {
    value: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    label: 'DAI',
    img: `${TOKEN_API}/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png`,
    width: '2rem',
    contract: DAI,
    humanReadibleFn: toEther,
    chainReadibleFn: toWei
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
