import React from 'react'
import { Formik } from 'formik'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { getTokenLabel } from '../utils/currencies'
import { toWei } from '../utils/conversions'

const { transfer } = LiquidPledging.methods

const TransferDialog = ({ row, handleClose }) => (
  <Formik
    initialValues={{}}
    onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
      const { idPledge, pledge } = row
      const { idSender, amount, idReceiver } = values
      const args = [idSender, idPledge, toWei(amount.toString()), idReceiver]
      const toSend = transfer(...args)
      const estimatedGas = await toSend.estimateGas()

      toSend
        .send({gas: estimatedGas + 1000})
        .then(async res => {
          console.log({res})
          const { events: { Transfer } } = res
          if (Array.isArray(Transfer)) {
            Transfer.forEach(async t => {
              const { to, amount } = t.returnValues
              await pledge.transferTo(to, amount)
            })
          } else {
            const { to, amount } = Transfer.returnValues
            await pledge.transferTo(to, amount)
          }
        })
        .catch(e => {
          console.log({e})
        })
        .finally(() => {
          handleClose()
          resetForm()
        })
    }}
  >
    {({
       values,
       errors,
       touched,
       handleChange,
       handleBlur,
       handleSubmit,
       submitForm,
       setFieldValue,
       setStatus,
       status
    }) => (
      <form onSubmit={handleSubmit} autoComplete="off">
        <Dialog
          open={!!row}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Transfer Funds</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {`Transfer ${values.amount || ''}  ${values.amount && row ? getTokenLabel(row.pledge.token) : ''} from Pledge ${row.idPledge} ${values.idReceiver ? 'to Giver/Delegate/Project' : ''} ${values.idReceiver || ''}`}
            </DialogContentText>
            <TextField
              autoFocus
              margin="normal"
              id="amount"
              name="amount"
              label="Amount to transfer"
              placeholder="Amount to transfer"
              variant="outlined"
              autoComplete="off"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.amount || ''}
            />
            <TextField
              margin="normal"
              id="idSender"
              name="idSender"
              label="Profile Id to send from"
              placeholder="Profile Id to send from"
              variant="outlined"
              type="number"
              autoComplete="off"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.idSender || ''}
            />
            <TextField
              margin="normal"
              id="idReceiver"
              name="idReceiver"
              label="Receiver of funds"
              placeholder="Receiver of funds"
              variant="outlined"
              helperText="Destination of the amount, can be a Giver/Project sending to a Giver, a Delegate or a Project; a Delegate sending to another Delegate, or a Delegate pre-commiting it to a Project"
              autoComplete="off"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.idReceiver || ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={submitForm} color="primary" type="submit">
              Transfer
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    )}
  </Formik>
)

export default TransferDialog
