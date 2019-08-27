import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import { isIpfs, getFromIpfs } from '../../utils/ipfs'

class ProfileUrlViewer extends PureComponent {
  state = { url: null }
  componentDidMount() {
    this.getSource()
  }

  async getSource() {
    const { url } = this.props
    if (isIpfs(url)) {
      const res = await getFromIpfs(url)
      this.setState({ url: res.img })
    } else {
      this.setState({ url })
    }
  }

  render() {
    const { url } = this.state
    const height = `${window.visualViewport.height * 0.75}px`
    return (
      <div>
        {url &&
         <iframe
           width="100%"
           height={height}
           src={url}
           allowFullScreen
         />
        }
      </div>

    )
  }
}

ProfileUrlViewer.PropTypes = {
  url: PropTypes.string
}

export default ProfileUrlViewer
