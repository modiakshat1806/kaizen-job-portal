import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home.jsx';
import StudentAssessment from './pages/StudentAssessment'
import CareerMatch from './pages/CareerMatch'
import JobPostingForm from './pages/JobPostingForm'
import JobDetail from './pages/JobDetail'
import QRScanner from './pages/QRScanner'
import QRPreview from './pages/QRPreview'
import CareerMatchResults from './pages/CareerMatchResults'
import JobListings from './pages/JobListings'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<StudentAssessment />} />
          <Route path="/career-match" element={<CareerMatch />} />
          <Route path="/post-job" element={<JobPostingForm />} />
          <Route path="/job/:jobId" element={<JobDetail />} />
          <Route path="/scan" element={<QRScanner />} />
          <Route path="/qr-preview/:jobId" element={<QRPreview />} />
          <Route path="/career-match-results" element={<CareerMatchResults />} />
          <Route path="/jobs" element={<JobListings />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App 