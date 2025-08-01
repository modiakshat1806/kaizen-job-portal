import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { QrCode, Download, Share, ArrowLeft, Building, MapPin, Clock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { jobAPI } from '../services/api'

const QRPreview = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    fetchJob()
  }, [jobId])

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await jobAPI.getById(jobId)
      setJob(response.data.job)
      
      // Generate QR code URL
      const baseUrl = window.location.origin
      setQrUrl(`${baseUrl}/job/${job.jobId}`)
    } catch (error) {
      toast.error('Failed to fetch job details')
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const pngFile = canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `job-qr-${jobId}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      })
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job?.title} at ${job?.company?.name}`,
          text: `Check out this job opportunity: ${job?.title}`,
          url: qrUrl
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrUrl).then(() => {
        toast.success('Job URL copied to clipboard!')
      }).catch(() => {
        toast.error('Failed to copy URL')
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Job not found</h2>
        <p className="text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generated</h1>
        <p className="text-gray-600">Share this QR code to help candidates find your job posting</p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="card">
          <div className="text-center space-y-6">
            <div className="bg-white p-8 rounded-lg border-2 border-gray-200 inline-block">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Job QR Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to view the job details
              </p>
            </div>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={downloadQRCode}
                className="btn-outline flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={shareQRCode}
                className="btn-primary flex items-center"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Job Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <Building className="w-4 h-4 mr-2" />
                  <span>{job.company.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{job.jobType}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{job.location.type}</span>
                </div>
              </div>

              {job.salary.min && (
                <div className="text-gray-600">
                  <span className="font-medium">Salary:</span> ${job.salary.min.toLocaleString()} - ${job.salary.max?.toLocaleString() || 'N/A'}
                </div>
              )}

              <div className="text-gray-600">
                <span className="font-medium">Industry:</span> {job.industry}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">QR Code Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={qrUrl}
                    readOnly
                    className="input-field text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrUrl)
                      toast.success('URL copied to clipboard!')
                    }}
                    className="btn-outline text-sm px-3 py-2"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job ID
                </label>
                <input
                  type="text"
                  value={job.jobId}
                  readOnly
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sharing Tips</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  1
                </div>
                <p>Download the QR code and print it for physical job postings</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  2
                </div>
                <p>Share the QR code digitally on social media or email</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  3
                </div>
                <p>Include the QR code in job fair materials and business cards</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                  4
                </div>
                <p>Candidates can scan the code to instantly view job details and apply</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRPreview 