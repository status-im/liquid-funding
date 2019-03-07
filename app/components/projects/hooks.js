import EmbarkJS from 'Embark/EmbarkJS'
import web3 from 'Embark/web3'
import LiquidPledging from 'Embark/contracts/LiquidPledging'
import { useState, useEffect, useMemo } from 'react'
import { timeSinceBlock } from '../../utils/dates'
import { getFiles } from '../../utils/ipfs'

async function getProjectAge(id, events, setState){
  const event = events.find(e => e.returnValues.idProject === id)
  const { timestamp } = await web3.eth.getBlock(event.blockNumber)
  setState(timeSinceBlock(timestamp, 'days'))
}

async function getProjectAssets(projectId, setState){
  EmbarkJS.onReady(async (err) => {
    const projectInfo = await LiquidPledging.methods.getPledgeAdmin(projectId).call()
    const CID = projectInfo.url.split('/').slice(-1)[0]
    getFiles(CID)
      .then((files) => {
        setState(files)
        const manifest = files[2]
        console.log({files}, JSON.parse(manifest.content))
      })
      .catch(console.log)
  })
}

const getProjectManifest = assets => assets ? JSON.parse(assets.find(a => a.name.toLowerCase() === 'manifest.json').content) : null

export function useProjectData(projectId, profile, projectAddedEvents) {
  const [projectAge, setAge] = useState(null)
  const [projectAssets, setAssets] = useState(null)

  useEffect(() => {
    getProjectAge(projectId, projectAddedEvents, setAge)
  }, [projectAddedEvents])

  useEffect(() => {
    getProjectAssets(projectId, setAssets)
  }, [projectId])

  const manifest = useMemo(() => getProjectManifest(projectAssets), [projectAssets])

  return { projectAge, projectAssets, manifest }
}
