/*global web3*/

export const toEther = amount => web3.utils.fromWei(amount, 'ether')
export const toWei = (amount, scale = 'ether') => web3.utils.toWei(amount, scale)
