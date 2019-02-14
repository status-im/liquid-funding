import React from 'react'
import Typography from '@material-ui/core/Typography'

import './Loading.css'

function Loading() {
  return (
    <div className="Loading-container">
      <img className="Loading-logo" id="loading" src="https://our.status.im/content/images/2018/07/status_logo_blue_1--2-.png" />
      <Typography style={{ fontSize: '1.5rem' }}>Hold on while we gather the latest information</Typography>
    </div>
  )
}

export default Loading
