import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import StudentAssessment from './pages/StudentAssessment'
import CareerMatch from './pages/CareerMatch'
import JobPostingForm from './pages/JobPostingForm'
import JobDetail from './pages/JobDetail'
import QRScanner from './pages/QRScanner'
import QRPreview from './pages/QRPreview'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<StudentAssessment />} />
          <Route path="/career-match" element={<CareerMatch />} />
          <Route path="/post-job" element={<JobPostingForm />} />
          <Route path="/job/:jobId" element={<JobDetail />} />
          <Route path="/scan" element={<QRScanner />} />
          <Route path="/qr-preview/:jobId" element={<QRPreview />} />
        </Routes>
      </main>
    </div>
  )
}

export default App 