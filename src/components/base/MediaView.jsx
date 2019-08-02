import React from 'react'
import ReactPlayer from 'react-player'
import { withStyles } from '@material-ui/core/styles'
import CardMedia from '@material-ui/core/CardMedia'

const styles = () => ({})

function MediaView({ className, isVideo, source, playing, imgClass }) {
  return (
    <div className={className} >
      {isVideo &&
       <ReactPlayer width="100%" height="100%" url={source} playing={playing} controls/>}
      {!isVideo && <CardMedia
        component="img"
        alt="video"
        className={imgClass}
        src={source}
        title="media-description"
      />}
    </div>
  )
}

export default withStyles(styles)(MediaView)
