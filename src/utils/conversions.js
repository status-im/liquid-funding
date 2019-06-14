/*global web3*/

export const toEther = (amount, scale = 'ether') => web3.utils.fromWei(amount, scale)
export const toWei = (amount, scale = 'ether') => web3.utils.toWei(amount, scale)
export const compoundWhole = amount => (Number(amount) / (10**8)).toString()
export const compoundToChain = amount => (Number(amount) * (10**8)).toString()
