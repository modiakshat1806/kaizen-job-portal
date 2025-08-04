import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const CareerMatchResults = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const assessmentData = location.state?.assessmentData

  useEffect(() => {
    // If no assessment data, redirect to assessment
    if (!assessmentData) {
      navigate('/assessment')
      return
    }

    // Pass assessment data via URL parameters
    const encodedData = encodeURIComponent(JSON.stringify(assessmentData))
    const resultsUrl = `/career-match-results.html?data=${encodedData}`
    
    // Open the results page in new window/tab
    const newWindow = window.open(resultsUrl, '_blank')
    
    if (!newWindow) {
      // Fallback: redirect to assessment if popup blocked
      navigate('/assessment')
    }
  }, [assessmentData, navigate])



  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Opening your career matches...</p>
      </div>
    </div>
  )
}

export default CareerMatchResults 