import cc from 'cryptocompare'
import { getTokenLabel } from './currencies'

export const generatePairKey = (from, to) => `${from}_${to}`
export const getUsdPrice = async ticker => {
  const price = await cc.price(ticker, 'USD')
  return price
}

export const formatPercent = number => Number(number).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2})

export const percentToGoal = (pledged, goal) => formatPercent(Number(pledged) / Number(goal))

export const getPrices = async () => {
  const prices = await cc.priceMulti(['ETH', 'SNT'], ['USD'])
  return prices
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

export const convertTokenAmountUsd = (token, amount, prices) => {
  const tokenLabel = getTokenLabel(token)
  if (!amount || !token || !prices[tokenLabel]) return null
  const rate = prices[tokenLabel]['USD']
  const formatted = formatter.format(rate * amount)
  return formatted
}
