/*global web3*/
import LiquidPledging from 'Embark/contracts/LiquidPledging'

const { getPledgeDelegate, numberOfPledges, getPledge } = LiquidPledging.methods
const getPledgeDelegates = (idPledge, numDelegates) => {
  const delegates = []
  const num = Number(numDelegates)
  if (!num) return delegates
  for (let i = 1; i <= num; i++) {
    delegates.push(getPledgeDelegate(idPledge, i).call())
  }
  return Promise.all(delegates)
}

export const formatPledge = async (pledgePromise, idx) => {
  const pledge = await pledgePromise
  const blockNumber = await web3.eth.getBlockNumber()
  const delegates = await getPledgeDelegates(idx+1, pledge.nDelegates)
  return {
    ...pledge,
    blockNumber,
    delegates,
    id: idx + 1
  }
}

export const getAllPledges = async (start = 1) => {
  const numPledges = await LiquidPledging.methods.numberOfPledges().call()
  const pledges = []
  for (let i = start; i <= numPledges; i++) {
    pledges.push(getPledge(i).call())
  }
   return Promise.all(pledges.map(formatPledge))
}

export const getPledges = async (pledges = []) => {
  const updated = []
  pledges.forEach(p => {
    updated[p.idPledge - 1] = getPledge(p.idPledge).call()
  })
  return Promise.all(updated.map(formatPledge))
}

export const appendToExistingPledges = async (pledges, setState) => {
  const numPledges = await numberOfPledges().call()
  const difference = numPledges - pledges.length
  if (difference > 0) {
    const newPledges = await getAllPledges(difference)
    setState((state) => ({
      ...state,
      allPledges: {
        ...state.allPledges,
        ...newPledges
      }
    }))
  }
}

export const transferBetweenPledges = (setState, tx) => {
  const { from, to, amount } = tx
  setState((state) => {
    const { allPledges } = state;
    const updatedPledges = allPledges.map(pledge => {
      if (pledge.id === Number(from)) {
        pledge.amount = (BigInt(pledge.amount) - BigInt(amount)).toString()
        return pledge
      }
      if (pledge.id === Number(to)) {
        pledge.amount = (BigInt(pledge.amount) + BigInt(amount)).toString()
        return pledge
      }
      return pledge
    })
    console.log({updatedPledges, tx})
    return {
      ...state,
      allPledges: [ ...updatedPledges ]
    }
  })
}
