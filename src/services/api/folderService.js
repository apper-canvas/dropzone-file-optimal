import folderData from '../mockData/folder.json'

let folders = [...folderData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getAll = async () => {
  await delay(250)
  return [...folders]
}

export const getById = async (id) => {
  await delay(200)
  const folder = folders.find(f => f.id === id)
  if (!folder) throw new Error('Folder not found')
  return { ...folder }
}

export const create = async (folderItem) => {
  await delay(300)
  const newFolder = {
    ...folderItem,
    id: Date.now().toString(),
    createdDate: new Date().toISOString(),
    fileCount: 0
  }
  folders.push(newFolder)
  return { ...newFolder }
}

export const update = async (id, data) => {
  await delay(300)
  const index = folders.findIndex(f => f.id === id)
  if (index === -1) throw new Error('Folder not found')
  
  folders[index] = { ...folders[index], ...data }
  return { ...folders[index] }
}

export const deleteFolder = async (id) => {
  await delay(250)
  const index = folders.findIndex(f => f.id === id)
  if (index === -1) throw new Error('Folder not found')
  
  const deletedFolder = folders.splice(index, 1)[0]
  return { ...deletedFolder }
}