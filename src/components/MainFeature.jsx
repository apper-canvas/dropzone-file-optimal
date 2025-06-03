import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import * as fileService from '../services/api/fileService'
import * as folderService from '../services/api/folderService'
import * as uploadService from '../services/api/uploadService'

const MainFeature = ({ onUploadComplete, currentFolder }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploads, setUploads] = useState([])
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
    e.target.value = ''
  }, [])

  const handleFiles = async (files) => {
    const newUploads = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      progress: 0,
      status: 'uploading',
      speed: 0
    }))

    setUploads(prev => [...prev, ...newUploads])

    for (const upload of newUploads) {
      try {
        await simulateUpload(upload)
        
        // Create file record
        const fileData = {
          name: upload.file.name,
          size: upload.file.size,
          type: upload.file.type,
          folderId: currentFolder?.id || null,
          thumbnail: upload.file.type.includes('image') ? URL.createObjectURL(upload.file) : null,
          downloadUrl: `#download-${upload.id}`
        }

        await fileService.create(fileData)
        
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'completed' } : u
        ))

        toast.success(`${upload.file.name} uploaded successfully!`)
      } catch (error) {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'error' } : u
        ))
        toast.error(`Failed to upload ${upload.file.name}`)
      }
    }

    // Clean up completed uploads after 3 seconds
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status !== 'completed'))
      onUploadComplete?.()
    }, 3000)
  }

  const simulateUpload = (upload) => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        const speed = (Math.random() * 5 + 1).toFixed(1)
        
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress: Math.min(progress, 100), speed } : u
        ))

        if (progress >= 100) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }

  const removeUpload = (uploadId) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId))
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const folderData = {
        name: newFolderName,
        parentId: currentFolder?.id || null,
        fileCount: 0
      }

      await folderService.create(folderData)
      setNewFolderName('')
      setShowNewFolderDialog(false)
      toast.success('Folder created successfully!')
      onUploadComplete?.()
    } catch (error) {
      toast.error('Failed to create folder')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        className={`upload-zone p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragOver ? 'upload-zone-active scale-105' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="space-y-4"
          animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-upload">
            <ApperIcon 
              name={isDragOver ? "Upload" : "CloudUpload"} 
              className="w-8 h-8 md:w-10 md:h-10 text-white animate-float" 
            />
          </div>
          
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
              {isDragOver ? "Drop files here" : "Drag & drop files"}
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              or click to browse and select files
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-surface-500 dark:text-surface-500">
              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-full">Images</span>
              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-full">Videos</span>
              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-full">Documents</span>
              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-full">Archives</span>
            </div>
          </div>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setShowNewFolderDialog(true)}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ApperIcon name="FolderPlus" className="w-5 h-5" />
          <span>New Folder</span>
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-primary flex items-center space-x-2"
        >
          <ApperIcon name="Upload" className="w-5 h-5" />
          <span>Select Files</span>
        </button>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            className="card p-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-surface-900 dark:text-surface-100">
                Uploading {uploads.filter(u => u.status === 'uploading').length} files
              </h4>
              <button
                onClick={() => setUploads([])}
                className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              {uploads.map((upload) => (
                <motion.div
                  key={upload.id}
                  className="flex items-center space-x-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    {upload.status === 'completed' ? (
                      <ApperIcon name="Check" className="w-5 h-5 text-white" />
                    ) : upload.status === 'error' ? (
                      <ApperIcon name="X" className="w-5 h-5 text-white" />
                    ) : (
                      <ApperIcon name="File" className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                      {upload.file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-surface-600 dark:text-surface-400">
                      <span>{formatFileSize(upload.file.size)}</span>
                      {upload.status === 'uploading' && (
                        <>
                          <span>•</span>
                          <span>{upload.speed} MB/s</span>
                        </>
                      )}
                    </div>
                    
                    {upload.status === 'uploading' && (
                      <div className="mt-2 bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${upload.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 flex-shrink-0"
                  >
                    <ApperIcon name="X" className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Folder Dialog */}
      <AnimatePresence>
        {showNewFolderDialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewFolderDialog(false)}
          >
            <motion.div
              className="card p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                Create New Folder
              </h3>
              
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                autoFocus
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewFolderDialog(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature