import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Trash2,
  Eye,
  EyeOff,
  QrCode,
  User,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  UserX
} from 'lucide-react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

// Animated Counter Component with 3D effects
const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let startTime = null
          const startValue = count
          const endValue = end

          const animate = (currentTime) => {
            if (startTime === null) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3)
            const currentCount = Math.floor(easeOutCubic * (endValue - startValue) + startValue)

            setCount(currentCount)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [end, duration, count])

  return (
    <span
      ref={ref}
      className="inline-block"
      style={{
        transform: 'scale(1)',
        transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {prefix}{count}{suffix}
    </span>
  )
}

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({})

  // Add 3D animations CSS
  useEffect(() => {
    const adminAnimationStyles = `
      @keyframes cardFloat {
        0%, 100% {
          transform: translateY(0px) rotateX(0deg) rotateY(0deg);
        }
        50% {
          transform: translateY(-5px) rotateX(2deg) rotateY(1deg);
        }
      }

      @keyframes statCardPop {
        0% {
          transform: scale(0.8) translateY(20px) rotateX(15deg);
          opacity: 0;
        }
        60% {
          transform: scale(1.05) translateY(-5px) rotateX(-5deg);
          opacity: 0.9;
        }
        100% {
          transform: scale(1) translateY(0) rotateX(0deg);
          opacity: 1;
        }
      }

      @keyframes iconSpin3D {
        0% {
          transform: rotateY(0deg) rotateX(0deg);
        }
        50% {
          transform: rotateY(180deg) rotateX(10deg);
        }
        100% {
          transform: rotateY(360deg) rotateX(0deg);
        }
      }

      @keyframes buttonHover3D {
        0% {
          transform: translateZ(0px) rotateX(0deg);
        }
        100% {
          transform: translateZ(10px) rotateX(5deg);
        }
      }

      .stat-card {
        animation: statCardPop 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        transform-style: preserve-3d;
        perspective: 1000px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .stat-card:hover {
        transform: translateY(-8px) rotateX(5deg) rotateY(2deg) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(147, 51, 234, 0.1);
      }

      .stat-icon {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      .stat-card:hover .stat-icon {
        animation: iconSpin3D 1s ease-in-out;
        transform: scale(1.1);
      }

      .admin-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }

      .admin-button:hover {
        animation: buttonHover3D 0.3s ease-out forwards;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }

      .floating-card {
        animation: cardFloat 6s ease-in-out infinite;
        transform-style: preserve-3d;
      }
    `

    const styleSheet = document.createElement('style')
    styleSheet.textContent = adminAnimationStyles
    document.head.appendChild(styleSheet)

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet)
      }
    }
  }, [])
  
  // Student search states
  const [studentPhone, setStudentPhone] = useState('')
  const [studentData, setStudentData] = useState(null)
  const [studentSummary, setStudentSummary] = useState('')
  const [studentLoading, setStudentLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  // Function to format LLM response
  const formatSummary = (rawSummary) => {
    if (!rawSummary) return []

    // Split by sections and clean up
    const sections = rawSummary
      .split(/(?=\d+\.\s|\*\*|\n\n)/)
      .filter(section => section.trim().length > 0)
      .map(section => {
        // Clean up special characters and formatting
        let cleaned = section
          .replace(/\*\*/g, '') // Remove bold markdown
          .replace(/\*/g, '') // Remove asterisks
          .replace(/#{1,6}\s/g, '') // Remove markdown headers
          .replace(/^\d+\.\s/, '') // Remove numbered list markers
          .replace(/^-\s/, '') // Remove dash list markers
          .trim()

        // Identify section type
        let type = 'content'
        let title = ''

        if (cleaned.toLowerCase().includes('behavioral trait') ||
            cleaned.toLowerCase().includes('core behavioral')) {
          type = 'behavioral'
          title = 'Core Behavioral Traits'
        } else if (cleaned.toLowerCase().includes('technical competenc') ||
                   cleaned.toLowerCase().includes('technical skill')) {
          type = 'technical'
          title = 'Technical Competencies'
        } else if (cleaned.toLowerCase().includes('communication') ||
                   cleaned.toLowerCase().includes('interpersonal')) {
          type = 'communication'
          title = 'Communication & Interpersonal Skills'
        } else if (cleaned.toLowerCase().includes('problem-solving') ||
                   cleaned.toLowerCase().includes('problem solving')) {
          type = 'problem-solving'
          title = 'Problem-Solving Approach'
        } else if (cleaned.toLowerCase().includes('teamwork') ||
                   cleaned.toLowerCase().includes('collaboration')) {
          type = 'teamwork'
          title = 'Teamwork & Collaboration'
        } else if (cleaned.toLowerCase().includes('career readiness') ||
                   cleaned.toLowerCase().includes('career potential')) {
          type = 'career'
          title = 'Career Readiness & Potential'
        } else if (cleaned.toLowerCase().includes('recommended') ||
                   cleaned.toLowerCase().includes('career path')) {
          type = 'recommendations'
          title = 'Recommended Career Paths'
        } else if (cleaned.toLowerCase().includes('development') ||
                   cleaned.toLowerCase().includes('suggestion')) {
          type = 'development'
          title = 'Development Suggestions'
        }

        return {
          type,
          title,
          content: cleaned
        }
      })
      .filter(section => section.content.length > 20) // Filter out very short sections

    return sections
  }

  // Fetch jobs data
  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 20,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        industry: industryFilter || undefined,
        jobType: jobTypeFilter || undefined
      }
      
      const response = await adminAPI.getAllJobs(params)
      setJobs(response.data.jobs)
      setPagination(response.data.pagination)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(currentPage)
  }, [searchTerm, statusFilter, industryFilter, jobTypeFilter, currentPage])



  // Handle job deletion
  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await adminAPI.deleteJob(jobId)
      toast.success('Job deleted successfully')
      fetchJobs(currentPage)
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  // Handle job status toggle
  const handleToggleJobStatus = async (jobId, currentStatus, jobTitle) => {
    try {
      await adminAPI.toggleJobStatus(jobId, !currentStatus)
      toast.success(`Job "${jobTitle}" ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchJobs(currentPage)
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
    }
  }

  // Handle complete job details download as PNG image
  const handleDownloadJobDetails = async (job) => {
    try {
      if (!job.qrCode) {
        toast.error('QR code not available for this job')
        return
      }

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
      currentY += 50

      // Draw a line separator
      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(50, currentY)
      ctx.lineTo(canvas.width - 50, currentY)
      ctx.stroke()
      currentY += 30

      // Job Information Grid
      ctx.textAlign = 'left'
      const leftCol = 60
      const rightCol = 420
      const infoSpacing = 35

      // Left column info
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Job ID:', leftCol, currentY)
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.fillText(job.jobId, leftCol + 80, currentY)

      ctx.fillStyle = '#374151'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Industry:', rightCol, currentY)
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.fillText(job.company?.industry || 'Not specified', rightCol + 80, currentY)
      currentY += infoSpacing

      ctx.fillStyle = '#374151'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Job Type:', leftCol, currentY)
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.fillText(job.jobType || 'Not specified', leftCol + 80, currentY)

      ctx.fillStyle = '#374151'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Location:', rightCol, currentY)
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.fillText(job.location?.city || 'Not specified', rightCol + 80, currentY)
      currentY += infoSpacing

      ctx.fillStyle = '#374151'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Posted:', leftCol, currentY)
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.fillText(new Date(job.createdAt).toLocaleDateString(), leftCol + 80, currentY)

      if (job.salary?.min && job.salary?.max) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 16px Arial'
        ctx.fillText('Salary:', rightCol, currentY)
        ctx.fillStyle = '#6b7280'
        ctx.font = '16px Arial'
        const salaryText = `${job.salary.currency || '$'}${job.salary.min.toLocaleString()} - ${job.salary.currency || '$'}${job.salary.max.toLocaleString()}`
        ctx.fillText(salaryText, rightCol + 80, currentY)
      }
      currentY += 50

      // Job Description Section
      if (job.description) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 18px Arial'
        ctx.fillText('📋 Job Description', leftCol, currentY)
        currentY += 25

        currentY = drawWrappedText(job.description, leftCol, currentY, canvas.width - 120, 22, 16, '#4b5563')
        currentY += 20
      }

      // Requirements Section
      if (job.requirements && job.requirements.length > 0) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 18px Arial'
        ctx.fillText('✅ Requirements', leftCol, currentY)
        currentY += 25

        job.requirements.forEach(req => {
          ctx.fillStyle = '#10b981'
          ctx.font = 'bold 16px Arial'
          ctx.fillText('✓', leftCol, currentY)

          currentY = drawWrappedText(req, leftCol + 25, currentY, canvas.width - 145, 22, 16, '#4b5563')
          currentY += 5
        })
        currentY += 20
      }

      // Contact Information
      if (job.contactInfo) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 18px Arial'
        ctx.fillText('📞 Contact Information', leftCol, currentY)
        currentY += 25

        if (job.contactInfo.name) {
          currentY = drawWrappedText(`Contact Person: ${job.contactInfo.name}`, leftCol, currentY, canvas.width - 120, 22, 16, '#4b5563')
        }
        if (job.contactInfo.email) {
          currentY = drawWrappedText(`Email: ${job.contactInfo.email}`, leftCol, currentY, canvas.width - 120, 22, 16, '#4b5563')
        }
        if (job.contactInfo.phone) {
          currentY = drawWrappedText(`Phone: ${job.contactInfo.phone}`, leftCol, currentY, canvas.width - 120, 22, 16, '#4b5563')
        }
        currentY += 20
      }

      // QR Code Section
      const qrImg = new Image()
      qrImg.crossOrigin = 'anonymous'

      qrImg.onload = () => {
        // QR Section Background
        const qrSectionY = currentY
        const qrSectionHeight = 200

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, qrSectionY, 0, qrSectionY + qrSectionHeight)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')

        ctx.fillStyle = gradient
        ctx.fillRect(50, qrSectionY, canvas.width - 100, qrSectionHeight)

        // QR Section Text
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('📱 Scan QR Code to Apply', canvas.width / 2, qrSectionY + 30)

        ctx.font = '14px Arial'
        ctx.fillText('Students can scan this QR code to access the job posting instantly', canvas.width / 2, qrSectionY + 55)

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
          toast.success(`Job details image downloaded for ${job.title}`)
        }, 'image/png', 1.0)
      }

      qrImg.onerror = () => {
        toast.error('Failed to load QR code image')
      }

      qrImg.src = job.qrCode

    } catch (error) {
      console.error('Error downloading job details:', error)
      toast.error('Failed to download job details')
    }
  }

  // Handle QR code only download (original functionality)
  const handleDownloadQROnly = async (job) => {
    try {
      if (!job.qrCode) {
        toast.error('QR code not available for this job')
        return
      }

      const link = document.createElement('a')
      link.href = job.qrCode
      link.download = `QR_${job.jobId}_${job.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`QR code downloaded for ${job.title}`)
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('Failed to download QR code')
    }
  }

  // Handle student search
  const handleStudentSearch = async () => {
    if (!studentPhone.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    try {
      setStudentLoading(true)
      setStudentData(null)
      setStudentSummary('')
      
      const response = await adminAPI.searchStudent(studentPhone.trim())
      setStudentData(response.data.student)
      toast.success('Student found successfully')
    } catch (error) {
      console.error('Error searching student:', error)
      if (error.response?.status === 404) {
        toast.error('Student not found')
      } else {
        toast.error('Failed to search student')
      }
      setStudentData(null)
    } finally {
      setStudentLoading(false)
    }
  }

  // Handle student summary generation
  const handleGenerateSummary = async () => {
    if (!studentData) {
      toast.error('No student data available')
      return
    }

    try {
      setSummaryLoading(true)
      console.log('Generating summary for student:', studentData.phone)

      const response = await adminAPI.generateStudentSummary(studentData.phone)
      console.log('Summary response:', response.data)

      setStudentSummary(response.data.summary)
      setShowSummaryModal(true) // Show the modal
      toast.success('Student summary generated successfully')
    } catch (error) {
      console.error('Error generating summary:', error)

      // More detailed error handling
      if (error.response?.status === 404) {
        toast.error('Student not found in database')
      } else if (error.response?.status === 500) {
        toast.error('Server error while generating summary. Please try again.')
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`)
      } else {
        toast.error('Failed to generate student summary. Please check your connection.')
      }
    } finally {
      setSummaryLoading(false)
    }
  }

  // Handle student data deletion
  const handleDeleteStudent = async () => {
    if (!studentData) {
      toast.error('No student data available')
      return
    }

    if (!window.confirm(`Are you sure you want to delete all data for ${studentData.name}? This will allow them to retake the assessment. This action cannot be undone.`)) {
      return
    }

    try {
      await adminAPI.deleteStudent(studentData.phone)
      toast.success('Student data deleted successfully! They can now retake the assessment.')
      setStudentData(null)
      setStudentSummary('')
      setStudentPhone('')
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student data')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format salary
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not specified'
    
    const formatAmount = (amount) => {
      if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
      return amount.toString()
    }

    if (salary.min && salary.max) {
      return `${formatAmount(salary.min)} - ${formatAmount(salary.max)} ${salary.currency}`
    } else if (salary.min) {
      return `${formatAmount(salary.min)}+ ${salary.currency}`
    } else if (salary.max) {
      return `Up to ${formatAmount(salary.max)} ${salary.currency}`
    }
    return 'Not specified'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage job postings and search student profiles
          </p>
        </div>

        {/* Stats Cards with 3D Animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className="stat-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter end={stats.totalJobs || 0} duration={2000} />
                </p>
              </div>
              <Briefcase className="stat-icon w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div
            className="stat-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">
                  <AnimatedCounter end={stats.activeJobs || 0} duration={2200} />
                </p>
              </div>
              <CheckCircle className="stat-icon w-8 h-8 text-green-600" />
            </div>
          </div>

          <div
            className="stat-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Jobs</p>
                <p className="text-2xl font-bold text-red-600">
                  <AnimatedCounter end={stats.inactiveJobs || 0} duration={2400} />
                </p>
              </div>
              <AlertCircle className="stat-icon w-8 h-8 text-red-600" />
            </div>
          </div>

          <div
            className="stat-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">
                  <AnimatedCounter end={stats.totalApplications || 0} duration={2600} />
                </p>
              </div>
              <TrendingUp className="stat-icon w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Management Section */}
          <div className="lg:col-span-2">
            <div className="floating-card bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Job Management
                </h2>
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Industry"
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  <input
                    type="text"
                    placeholder="Job Type"
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <button
                  onClick={() => fetchJobs(1)}
                  className="admin-button flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
              
              {/* Jobs List */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No jobs found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job._id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {job.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                job.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {job.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <div className="flex items-center">
                                <Building className="w-4 h-4 mr-2" />
                                {job.company.name}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {job.location.type} - {job.location.city || 'Not specified'}
                              </div>
                              <div className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-2" />
                                {job.jobType} • {job.industry}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Created: {formatDate(job.createdAt)}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <strong>Job ID:</strong> {job.jobId}
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Salary:</strong> {formatSalary(job.salary)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleDownloadJobDetails(job)}
                              className="admin-button flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                              title="Download Complete Job Details as PNG Image"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Details
                            </button>

                            <button
                              onClick={() => handleDownloadQROnly(job)}
                              className="admin-button flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                              title="Download QR Code Only"
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              QR
                            </button>

                            <button
                              onClick={() => handleToggleJobStatus(job.jobId, job.isActive, job.title)}
                              className={`admin-button flex items-center px-3 py-1 rounded transition-colors text-sm ${
                                job.isActive
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              title={job.isActive ? 'Deactivate Job' : 'Activate Job'}
                            >
                              {job.isActive ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                              {job.isActive ? 'Hide' : 'Show'}
                            </button>

                            <button
                              onClick={() => handleDeleteJob(job.jobId, job.title)}
                              className="admin-button flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-1 text-gray-600 dark:text-gray-400">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Search Section */}
          <div className="lg:col-span-1">
            <div className="floating-card bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Student Search
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter phone number"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
                      />
                      <button
                        onClick={handleStudentSearch}
                        disabled={studentLoading}
                        className="admin-button px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {studentLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Student Details */}
              {studentData && (
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Student Profile
                      </h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{studentData.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{studentData.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{studentData.phone}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Education:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {studentData.education.degree} in {studentData.education.field}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Institution:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{studentData.education.institution}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Experience:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{studentData.experienceYears || 0} years</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <button
                        type="button"
                        onClick={handleGenerateSummary}
                        disabled={summaryLoading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {summaryLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating Summary...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Generate LLM Summary
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!studentData) {
                            toast.error('No student data available')
                            return
                          }

                          if (!confirm(`Are you sure you want to delete all data for ${studentData.name}? This will allow them to retake the assessment. This action cannot be undone.`)) {
                            return
                          }

                          try {
                            const response = await fetch(`/api/admin/students/${studentData.phone}`, {
                              method: 'DELETE'
                            })

                            if (response.ok) {
                              setStudentData(null)
                              setStudentSummary('')
                              setStudentPhone('')
                              setShowSummaryModal(false)
                              toast.success('Student data deleted successfully! They can now retake the assessment.')
                            } else {
                              throw new Error('Failed to delete student')
                            }
                          } catch (error) {
                            console.error('Error:', error)
                            toast.error('Failed to delete student data. Please try again.')
                          }
                        }}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        title="Delete Student Data - Student can retake assessment"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Delete Student Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Student Summary */}
              {studentSummary && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    AI-Generated Summary
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                      {studentSummary}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && studentSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI-Generated Student Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive behavioral and skills assessment for {studentData?.name}
                </p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {formatSummary(studentSummary).map((section, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  {section.title && (
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      {section.type === 'behavioral' && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'technical' && (
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'communication' && (
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'problem-solving' && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'teamwork' && (
                        <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'career' && (
                        <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'recommendations' && (
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'development' && (
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      )}
                      {section.type === 'content' && (
                        <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                      )}
                      {section.title}
                    </h4>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const summaryText = formatSummary(studentSummary)
                      .map(section => `${section.title ? section.title + '\n' : ''}${section.content}`)
                      .join('\n\n')
                    navigator.clipboard.writeText(summaryText)
                    alert('Summary copied to clipboard!')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy Summary
                </button>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
