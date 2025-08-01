import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building, MapPin, DollarSign, Users, FileText, Plus, X } from 'lucide-react'
import { jobAPI } from '../services/api'

const JobPostingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responsibilities, setResponsibilities] = useState([''])
  const [benefits, setBenefits] = useState([''])
  const [requiredSkills, setRequiredSkills] = useState([''])
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, watch } = useForm()

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
        }
      }

      const response = await jobAPI.createJob(jobData)
      toast.success('Job posted successfully!')
      navigate(`/qr-preview/${response.data.job.jobId}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post job')
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
        <p className="text-gray-600">Create a new job posting to reach qualified candidates</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Senior Software Engineer"
                {...register('title', { required: 'Job title is required' })}
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Your company name"
                {...register('company.name', { required: 'Company name is required' })}
              />
              {errors.company?.name && <p className="form-error">{errors.company.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Industry</label>
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
              <label className="form-label">Job Type</label>
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
          </div>

          <div className="form-group mt-6">
            <label className="form-label">Job Description</label>
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
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location & Salary
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Location Type</label>
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
                className="input-field"
                placeholder="e.g., New York"
                {...register('location.city')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., NY"
                {...register('location.state')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., USA"
                {...register('location.country')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="form-group">
              <label className="form-label">Minimum Salary (USD)</label>
              <input
                type="number"
                className="input-field"
                placeholder="50000"
                {...register('salary.min', { min: 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Salary (USD)</label>
              <input
                type="number"
                className="input-field"
                placeholder="80000"
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
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Requirements
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Education Level</label>
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
                    className="px-3 py-2 text-red-600 hover:text-red-700"
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
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
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
                  className="px-3 py-2 text-red-600 hover:text-red-700"
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
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Benefits
          </h2>

          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Health insurance, 401k, Flexible hours"
                  value={benefit}
                  onChange={(e) => updateItem(benefits, setBenefits, index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(benefits, setBenefits, index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
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
            disabled={isSubmitting}
            className="btn-primary text-lg px-8 py-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Posting Job...
              </>
            ) : (
              'Post Job'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobPostingForm 