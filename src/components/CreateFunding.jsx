/*global web3*/
import React, { useContext } from 'react';
import { Formik } from 'formik';
import LiquidPledging from '../embarkArtifacts/contracts/LiquidPledging';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import { MySnackbarContentWrapper } from './base/SnackBars'
import { getTokenLabel } from '../utils/currencies'
import { FundingContext } from '../context'
import CurrencySelect from './base/CurrencySelect'

const { donate } = LiquidPledging.methods
const _hoursToSeconds = hours => hours * 60 * 60
const _addFunderSucessMsg = response => {
  const { events: { GiverAdded: { returnValues: { idGiver } } } } = response
  return `Funder created with ID of ${idGiver}`
}

const CreateFunding = ({ refreshTable }) => {
  const context = useContext(FundingContext)
  const { account } = context

  return (
    <Formik
      initialValues={{ funderId: '', receiverId: '', tokenAddress : '', amount: '' }}
      onSubmit={async (values, { setSubmitting: _setSubmitting, resetForm: _resetForm, setStatus }) => {
        const { funderId, receiverId, tokenAddress, amount } = values
        const args = [funderId, receiverId, tokenAddress, web3.utils.toWei(amount, 'ether')];

        const toSend =  donate(...args);

        const estimateGas = await toSend.estimateGas()

        toSend.send({from: account, gas: estimateGas + 2000})
          .then(res => {
            console.log({res})
            setStatus({
              snackbar: {variant: 'success', message: 'funding provided!'}
            })
            refreshTable()
          })
          .catch(e => {
            console.log({e})
            setStatus({
              snackbar: {variant: 'error', message: 'There was an error'}
            })
          })
      }}
    >
      {({
        values,
        errors: _errors,
        touched: _touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue: _setFieldValue,
        setStatus,
        status
      }) => (
        <form autoComplete="off" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <TextField
            id="funderId"
            name="funderId"
            label="Funder Id"
            placeholder="Funder Id"
            margin="normal"
            variant="outlined"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.funderId || ''}
          />
          <TextField
            id="receiverId"
            name="receiverId"
            label="Receiver Id"
            placeholder="Receiver Id"
            margin="normal"
            variant="outlined"
            helperText="The receiver of the funding can be any admin, giver, delegate or a project"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.receiverId || ''}
          />
          <CurrencySelect
            id="tokenAddress"
            name="tokenAddress"
            label="Select token for funding"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.tokenAddress}
            showBalances
            enableToggles
          />
          <TextField
            id="amount"
            name="amount"
            label={`Amount of ${getTokenLabel(values.tokenAddress) || 'tokens'} to provide`}
            placeholder="Amount of tokens to provide"
            margin="normal"
            variant="outlined"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.amount || ''}
          />
          <Button variant="contained" color="primary" type="submit">
            PROVIDE FUNDING
          </Button>
          {status && <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={!!status.snackbar}
            autoHideDuration={6000}
            onClose={() => setStatus(null)}
          >
            <MySnackbarContentWrapper
              onClose={() => setStatus(null)}
              variant={status.snackbar.variant}
              message={status.snackbar.message}
            />
          </Snackbar>}
        </form>
      )}
    </Formik>
  )
}

export default CreateFunding
