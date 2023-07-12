import React from 'react'
import "./ConfirmationBox.css"

function ConfirmationBox({cancel, confirm, message}) {
  return (
    <>
      <div className='confirmationBoxOuter' onClick={cancel}>
      </div>
      <div className='confirmationBox'>
          <div className='confirmationBoxMessage'>
              {message}
          </div>
          <div className='buttons'>
            <button onClick={cancel}>Cancel</button>
            <button onClick={confirm}>Confirm</button>
          </div>
      </div>
    </>
  )
}

export default ConfirmationBox