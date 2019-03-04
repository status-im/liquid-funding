import React, { useMemo, useState, useEffect } from 'react'

function BackProject({match}) {
  const projectId = match.params.id
  console.log({projectId})
  return (
    <div>Back Project Page</div>
  )
}

export default BackProject
