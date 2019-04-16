import SNT from 'Embark/contracts/SNT'
import sntIco from 'cryptocurrency-icons/svg/color/snt.svg'

export const TOKEN_ICON_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/images'
export const TOKEN_COIN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/coins'
export const TOKEN_API = 'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens'
export const currencies = [
  {
    value: 'WETH',
    label: 'Wrapped Ether',
    img: `${TOKEN_COIN_API}/60.png`,
    width: '5%'
  },
  {
    value: SNT._address,
    label: 'SNT',
    img: sntIco,
    contract: SNT
  },
  {
    value: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
    label: 'DAI',
    img: `${TOKEN_API}/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359.png`,
    width: '5%'
  }
]

export const getTokenLabel = value => {
  const token = currencies.find(currency => currency.value === value)
  return token ? token.label : null
}

export const getTokenAddress = label => {
  const token = currencies.find(currency => currency.label == label)
  return token ? token.value : null
}
