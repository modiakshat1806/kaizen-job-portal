import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home.jsx';
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment" element={
          <main className="container mx-auto px-4 py-8">
            <StudentAssessment />
          </main>
        } />
        <Route path="/career-match" element={
          <main className="container mx-auto px-4 py-8">
            <CareerMatch />
          </main>
        } />
        <Route path="/post-job" element={
          <main className="container mx-auto px-4 py-8">
            <JobPostingForm />
          </main>
        } />
        <Route path="/job/:jobId" element={
          <main className="container mx-auto px-4 py-8">
            <JobDetail />
          </main>
        } />
        <Route path="/scan" element={
          <main className="container mx-auto px-4 py-8">
            <QRScanner />
          </main>
        } />
        <Route path="/qr-preview/:jobId" element={
          <main className="container mx-auto px-4 py-8">
            <QRPreview />
          </main>
        } />
      </Routes>
    </div>
  )
}

export default App 