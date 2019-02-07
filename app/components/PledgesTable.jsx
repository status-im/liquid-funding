import React, { Fragment, Component } from 'react'
import MaterialTable from 'material-table'
import withObservables from '@nozbe/with-observables'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { toEther } from '../utils/conversions'
import { getTokenLabel } from '../utils/currencies'
import TransferDialog from './TransferDialog'
import WithdrawCard from './table/WithdrawCard'

const convertToHours = seconds => seconds / 60 / 60
const projectText = project => project === '0' ? 'N/A' : project
const pledgeStateMap = {
  0: 'Pledged',
  1: 'Paying',
  2: 'Paid'
}
const convertToDatetime = async field => {
  const { commitTime } = field
  const profile = await field.profile.fetch()
  if (!profile || Number(commitTime) === 0) return 0
  const time = Number(commitTime) + Number(profile.commitTime)
  const date = new Date(time * 1000)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}
const formatField = async field => ({
  ...field.getFields(),
  commitTime: await convertToDatetime(field),
  amount: toEther(field.amount),
  token: getTokenLabel(field.token),
  intendedProject: projectText(field.intendedProject),
  pledgeState: pledgeStateMap[field.pledgeState],
  transferTo: field.transferTo,
  pledge: field
})
class PledgesTable extends Component {
  state = {
    data: [],
    row: false,
  }

  componentDidMount() {
    this.setData()
  }

  componentDidUpdate() {
    const { pledges } = this.props
    const { data } = this.state
    if (data.length) {
      pledges.some((pledge, idx) => {
        const current = data[idx]
        if (current) {
          if (toEther(pledge.amount) != current.amount || pledgeStateMap[pledge.pledgeState] != current.pledgeState) this.setData()
        }
      })
    }
    if (pledges.length && !data.length) this.setData()
  }

  setData = async () => {
    const { pledges } = this.props
    const data = await Promise.all(pledges.map(formatField))
    this.setState({ data })
  }

  handleClickOpen = row => {
    this.setState({ row })
  }

  handleClose = () => {
    this.setState({ row: false })
  }

  clearRowData = () => this.setState({ rowData: null })

  render() {
    const { data, row, rowData } = this.state
    return (
      <Fragment>
        <TransferDialog
          row={row}
          handleClose={this.handleClose}
        />
        <MaterialTable
          columns={[
            { title: 'Pledge Id', field: 'pledgeId', type: 'numeric' },
            { title: 'Owner', field: 'owner' },
            { title: 'Amount Funded', field: 'amount', type: 'numeric' },
            { title: 'Token', field: 'token' },
            { title: 'Commit Time', field: 'commitTime', type: 'numeric' },
            { title: 'Number of Delegates', field: 'nDelegates', type: 'numeric' },
            { title: 'Intended Project', field: 'intendedProject' },
            { title: 'Pledge State', field: 'pledgeState' },
          ]}
          data={data}
          title="Pledges"
          options={{ showEmptyDataSourceMessage: true }}
          actions={[
            {
              icon: 'compare_arrows',
              tooltip: 'Transfer funds',
              onClick: (event, rowData) => {
                this.handleClickOpen(rowData)
              }
            },
            {
              icon: 'attach_money',
              tooltip: 'Request Withdrawl',
              onClick: (event, rowData) => {
                console.log({rowData})
                this.setState({ rowData })
              }
            }
          ]}
        />
        {rowData ? <WithdrawCard rowData={rowData} clearRowData={this.clearRowData} /> : <div/>}
      </Fragment>
    )
  }
}

export default withDatabase(withObservables([], ({ database }) => ({
  pledges: database.collections.get('pledges').query().observeWithColumns(['amount', 'pledge_state']),
}))(PledgesTable))
