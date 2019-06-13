import SNT from '../embarkArtifacts/contracts/SNT'
import DAI from '../embarkArtifacts/contracts/DAI'
import cDAI from '../embarkArtifacts/contracts/cDAI'
import cETH from '../embarkArtifacts/contracts/cETH'
import sntIco from 'cryptocurrency-icons/svg/color/snt.svg'
import { toEther, compoundWhole } from './conversions'

export const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/images'
export const TOKEN_COIN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/coins'
export const TOKEN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
export const currencies = [
  {
    value: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    label: 'cETH',
    img: `${TOKEN_API}/0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5.png`,
    width: '5%',
    contract: cETH,
    humanReadibleFn: compoundWhole,
  },
  {
    value: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    label: 'Wrapped Ether',
    img: `${TOKEN_COIN_API}/60.png`,
    width: '5%',
    humanReadibleFn: toEther,
  },
  {
    value: SNT._address,
    label: 'SNT',
    img: sntIco,
    contract: SNT,
    humanReadibleFn: toEther,
  },
  {
    value: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    label: 'DAI',
    img: `${TOKEN_API}/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png`,
    width: '5%',
    contract: DAI,
    humanReadibleFn: toEther,
  },
  {
    value: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
    label: 'cDAI',
    img: `${TOKEN_API}/0xf5dce57282a584d2746faf1593d3121fcac444dc.png`,
    width: '5%',
    contract: cDAI,
    humanReadibleFn: compoundWhole,
  }
]

export const getTokenLabel = value => {
  const token = currencies.find(currency => currency.value === value)
  return token ? token.label : null
}

export const getTokenAddress = label => {
  const token = currencies.find(currency => currency.label === label)
  return token ? token.value : null
}
