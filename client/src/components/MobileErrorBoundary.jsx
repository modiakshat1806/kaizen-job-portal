import React from 'react'
import { AlertTriangle, RefreshCw, Smartphone, Wifi } from 'lucide-react'

class MobileErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Mobile Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log additional mobile-specific information
    const mobileInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      onLine: navigator.onLine,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    }

    console.error('Mobile context:', mobileInfo)
  }

  handleRetry = () => {
    this.setState({ isRetrying: true })
    
    // Clear error state after a short delay
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        isRetrying: false 
      })
    }, 1000)
  }

  handleReload = () => {
    window.location.reload()
  }

  getDeviceType = () => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS'
    if (/Android/.test(ua)) return 'Android'
    if (/Mobile/.test(ua)) return 'Mobile'
    return 'Desktop'
  }

  render() {
    if (this.state.hasError) {
      const deviceType = this.getDeviceType()
      const isOnline = navigator.onLine

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              The app encountered an unexpected error. This might be due to a network issue or compatibility problem.
            </p>

            {/* Device Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Device Info</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <div>Device: {deviceType}</div>
                <div>Platform: {navigator.platform}</div>
                <div className="flex items-center space-x-1">
                  <Wifi className={`w-3 h-3 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                  <span>Network: {isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6">
                <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300 overflow-auto max-h-32">
                  <div className="font-mono">
                    {this.state.error && this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2 font-mono">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <RefreshCw className={`w-4 h-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                <span>{this.state.isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                Reload Page
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Still having issues?</strong> Try clearing your browser cache, 
                checking your internet connection, or using a different browser.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default MobileErrorBoundary
