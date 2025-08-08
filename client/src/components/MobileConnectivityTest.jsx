import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { healthAPI } from '../services/api'
import { Wifi, WifiOff, Smartphone, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const MobileConnectivityTest = ({ onClose }) => {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [networkInfo, setNetworkInfo] = useState(null)

  useEffect(() => {
    // Get network information
    const getNetworkInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData
        } : null
      }
      setNetworkInfo(info)
    }

    getNetworkInfo()

    // Listen for online/offline events
    const handleOnline = () => getNetworkInfo()
    const handleOffline = () => getNetworkInfo()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const runConnectivityTest = async () => {
    setIsLoading(true)
    try {
      const result = await healthAPI.testMobileConnectivity()
      setTestResults(result)
      
      if (result.success) {
        toast.success('✅ API connectivity test passed!')
      } else {
        toast.error('❌ API connectivity test failed')
      }
    } catch (error) {
      console.error('Connectivity test error:', error)
      setTestResults({
        success: false,
        error: error.message,
        networkInfo
      })
      toast.error('❌ Connectivity test failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getConnectionIcon = () => {
    if (!networkInfo?.onLine) return <WifiOff className="w-5 h-5 text-red-500" />
    if (networkInfo?.connection?.effectiveType === '4g') return <Wifi className="w-5 h-5 text-green-500" />
    if (networkInfo?.connection?.effectiveType === '3g') return <Wifi className="w-5 h-5 text-yellow-500" />
    return <Wifi className="w-5 h-5 text-blue-500" />
  }

  const getDeviceType = () => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS'
    if (/Android/.test(ua)) return 'Android'
    if (/Mobile/.test(ua)) return 'Mobile'
    return 'Desktop'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mobile Connectivity Test
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Device Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">Device Info</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div>Type: {getDeviceType()}</div>
              <div>Platform: {networkInfo?.platform}</div>
              <div>Language: {networkInfo?.language}</div>
            </div>
          </div>

          {/* Network Status */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {getConnectionIcon()}
              <span className="font-medium text-gray-900 dark:text-white">Network Status</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div className="flex items-center space-x-2">
                <span>Online:</span>
                {networkInfo?.onLine ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              {networkInfo?.connection && (
                <>
                  <div>Connection: {networkInfo.connection.effectiveType}</div>
                  <div>Speed: {networkInfo.connection.downlink} Mbps</div>
                  <div>Latency: {networkInfo.connection.rtt} ms</div>
                </>
              )}
            </div>
          </div>

          {/* API Test Results */}
          {testResults && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">API Test Results</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex items-center space-x-2">
                  <span>Status:</span>
                  {testResults.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>{testResults.success ? 'Success' : 'Failed'}</span>
                </div>
                {testResults.responseTime && (
                  <div>Response Time: {testResults.responseTime} ms</div>
                )}
                {testResults.error && (
                  <div className="text-red-500">Error: {testResults.error}</div>
                )}
              </div>
            </div>
          )}

          {/* Test Button */}
          <button
            onClick={runConnectivityTest}
            disabled={isLoading}
            className="w-full btn btn-primary"
          >
            {isLoading ? 'Testing...' : 'Run Connectivity Test'}
          </button>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Troubleshooting Tips:</p>
                <ul className="space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Try refreshing the page</li>
                  <li>• Disable any VPN or proxy</li>
                  <li>• Clear browser cache and cookies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileConnectivityTest
