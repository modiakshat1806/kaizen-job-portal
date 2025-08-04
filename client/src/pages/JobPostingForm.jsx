import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building, MapPin, DollarSign, Users, FileText, Plus, X, Eye, Edit, Trash2, Download, Share2 } from 'lucide-react'
import { jobAPI } from '../services/api'

const JobPostingForm = () => {
  // Add CSS animations for 3D job posting title effect
  useEffect(() => {
    const jobAnimationStyles = `
      @keyframes jobTitlePop {
        0% {
          transform: scale(0.8) translateY(20px) rotateX(10deg);
          opacity: 0;
        }
        60% {
          transform: scale(1.05) translateY(-3px) rotateX(-3deg);
          opacity: 0.9;
        }
        100% {
          transform: scale(1) translateY(0) rotateX(0deg);
          opacity: 1;
        }
      }
    `
    const styleSheet = document.createElement('style')
    styleSheet.textContent = jobAnimationStyles
    document.head.appendChild(styleSheet)
    return () => document.head.removeChild(styleSheet)
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [responsibilities, setResponsibilities] = useState([''])
  const [benefits, setBenefits] = useState([''])
  const [requiredSkills, setRequiredSkills] = useState([''])
  const [previewData, setPreviewData] = useState(null)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm()

  // Watch location type to disable location fields for remote jobs
  const locationType = watch('location.type')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const jobData = {
        ...data,
        responsibilities: responsibilities.filter(item => item.trim()),
        benefits: benefits.filter(item => item.trim()),
        requirements: {
          ...data.requirements,
          skills: requiredSkills.filter(skill => skill.trim())
        },
        salary: {
          ...data.salary,
          currency: 'INR' // Always use INR (Rupees)
        }
      }

      const response = await jobAPI.createJob(jobData)
      toast.success('Job posted successfully!')
      
      // Navigate to QR preview page
      navigate(`/qr-preview/${response.data.job.jobId}`)
    } catch (error) {
      console.error('Job posting error:', error)
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(detail => detail.msg).join(', ')
        toast.error(`Validation failed: ${errorMessages}`)
      } else {
        toast.error(error.response?.data?.error || 'Failed to post job')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    const formData = getValues()
    console.log('Raw form data:', formData) // Debug log
    
    const previewJobData = {
      ...formData,
      responsibilities: responsibilities.filter(item => item.trim()),
      benefits: benefits.filter(item => item.trim()),
      requirements: {
        ...formData.requirements,
        skills: requiredSkills.filter(skill => skill.trim())
      },
      salary: {
        ...formData.salary,
        currency: 'INR'
      }
    }
    console.log('Preview job data:', previewJobData) // Debug log
    setPreviewData(previewJobData)
    setShowPreview(true)
  }

  const handleEdit = () => {
    setShowPreview(false)
  }

  const handlePostJob = async () => {
    if (!previewData) return
    
    setIsSubmitting(true)
    try {
      console.log('Submitting job data:', previewData) // Debug log
      const response = await jobAPI.createJob(previewData)
      toast.success('Job posted successfully!')
      navigate(`/qr-preview/${response.data.job.jobId}`)
    } catch (error) {
      console.error('Job posting error:', error)
      console.error('Error response:', error.response?.data) // Debug log
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(detail => detail.msg).join(', ')
        toast.error(`Validation failed: ${errorMessages}`)
      } else {
        toast.error(error.response?.data?.error || 'Failed to post job')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addItem = (list, setList) => {
    setList([...list, ''])
  }

  const removeItem = (list, setList, index) => {
    const newList = list.filter((_, i) => i !== index)
    setList(newList)
  }

  const updateItem = (list, setList, index, value) => {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (showPreview && previewData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
            style={{
              animation: 'jobTitlePop 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
              transformStyle: 'preserve-3d',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            Job Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Review your job posting before publishing</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{previewData.title}</h2>
                <p className="text-purple-100 text-lg">{previewData.company?.name}</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-2">
                  {previewData.jobType}
                </span>
                <div className="mt-2 text-blue-100 text-sm">
                  {previewData.location?.type === 'Remote' ? '🌐 Remote' : 
                   previewData.location?.type === 'Hybrid' ? '🏢 Hybrid' : '🏢 On-site'}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-purple-600" />
                  Job Details
                </h3>
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                     <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                     <span className="font-medium text-gray-900 dark:text-white">{previewData.industry}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                     <span className="text-gray-600 dark:text-gray-400">Location:</span>
                     <span className="font-medium text-gray-900 dark:text-white">
                       {previewData.location?.type === 'Remote' ? 'Remote' :
                        `${previewData.location?.city || ''}, ${previewData.location?.state || ''}, ${previewData.location?.country || ''}`}
                     </span>
                   </div>
                   {previewData.salary?.min && (
                     <div className="flex justify-between items-center">
                       <span className="text-gray-600">Salary:</span>
                       <span className="font-medium">
                         {formatCurrency(previewData.salary.min)} - {formatCurrency(previewData.salary.max)} {previewData.salary?.period}
                       </span>
                     </div>
                   )}
                                       <div className="flex justify-between items-center">
                      <span className="text-gray-600">Job ID:</span>
                      <span className="font-medium font-mono text-gray-500">Will be generated after posting</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Contact Person:</span>
                      <span className="font-medium">{previewData.contactPerson?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Contact Phone:</span>
                      <span className="font-medium">{previewData.contactPerson?.phone}</span>
                    </div>
                 </div>
              </div>

                             <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Education:</span>
                     <span className="font-medium">{previewData.requirements?.education}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Experience:</span>
                     <span className="font-medium">{previewData.requirements?.experience?.min || 0} years</span>
                   </div>
                 </div>
               </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
              <p className="text-gray-700 leading-relaxed">{previewData.description}</p>
            </div>

            {/* Skills */}
            {previewData.requirements?.skills?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {previewData.requirements.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {previewData.responsibilities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {previewData.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {previewData.benefits?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {previewData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleEdit}
              className="btn-outline flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostJob}
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
          style={{
            animation: 'jobTitlePop 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
            transformStyle: 'preserve-3d',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          Post a Job
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Create a new job posting to reach qualified candidates</p>
      </div>

      <form onSubmit={handleSubmit(handlePreview)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Senior Software Engineer"
                {...register('title', { required: 'Job title is required' })}
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Your company name"
                {...register('company.name', { required: 'Company name is required' })}
              />
              {errors.company?.name && <p className="form-error">{errors.company.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Industry *</label>
              <select className="input-field" {...register('industry', { required: 'Industry is required' })}>
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
              {errors.industry && <p className="form-error">{errors.industry.message}</p>}
            </div>

                         <div className="form-group">
               <label className="form-label">Job Type *</label>
               <select className="input-field" {...register('jobType', { required: 'Job type is required' })}>
                 <option value="">Select Job Type</option>
                 <option value="Full-time">Full-time</option>
                 <option value="Part-time">Part-time</option>
                 <option value="Contract">Contract</option>
                 <option value="Internship">Internship</option>
                 <option value="Freelance">Freelance</option>
               </select>
               {errors.jobType && <p className="form-error">{errors.jobType.message}</p>}
             </div>

             <div className="form-group">
               <label className="form-label">Contact Person Name *</label>
               <input
                 type="text"
                 className="input-field"
                 placeholder="e.g., John Doe"
                 {...register('contactPerson.name', { required: 'Contact person name is required' })}
               />
               {errors.contactPerson?.name && <p className="form-error">{errors.contactPerson.name.message}</p>}
             </div>

             <div className="form-group">
               <label className="form-label">Contact Person Phone *</label>
               <input
                 type="tel"
                 className="input-field"
                 placeholder="e.g., +91 98765 43210"
                 {...register('contactPerson.phone', { required: 'Contact person phone is required' })}
               />
               {errors.contactPerson?.phone && <p className="form-error">{errors.contactPerson.phone.message}</p>}
             </div>
          </div>

          <div className="form-group mt-6">
            <label className="form-label">Job Description *</label>
            <textarea
              className="input-field"
              rows="6"
              placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              {...register('description', { required: 'Job description is required' })}
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>
        </div>

        {/* Location & Salary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Location & Salary
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Location Type *</label>
              <select className="input-field" {...register('location.type', { required: 'Location type is required' })}>
                <option value="">Select Location Type</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {errors.location?.type && <p className="form-error">{errors.location.type.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className={`input-field ${locationType === 'Remote' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., Mumbai"
                disabled={locationType === 'Remote'}
                {...register('location.city')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className={`input-field ${locationType === 'Remote' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., Maharashtra"
                disabled={locationType === 'Remote'}
                {...register('location.state')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className={`input-field ${locationType === 'Remote' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., India"
                disabled={locationType === 'Remote'}
                {...register('location.country')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="form-group">
              <label className="form-label">Minimum Salary (₹)</label>
              <input
                type="number"
                className="input-field"
                placeholder="500000"
                {...register('salary.min', { min: 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Salary (₹)</label>
              <input
                type="number"
                className="input-field"
                placeholder="800000"
                {...register('salary.max', { min: 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary Period</label>
              <select className="input-field" {...register('salary.period')}>
                <option value="Yearly">Yearly</option>
                <option value="Monthly">Monthly</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Requirements
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Education Level *</label>
              <select className="input-field" {...register('requirements.education', { required: 'Education requirement is required' })}>
                <option value="">Select Education</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Any">Any</option>
              </select>
              {errors.requirements?.education && <p className="form-error">{errors.requirements.education.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Experience (Years)</label>
              <input
                type="number"
                className="input-field"
                min="0"
                placeholder="2"
                {...register('requirements.experience.min', { min: 0 })}
              />
            </div>
          </div>

          <div className="form-group mt-6">
            <label className="form-label">Required Skills</label>
            <div className="space-y-2">
              {requiredSkills.map((skill, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., JavaScript, React"
                    value={skill}
                    onChange={(e) => updateItem(requiredSkills, setRequiredSkills, index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(requiredSkills, setRequiredSkills, index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(requiredSkills, setRequiredSkills)}
                className="btn-outline text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Responsibilities
          </h2>

          <div className="space-y-2">
            {responsibilities.map((responsibility, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Develop and maintain web applications"
                  value={responsibility}
                  onChange={(e) => updateItem(responsibilities, setResponsibilities, index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(responsibilities, setResponsibilities, index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(responsibilities, setResponsibilities)}
              className="btn-outline text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Responsibility
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
            Benefits
          </h2>

          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Health insurance, Flexible hours"
                  value={benefit}
                  onChange={(e) => updateItem(benefits, setBenefits, index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(benefits, setBenefits, index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(benefits, setBenefits)}
              className="btn-outline text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Benefit
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary text-lg px-8 py-3 flex items-center"
          >
            <Eye className="w-5 h-5 mr-2" />
            Preview Job
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobPostingForm 