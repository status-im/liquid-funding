import { useState, useEffect } from 'react'

export function useRowData(rowData, handleClose) {
  const [show, setShow] = useState(null)
  const [rowId, setRowId] = useState(rowData.pledgeId)

  useEffect(() => {
    setShow(true)
  }, [])

  useEffect(() => {
    const { pledgeId } = rowData
    const samePledge = rowId === pledgeId
    if (show && samePledge) close()
    else setRowId(pledgeId)
  }, [rowData.timeStamp])

  const close = () => {
    setShow(false)
    setTimeout(() => { handleClose() }, 500)
  }

  return { show, close }
}
