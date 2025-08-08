import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building, MapPin, DollarSign, Users, FileText, Download, Share2, ArrowLeft, ExternalLink, Copy, QrCode } from 'lucide-react'
import { jobAPI } from '../services/api'

const QRPreview = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await jobAPI.getById(jobId)
      setJob(response.data.job)
    } catch (error) {
      console.error('Error fetching job:', error)
             toast.error('Failed to load job details')
       navigate('/post-job')
    } finally {
      setLoading(false)
    }
  }

  // Handle complete job details download as PNG image (like admin dashboard)
  const downloadJobDetails = async () => {
    if (!job?.qrCode) return

    setDownloading(true)
    try {
      // Create a canvas to draw the job details
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size (A4 proportions)
      canvas.width = 800
      canvas.height = 1200

      // Fill background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Helper function to draw text with word wrapping
      const drawWrappedText = (text, x, y, maxWidth, lineHeight, fontSize = 16, color = '#333333') => {
        ctx.fillStyle = color
        ctx.font = `${fontSize}px Arial`

        const words = text.split(' ')
        let line = ''
        let currentY = y

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' '
          const metrics = ctx.measureText(testLine)
          const testWidth = metrics.width

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY)
            line = words[n] + ' '
            currentY += lineHeight
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, x, currentY)
        return currentY + lineHeight
      }

      let currentY = 40

      // Header - Logo and Title
      ctx.fillStyle = '#7c3aed'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🚀 Kaizen Job Portal', canvas.width / 2, currentY)
      currentY += 40

      // Job Title
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 32px Arial'
      ctx.fillText(job.title, canvas.width / 2, currentY)
      currentY += 40

      // Company Name
      ctx.fillStyle = '#6b7280'
      ctx.font = '20px Arial'
      ctx.fillText(job.company?.name || 'Company Name', canvas.width / 2, currentY)
      currentY += 30

      // Status Badge
      const statusText = job.isActive ? 'ACTIVE' : 'INACTIVE'
      const statusColor = job.isActive ? '#065f46' : '#991b1b'
      const statusBgColor = job.isActive ? '#d1fae5' : '#fee2e2'

      ctx.fillStyle = statusBgColor
      ctx.fillRect(canvas.width / 2 - 40, currentY - 15, 80, 25)
      ctx.fillStyle = statusColor
      ctx.font = 'bold 12px Arial'
      ctx.fillText(statusText, canvas.width / 2, currentY)
      currentY += 40

      // Job Details Section
      ctx.textAlign = 'left'
      const leftMargin = 50
      const rightMargin = canvas.width - 50
      const maxWidth = rightMargin - leftMargin

      // Job Type and Location
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 18px Arial'
      ctx.fillText('Job Details', leftMargin, currentY)
      currentY += 30

      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.fillText(`Type: ${job.jobType}`, leftMargin, currentY)
      currentY += 25
      ctx.fillText(`Location: ${job.location?.city || 'Remote'}, ${job.location?.state || ''} ${job.location?.country || ''}`, leftMargin, currentY)
      currentY += 25
      ctx.fillText(`Salary: ${formatCurrency(job.salary?.min)} - ${formatCurrency(job.salary?.max)}`, leftMargin, currentY)
      currentY += 35

      // Description
      if (job.description) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 18px Arial'
        ctx.fillText('Description', leftMargin, currentY)
        currentY += 25
        currentY = drawWrappedText(job.description, leftMargin, currentY, maxWidth, 22, 14, '#6b7280')
        currentY += 20
      }

      // Load and draw QR code
      const qrImg = new Image()
      qrImg.onload = () => {
        // QR Code Section
        const qrSectionY = currentY
        const qrSectionHeight = 200

        ctx.fillStyle = '#374151'
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Scan QR Code to Apply', canvas.width / 2, qrSectionY + 30)

        // Draw QR Code
        const qrSize = 120
        const qrX = canvas.width / 2 - qrSize / 2
        const qrY = qrSectionY + 70

        // White background for QR
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

        currentY += qrSectionHeight + 30

        // Footer
        ctx.fillStyle = '#6b7280'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, canvas.width / 2, currentY)
        currentY += 20
        ctx.fillText('Kaizen Job Portal - August Fest 2025 | Smart Career Matching Platform', canvas.width / 2, currentY)

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `JobDetails_${job.jobId}_${job.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`

          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          URL.revokeObjectURL(url)
          toast.success('Job details downloaded successfully!')
        }, 'image/png', 1.0)
      }

      qrImg.onerror = () => {
        toast.error('Failed to load QR code image')
      }

      qrImg.src = job.qrCode

    } catch (error) {
      console.error('Error downloading job details:', error)
      toast.error('Failed to download job details')
    } finally {
      setDownloading(false)
    }
  }

  // Handle QR code only download (original functionality)
  const downloadQRCodeOnly = async () => {
    if (!job?.qrCode) return

    setDownloading(true)
    try {
      // Create a temporary link element to download the QR code
      const link = document.createElement('a')
      link.href = job.qrCode
      link.download = `QR_${job.jobId}_${job.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('QR Code downloaded successfully!')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('Failed to download QR code')
    } finally {
      setDownloading(false)
    }
  }

  const shareJob = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title} at ${job.company.name}`,
          url: job.generateQRCode ? job.generateQRCode() : window.location.href
        })
        toast.success('Job shared successfully!')
      } catch (error) {
        console.error('Error sharing job:', error)
        toast.error('Failed to share job')
      }
    } else {
      // Fallback: copy to clipboard
      const jobUrl = job.generateQRCode ? job.generateQRCode() : window.location.href
      try {
        await navigator.clipboard.writeText(jobUrl)
        toast.success('Job URL copied to clipboard!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        toast.error('Failed to copy job URL')
      }
    }
  }

  const copyJobUrl = async () => {
    const jobUrl = job.generateQRCode ? job.generateQRCode() : `${window.location.origin}/job/${job.jobId}`
    try {
      await navigator.clipboard.writeText(jobUrl)
      toast.success('Job URL copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy job URL')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Job not found</p>
                     <button
             onClick={() => navigate('/post-job')}
             className="btn-primary mt-4"
           >
            Post New Job
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h1>
        <p className="text-gray-600">Your job is now live and ready to receive applications</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Job Details */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{job.title}</h2>
                <p className="text-blue-100 mt-1">{job.company?.name}</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {job.jobType}
                </span>
                <div className="mt-2 text-blue-100 text-sm">
                  {job.location?.type === 'Remote' ? '🌐 Remote' : 
                   job.location?.type === 'Hybrid' ? '🏢 Hybrid' : '🏢 On-site'}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Details</h3>
                                 <div className="space-y-2 text-sm">
                                       <div className="flex justify-between items-center">
                      <span className="text-gray-600">Job ID:</span>
                      <span className="font-medium font-mono">{job.jobId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Contact Person:</span>
                      <span className="font-medium">{job.contactPerson?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Contact Phone:</span>
                      <span className="font-medium">{job.contactPerson?.phone}</span>
                    </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Industry:</span>
                     <span className="font-medium">{job.industry}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Location:</span>
                     <span className="font-medium">
                       {job.location?.type === 'Remote' ? 'Remote' :
                        `${job.location?.city || ''}, ${job.location?.state || ''}, ${job.location?.country || ''}`}
                     </span>
                   </div>
                   {job.salary?.min && (
                     <div className="flex justify-between items-center">
                       <span className="text-gray-600">Salary:</span>
                       <span className="font-medium">
                         {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)} {job.salary?.period}
                       </span>
                     </div>
                   )}
                 </div>
              </div>

                             <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Education:</span>
                     <span className="font-medium">{job.requirements?.education}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Experience:</span>
                     <span className="font-medium">{job.requirements?.experience?.min || 0} years</span>
                   </div>
                 </div>
               </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            {/* Skills */}
            {job.requirements?.skills?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">QR Code</h3>
            <p className="text-gray-600 mb-6">Scan this QR code to view the job posting</p>
            
            {job.qrCode ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={job.qrCode} 
                    alt="Job QR Code" 
                    className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                  />
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={downloadJobDetails}
                    disabled={downloading}
                    className="btn-primary w-full flex items-center justify-center"
                    title="Download Complete Job Details with QR Code"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Job Details
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadQRCodeOnly}
                    disabled={downloading}
                    className="btn-outline w-full flex items-center justify-center"
                    title="Download QR Code Only"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Download QR Only
                  </button>

                  <button
                    onClick={shareJob}
                    className="btn-outline w-full flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Job
                  </button>
                </div>
                
                                 <div className="text-sm text-gray-500 space-y-3">
                   <p>Job ID: <span className="font-mono font-medium">{job.jobId}</span></p>

                   {/* Job URL with copy functionality */}
                   <div>
                     <p className="mb-2">Job URL:</p>
                     <div className="flex items-center space-x-2">
                       <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                         <span className="font-mono text-sm text-gray-700 break-all">
                           {job.generateQRCode ? job.generateQRCode() : `${window.location.origin}/job/${job.jobId}`}
                         </span>
                       </div>
                       <button
                         onClick={copyJobUrl}
                         className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                         title="Copy URL"
                       >
                         <Copy className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">QR Code not available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
                 <button
           onClick={() => navigate('/post-job')}
           className="btn-outline flex items-center"
         >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Post Another Job
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="btn-primary flex items-center"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Go to Home
        </button>
      </div>
    </div>
  )
}

export default QRPreview 