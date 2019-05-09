import React, { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { currencies, TOKEN_ICON_API } from '../../utils/currencies'
import { toEther } from '../../utils/conversions'
import { getLpAllowance, standardTokenApproval } from '../../utils/initialize'
import { FundingContext } from '../../context'

CurrencySelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  value: PropTypes.string,
  showBalances: PropTypes.bool,
  enableToggles: PropTypes.bool
}

function CurrencySelect({
  id,
  label,
  handleChange,
  handleBlur,
  value,
  showBalances,
  enableToggles
}) {
  const context = useContext(FundingContext)
  const { account } = context
  const [balances, setBalances] = useState({})
  const [allowances, setAllowances] = useState({})

  const updateBalancesAllowances = () => {
    const latestBalances = {}
    const latestAllowances = {}
    currencies.forEach(async c => {
      if (c.contract) {
        const amount = await c.contract.methods.balanceOf(account).call()
        const allowance = await getLpAllowance(c.contract)
        latestBalances[c.value] = toEther(amount)
        latestAllowances[c.value] = toEther(allowance)
      } else {
        latestBalances[c.value] = '0'
        latestAllowances[c.value] = '0'
      }
    })
    setBalances(latestBalances)
    setAllowances(latestAllowances)
  }

  const toggleAllowance = e => {
    const token = currencies[e.target.value]
    const allowance = allowances[token.value]
    standardTokenApproval(
      token.contract,
      Number(allowance) ? '0' : undefined
    ).then(res => {
      const { events: { Approval: { returnValues: { value } } } } = res
      setAllowances(state => ({ ...state, [token.value]: toEther(value) }))
    })
  }

  useEffect(() => {
    if (account && showBalances) updateBalancesAllowances()
  }, [account])


  return (
    <TextField
      id={id}
      name={id}
      select
      label={label}
      placeholder={label}
      margin="normal"
      variant="outlined"
      onChange={handleChange}
      onBlur={handleBlur}
      value={value || ''}
    >
      {currencies.map((option, idx) => (
        <MenuItem style={{display: 'flex', alignItems: 'center'}} key={option.value} value={option.value}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            {option.icon || <img
              src={option.img || `${TOKEN_ICON_API}/${option.value}.png`}
              style={{width: option.width, marginRight: '3%'}}
            />}
            {option.label}
            {showBalances && <span style={{ marginLeft: '10%' }}>Your Balance: <strong>{balances[option.value]}</strong></span>}
            {enableToggles && <FormControlLabel
              style={{ marginLeft: '10%' }}
              onClick={e => e.stopPropagation()}
              control={
                <Switch
                  checked={!!Number(allowances[option.value])}
                  onChange={toggleAllowance}
                  value={idx}
                  color="primary"
                />
              }
              label="Enabled"
            />}
          </div>
        </MenuItem>
      ))}
    </TextField>
  )
}

export default CurrencySelect
