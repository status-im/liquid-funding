import React from 'react'
import OneOnOneChat from './OneOnOneChat'
import BoxArrow from './BoxArrow'

const ONE_ON_ONE_CHAT = 'oneOnOneChat'
const BOX_ARROW = 'boxArrow'
const icons = {
  [ONE_ON_ONE_CHAT]: OneOnOneChat,
  [BOX_ARROW]: BoxArrow
}

const Icon = ({ name }) => {
  const Component = icons[name]
  return (
    <div style={{
      background: '#ECEFFC',
      borderRadius: '50%',
      padding: '10px',
      maxHeight: '45px',
      justifySelf: 'center'
    }}>
      <Component />
    </div>
  )
}


export default Icon
