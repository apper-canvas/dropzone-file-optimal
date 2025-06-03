import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <ApperIcon name="FileX" className="w-16 h-16 text-white" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
          File Not Found
        </h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
          The file or page you're looking for seems to have been moved, deleted, or doesn't exist.
        </p>
        
        <Link 
          to="/" 
          className="btn btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Home" className="w-5 h-5" />
          <span>Back to DropZone</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound