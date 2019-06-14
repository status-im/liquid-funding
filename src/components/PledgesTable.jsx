import React, { Component } from 'react'
import MaterialTable from 'material-table'
import withObservables from '@nozbe/with-observables'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { getTokenLabel, getFormattedPledgeAmount } from '../utils/currencies'
import TransferCard from './table/TransferCard'
import WithdrawCard from './table/WithdrawCard'

const _convertToHours = seconds => seconds / 60 / 60
const projectText = project => {
  return project === '0' ? 'N/A' : project
}
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
  amount: getFormattedPledgeAmount(field),
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
          if (getFormattedPledgeAmount(pledge) !== current.amount || pledgeStateMap[pledge.pledgeState] !== current.pledgeState) this.setData()
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
    this.setState({ rowData: null })
  }

  render() {
    const { data, rowData } = this.state
    return (
      <div>
        <MaterialTable
          columns={[
            { title: 'Pledge Id', field: 'idPledge', type: 'numeric' },
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
                const { timeStamp } = event
                this.setState({
                  rowData: { ...rowData, timeStamp, type: 'transfer' }
                })
              }
            },
            {
              icon: 'attach_money',
              tooltip: 'Request Withdrawl',
              onClick: (event, rowData) => {
                const { timeStamp } = event
                console.log({rowData})
                this.setState({
                  rowData: { ...rowData, timeStamp, type: 'withdraw' }
                })
              }
            }
          ]}
        />
        {!rowData && <div/>}
        {rowData && rowData.type === 'withdraw' && <WithdrawCard rowData={rowData} handleClose={this.handleClose} />}
        {rowData && rowData.type === 'transfer' && <TransferCard row={rowData} handleClose={this.handleClose} />}
      </div>
    )
  }
}

export default withDatabase(withObservables([], ({ database }) => ({
  pledges: database.collections.get('pledges').query().observeWithColumns(['amount', 'pledge_state']),
}))(PledgesTable))
