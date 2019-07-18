import React from 'react'
import OneOnOneChat from './OneOnOneChat'

const ONE_ON_ONE_CHAT = 'oneOnOneChat'
const icons = {
  [ONE_ON_ONE_CHAT]: OneOnOneChat
}

const Icon = ({ name }) => {
  const Component = icons[name]
  return (
    <div style={{
      background: '#ECEFFC',
      borderRadius: '50%',
      padding: '10px',
      maxHeight: '45px'
    }}>
      <Component />
    </div>
  )
}


export default Icon
