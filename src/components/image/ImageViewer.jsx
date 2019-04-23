import React from 'react'

const docType = doc => {
  const suffix = doc.name.split('.')
  return suffix.slice(-1)[0]
}

const ImageViewer = ({status}) => {
  return (
    <div>
      {status && status.profileImg &&
      <div>
        {['jpg', 'gif', 'png'].includes(docType(status.profileImg)) &&
        <img src={status.profileImg.img} alt="ipfs" style={{maxWidth: '90%'}}/>}
        {docType(status.profileImg) === 'pdf' &&
        <iframe src={status.profileImg.img} style={{width: '100%', height: '90%'}}/>}
      </div>
      }
    </div>
  )
}

export default ImageViewer;
