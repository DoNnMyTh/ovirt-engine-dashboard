import React from 'react'
import { string, node } from 'prop-types'
import $ from 'jquery'
import { msg } from '../../intl-messages'
import WebAdminBodyPortal from '../helper/WebAdminBodyPortal'

class ModalDialog extends React.Component {
  render () {
    return (
      <WebAdminBodyPortal>
        <div className={`modal fade ${this.props.modalContainerClass}`} role='dialog' ref={(e) => { this._modalContainer = e }}>
          <div className='modal-dialog'>
            <div className='modal-content'>

              <div className='modal-header'>
                <button type='button' className='close' data-dismiss='modal'>&times;</button>
                <h4 className='modal-title'>{this.props.title}</h4>
              </div>

              <div className='modal-body'>{this.props.children}</div>

              <div className='modal-footer'>
                <button type='button' className='btn btn-primary' data-dismiss='modal'>{msg.closeButton()}</button>
              </div>

            </div>
          </div>
        </div>
      </WebAdminBodyPortal>
    )
  }

  show () {
    $(this._modalContainer).modal()
  }
}

ModalDialog.propTypes = {
  children: node,
  title: string.isRequired,
  modalContainerClass: string
}

ModalDialog.defaultProps = {
  modalContainerClass: ''
}

export default ModalDialog
