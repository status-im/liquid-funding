import React from 'react'
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
import Collapse from '@material-ui/core/Collapse'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import LPVault from 'Embark/contracts/LPVault'
import { getTokenLabel } from '../../utils/currencies'
import { toWei } from '../../utils/conversions'
import styles from './CardStyles'
import { useRowData } from './hooks'

const { withdraw } = LiquidPledging.methods
const { confirmPayment } = LPVault.methods

function Withdraw({ handleClose, classes, rowData, authorizedPayment }) {
  const { show, close } = useRowData(rowData, handleClose)
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
          toSend
            .send({ gas: estimateGas + 1000 })
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
  handleClose: PropTypes.func.isRequired,
  authorizedPayment: PropTypes.array.isRequired
}

const styledWithdraw = withStyles(styles)(Withdraw)
export default withDatabase(withObservables(['rowData'], ({ database, rowData }) => ({
  authorizedPayment : database.collections.get('vault_events').query(
    Q.where('ref', rowData.pledgeId)
  ).observe()
}))(styledWithdraw))
