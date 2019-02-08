import React, { useState, useEffect } from 'react'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import indigo from '@material-ui/core/colors/indigo'
import blueGrey from '@material-ui/core/colors/blueGrey'
import Collapse from '@material-ui/core/Collapse'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import LPVault from 'Embark/contracts/LPVault'
import { getTokenLabel } from '../../utils/currencies'
import { toWei } from '../../utils/conversions'

const { withdraw } = LiquidPledging.methods
const { confirmPayment } = LPVault.methods

const styles = {
  card: {
    borderRadius: '0px',
    borderTopStyle: 'groove',
    borderBottom: '1px solid lightgray',
    backgroundColor: indigo[50]
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  amount: {
    backgroundColor: blueGrey[50]
  }
}

function Withdraw({ clearRowData, classes, rowData, authorizedPayment }) {
  const [show, setShow] = useState(null)
  const [rowId, setRowId] = useState(rowData.pledgeId)

  useEffect(() => {
    setShow(true)
  }, [])

  useEffect(() => {
    const { pledgeId } = rowData
    const samePledge = rowId === pledgeId
    if (show && samePledge) close()
    else setRowId(pledgeId)
  }, [rowData.timeStamp])

  const close = () => {
    setShow(false)
    setTimeout(() => { clearRowData() }, 500)
  }

  const isPaying = rowData.pledgeState === 'Paying'
  return (
    <Formik
      initialValues={{}}
      onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
        const { amount } = values
        const paymentId = isPaying ? authorizedPayment[0]['returnValues']['idPayment'] : rowData.pledgeId
        const args = isPaying ? [paymentId] : [paymentId, toWei(amount)]
        const sendFn = isPaying ? confirmPayment : withdraw
        try {
          const toSend = sendFn(...args)
          const estimateGas = await toSend.estimateGas()
          toSend.send({ gas: estimateGas + 1000 })
                                          .then(res => {
                                            console.log({res})
                                          })
                                          .catch(e => {
                                            console.log({e})
                                          })
                                          .finally(() => {
                                            close()
                                          })
        } catch (error) {
          console.log(error)
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setStatus,
        status
      }) => (
        <Collapse in={show}>
          <form autoComplete="off" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', marginBottom: '0px' }}>
            <Card className={classes.card} elevation={0}>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {`${isPaying ? 'Confirm' : ''} Withdraw${isPaying ? 'al' : ''} ${values.amount || ''}  ${values.amount ? getTokenLabel(rowData[6]) : ''} from Pledge ${rowData.pledgeId}`}
                </Typography>
                {!isPaying && <TextField
                                className={classes.amount}
                                id="amount"
                                name="amount"
                                label="Amount"
                                placeholder="Amount"
                                margin="normal"
                                variant="outlined"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.amount || ''}
                />}
              </CardContent>
              <CardActions>
                <Button size="large" onClick={close}>Cancel</Button>
                <Button size="large" color="primary" type="submit">{isPaying ? 'Confirm' : 'Withdraw'}</Button>
              </CardActions>
            </Card>
          </form>
        </Collapse>
      )}
    </Formik>
  )
}

Withdraw.propTypes = {
  classes: PropTypes.object.isRequired,
  rowData: PropTypes.object.isRequired,
  clearRowData: PropTypes.func.isRequired,
  authorizedPayment: PropTypes.array.isRequired
}

const styledWithdraw = withStyles(styles)(Withdraw)
export default withDatabase(withObservables(['rowData'], ({ database, rowData }) => ({
  authorizedPayment : database.collections.get('vault_events').query(
    Q.where('ref', rowData.pledgeId)
  ).observe()
}))(styledWithdraw))
