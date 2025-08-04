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

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
    </ThemeProvider>
  )
}

export default App 