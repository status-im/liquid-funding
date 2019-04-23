import { useState, useEffect } from 'react'

export function useRowData(rowData, handleClose) {
  const [show, setShow] = useState(null)
  const [rowId, setRowId] = useState(rowData.idPledge)

  useEffect(() => {
    setShow(true)
  }, [])

  useEffect(() => {
    const { idPledge } = rowData
    const samePledge = rowId === idPledge
    if (show && samePledge) close()
    else setRowId(idPledge)
  }, [rowData.timeStamp])

  const close = () => {
    setShow(false)
    setTimeout(() => { handleClose() }, 500)
  }

  return { show, close }
}
