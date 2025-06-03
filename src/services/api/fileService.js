import fileData from '../mockData/file.json'

let files = [...fileData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getAll = async () => {
  await delay(300)
  return [...files]
}

export const getById = async (id) => {
  await delay(200)
  const file = files.find(f => f.id === id)
  if (!file) throw new Error('File not found')
  return { ...file }
}

export const create = async (fileItem) => {
  await delay(400)
  const newFile = {
    ...fileItem,
    id: Date.now().toString(),
    uploadDate: new Date().toISOString()
  }
  files.push(newFile)
  return { ...newFile }
}

export const update = async (id, data) => {
  await delay(300)
  const index = files.findIndex(f => f.id === id)
  if (index === -1) throw new Error('File not found')
  
  files[index] = { ...files[index], ...data }
  return { ...files[index] }
}

export const deleteFile = async (id) => {
  await delay(250)
  const index = files.findIndex(f => f.id === id)
  if (index === -1) throw new Error('File not found')
  
  const deletedFile = files.splice(index, 1)[0]
  return { ...deletedFile }
}