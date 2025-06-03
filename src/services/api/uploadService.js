import uploadData from '../mockData/upload.json'

let uploads = [...uploadData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getAll = async () => {
  await delay(200)
  return [...uploads]
}

export const getById = async (id) => {
  await delay(150)
  const upload = uploads.find(u => u.id === id)
  if (!upload) throw new Error('Upload not found')
  return { ...upload }
}

export const create = async (uploadItem) => {
  await delay(300)
  const newUpload = {
    ...uploadItem,
    id: Date.now().toString(),
    startTime: new Date().toISOString(),
    status: 'pending',
    progress: 0
  }
  uploads.push(newUpload)
  return { ...newUpload }
}

export const update = async (id, data) => {
  await delay(200)
  const index = uploads.findIndex(u => u.id === id)
  if (index === -1) throw new Error('Upload not found')
  
  uploads[index] = { ...uploads[index], ...data }
  return { ...uploads[index] }
}

export const deleteUpload = async (id) => {
  await delay(200)
  const index = uploads.findIndex(u => u.id === id)
  if (index === -1) throw new Error('Upload not found')
  
  const deletedUpload = uploads.splice(index, 1)[0]
  return { ...deletedUpload }
}