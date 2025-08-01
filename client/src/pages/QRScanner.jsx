import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { QrCode, Camera, ArrowLeft, CheckCircle } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

const QRScanner = () => {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  const startScanner = () => {
    setScanning(true)
    setError(null)
    setScannedData(null)

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    )

    scanner.render(onScanSuccess, onScanFailure)
    scannerRef.current = scanner
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setScanning(false)
  }

  const onScanSuccess = (decodedText, decodedResult) => {
    try {
      // Extract job ID from the scanned URL
      const url = new URL(decodedText)
      const jobId = url.pathname.split('/').pop()
      
      if (jobId && jobId.startsWith('JOB_')) {
        setScannedData({ jobId, url: decodedText })
        stopScanner()
        toast.success('Job QR code detected!')
      } else {
        setError('Invalid job QR code. Please scan a valid job QR code.')
      }
    } catch (error) {
      setError('Invalid QR code format. Please scan a valid job QR code.')
    }
  }

  const onScanFailure = (error) => {
    // Handle scan failure silently
    console.warn(`QR scan error = ${error}`)
  }

  const handleViewJob = () => {
    if (scannedData) {
      navigate(`/job/${scannedData.jobId}`)
    }
  }

  const handleScanAgain = () => {
    setScannedData(null)
    setError(null)
    startScanner()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
        <p className="text-gray-600">Scan job QR codes to quickly access job details</p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="card">
        {!scanning && !scannedData && !error && (
          <div className="text-center space-y-6">
            <div className="text-gray-400">
              <QrCode className="w-24 h-24 mx-auto" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Scan
              </h3>
              <p className="text-gray-600 mb-6">
                Point your camera at a job QR code to get started
              </p>
            </div>
            <button
              onClick={startScanner}
              className="btn-primary flex items-center mx-auto"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanner
            </button>
          </div>
        )}

        {scanning && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Scanning QR Code
              </h3>
              <p className="text-gray-600 mb-4">
                Position the QR code within the frame
              </p>
            </div>
            
            <div id="qr-reader" className="w-full"></div>
            
            <div className="text-center">
              <button
                onClick={stopScanner}
                className="btn-outline"
              >
                Stop Scanner
              </button>
            </div>
          </div>
        )}

        {scannedData && (
          <div className="text-center space-y-6">
            <div className="text-green-500">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Job Found!
              </h3>
              <p className="text-gray-600 mb-4">
                Job ID: {scannedData.jobId}
              </p>
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleViewJob}
                className="btn-primary"
              >
                View Job Details
              </button>
              <button
                onClick={handleScanAgain}
                className="btn-outline"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center space-y-6">
            <div className="text-red-500">
              <QrCode className="w-16 h-16 mx-auto" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Scan Error
              </h3>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
            </div>
            <button
              onClick={handleScanAgain}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4">How to Use</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
              1
            </div>
            <p>Click "Start Scanner" to activate your camera</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
              2
            </div>
            <p>Point your camera at a job QR code</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
              3
            </div>
            <p>Hold steady until the code is detected</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
              4
            </div>
            <p>View the job details and check your fitment score</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner 