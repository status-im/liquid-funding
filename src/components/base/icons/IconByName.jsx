import React from 'react'
import OneOnOneChat from './OneOnOneChat'
import BoxArrow from './BoxArrow'
import CheckMark from './CheckMark'
import Photo from './Photo'
import AddPerson from './AddPerson'
import Lightening from './Lightening'
import Wallet from './Wallet'

const ADD_PERSON = 'addPerson'
const CHECK = 'check'
const ONE_ON_ONE_CHAT = 'oneOnOneChat'
const BOX_ARROW = 'boxArrow'
const PHOTO = 'photo'
const LIGHTENING = 'lightening'
const WALLET = 'wallet'
const icons = {
  [ADD_PERSON]: AddPerson,
  [CHECK]: CheckMark,
  [ONE_ON_ONE_CHAT]: OneOnOneChat,
  [BOX_ARROW]: BoxArrow,
  [PHOTO]: Photo,
  [LIGHTENING]: Lightening,
  [WALLET]: Wallet
}

const Icon = ({ name, centered, text }) => {
  const Component = icons[name]
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#1AA56E1A',
      borderRadius: '50%',
      height: '3rem',
      width: '3rem',
      justifySelf: centered ? 'center' : 'auto'
    }} >
      {text || <Component />}
    </div>
  )
}


export default Icon
