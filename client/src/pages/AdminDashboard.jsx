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
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime = null
          const startValue = 0
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
  }, [end, duration, hasAnimated])

  return (
    <span
      ref={ref}
      className="inline-block"
      style={{
        transform: hasAnimated ? 'scale(1)' : 'scale(0.8)',
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

  // Handle QR code printing
  const handlePrintQR = (job) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${job.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .qr-container { 
              border: 2px solid #333; 
              padding: 20px; 
              margin: 20px auto; 
              width: fit-content; 
            }
            img { 
              max-width: 300px; 
              height: auto; 
            }
            h2 { 
              margin-bottom: 10px; 
            }
            p { 
              margin: 5px 0; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${job.title}</h2>
            <p><strong>${job.company.name}</strong></p>
            <p>Job ID: ${job.jobId}</p>
            <img src="${job.qrCode}" alt="QR Code for ${job.title}" />
            <p>Scan to view job details</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
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
    if (!studentData) return

    try {
      setSummaryLoading(true)
      const response = await adminAPI.generateStudentSummary(studentData.phone)
      setStudentSummary(response.data.summary)
      toast.success('Student summary generated successfully')
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error('Failed to generate student summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  // Handle student role deletion
  const handleDeleteStudent = async () => {
    if (!studentData) return

    if (!window.confirm(`Are you sure you want to delete the profile for ${studentData.name}? This action cannot be undone.`)) {
      return
    }

    try {
      await adminAPI.deleteStudent(studentData.phone)
      toast.success('Student profile deleted successfully')
      setStudentData(null)
      setStudentSummary('')
      setStudentPhone('')
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student profile')
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
                              onClick={() => handlePrintQR(job)}
                              className="admin-button flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                              title="Print QR Code"
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
                        <span className="ml-2 text-gray-900 dark:text-white">{studentData.experience.years} years</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <button
                        onClick={handleGenerateSummary}
                        disabled={summaryLoading}
                        className="admin-button w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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
                        onClick={handleDeleteStudent}
                        className="admin-button w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        title="Delete Student Profile"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Delete Role
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
    </div>
  )
}

export default AdminDashboard
