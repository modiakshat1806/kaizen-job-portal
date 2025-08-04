import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building, MapPin, DollarSign, Users, FileText, Download, Share2, ArrowLeft, ExternalLink } from 'lucide-react'
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

  const downloadQRCode = async () => {
    if (!job?.qrCode) return
    
    setDownloading(true)
    try {
      // Create a temporary link element to download the QR code
      const link = document.createElement('a')
      link.href = job.qrCode
      link.download = `job-qr-${job.jobId}.png`
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
                    onClick={downloadQRCode}
                    disabled={downloading}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={shareJob}
                    className="btn-outline w-full flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Job
                  </button>
                </div>
                
                                 <div className="text-sm text-gray-500 space-y-1">
                   <p>Job ID: <span className="font-mono font-medium">{job.jobId}</span></p>
                   <p>Job URL: <span className="font-mono font-medium">{job.generateQRCode ? job.generateQRCode() : `${window.location.origin}/job/${job.jobId}`}</span></p>
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