import React from 'react'
import OneOnOneChat from './OneOnOneChat'
import BoxArrow from './BoxArrow'
import Photo from './Photo'
import AddPerson from './AddPerson'

const ADD_PERSON = 'addPerson'
const ONE_ON_ONE_CHAT = 'oneOnOneChat'
const BOX_ARROW = 'boxArrow'
const PHOTO = 'photo'
const icons = {
  [ADD_PERSON]: AddPerson,
  [ONE_ON_ONE_CHAT]: OneOnOneChat,
  [BOX_ARROW]: BoxArrow,
  [PHOTO]: Photo
}

const Icon = ({ name, centered }) => {
  const Component = icons[name]
  return (
    <div style={{
      background: '#ECEFFC',
      borderRadius: '50%',
      padding: '10px',
      maxHeight: '45px',
      justifySelf: centered ? 'center' : 'auto'
    }} >
      <Component />
    </div>
  )
}


export default Icon
