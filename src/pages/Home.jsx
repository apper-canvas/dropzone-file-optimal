import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import * as fileService from '../services/api/fileService'
import * as folderService from '../services/api/folderService'

const Home = () => {
  const [currentFolder, setCurrentFolder] = useState(null)
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    loadFolderData()
  }, [currentFolder])

  const loadFolderData = async () => {
    setLoading(true)
    try {
      const [foldersData, filesData] = await Promise.all([
        folderService.getAll(),
        fileService.getAll()
      ])
      
      const filteredFolders = foldersData.filter(folder => 
        folder.parentId === (currentFolder?.id || null)
      )
      
      const filteredFiles = filesData.filter(file => 
        file.folderId === (currentFolder?.id || null)
      )
      
      setFolders(filteredFolders || [])
      setFiles(filteredFiles || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder)
  }

  const navigateUp = () => {
    if (currentFolder?.parentId) {
      const parentFolder = folders.find(f => f.id === currentFolder.parentId)
      setCurrentFolder(parentFolder || null)
    } else {
      setCurrentFolder(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type?.includes('image')) return 'Image'
    if (type?.includes('video')) return 'Video'
    if (type?.includes('audio')) return 'Music'
    if (type?.includes('pdf') || type?.includes('document')) return 'FileText'
    if (type?.includes('zip') || type?.includes('archive')) return 'Archive'
    return 'File'
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-900/90 backdrop-blur-lg border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-soft">
                <ApperIcon name="Cloud" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">DropZone</h1>
                <p className="text-xs text-surface-600 dark:text-surface-400">File Management Platform</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="btn btn-secondary p-2"
              >
                <ApperIcon name={viewMode === 'grid' ? 'List' : 'Grid3X3'} className="w-5 h-5" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="btn btn-secondary p-2"
              >
                <ApperIcon name={isDarkMode ? 'Sun' : 'Moon'} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-4">
            <MainFeature onUploadComplete={loadFolderData} currentFolder={currentFolder} />
          </div>

          {/* Breadcrumb Navigation */}
          <div className="xl:col-span-4">
            <nav className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400 mb-6">
              <button
                onClick={() => setCurrentFolder(null)}
                className="hover:text-primary transition-colors"
              >
                <ApperIcon name="Home" className="w-4 h-4" />
              </button>
              {currentFolder && (
                <>
                  <ApperIcon name="ChevronRight" className="w-4 h-4" />
                  <span className="font-medium text-surface-900 dark:text-surface-100">
                    {currentFolder.name}
                  </span>
                </>
              )}
              {currentFolder && (
                <button
                  onClick={navigateUp}
                  className="ml-auto btn btn-secondary text-xs"
                >
                  <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-1" />
                  Back
                </button>
              )}
            </nav>
          </div>

          {/* Files and Folders Grid */}
          <div className="xl:col-span-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' 
                  : 'grid-cols-1'
              }`}>
                {/* Folders */}
                {folders.map((folder) => (
                  <motion.div
                    key={folder.id}
                    className={`card p-4 cursor-pointer hover:shadow-soft transition-all duration-200 ${
                      viewMode === 'list' ? 'flex items-center space-x-4' : ''
                    }`}
                    onClick={() => handleFolderClick(folder)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`${viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-3 flex-1'}`}>
                      <div className={`${viewMode === 'grid' ? 'mx-auto mb-2' : ''} w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center`}>
                        <ApperIcon name="Folder" className="w-6 h-6 text-white" />
                      </div>
                      <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                        <p className="font-medium text-surface-900 dark:text-surface-100 truncate">
                          {folder.name}
                        </p>
                        <p className="text-xs text-surface-600 dark:text-surface-400">
                          {folder.fileCount || 0} files
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Files */}
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    className={`card p-4 hover:shadow-soft transition-all duration-200 ${
                      viewMode === 'list' ? 'flex items-center space-x-4' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`${viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-3 flex-1'}`}>
                      <div className={`${viewMode === 'grid' ? 'mx-auto mb-2' : ''} w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center`}>
                        <ApperIcon name={getFileIcon(file.type)} className="w-6 h-6 text-white" />
                      </div>
                      <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                        <p className="font-medium text-surface-900 dark:text-surface-100 truncate text-sm">
                          {file.name}
                        </p>
                        <p className="text-xs text-surface-600 dark:text-surface-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {viewMode === 'list' && (
                        <button className="btn btn-secondary p-2">
                          <ApperIcon name="Download" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && !error && folders.length === 0 && files.length === 0 && (
              <div className="text-center py-12">
                <ApperIcon name="FolderOpen" className="w-16 h-16 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400">
                  {currentFolder ? 'This folder is empty' : 'No files or folders yet'}
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-500 mt-2">
                  Start by uploading some files above
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home