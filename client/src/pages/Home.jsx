import { Link } from 'react-router-dom'
import { User, Briefcase, Building, QrCode, ArrowRight, Star } from 'lucide-react'
import Logo from '../components/Logo'

const Home = () => {
  const features = [
    {
      title: 'Student Assessment',
      description: 'Complete a comprehensive assessment to understand your skills and career goals',
      icon: User,
      path: '/assessment',
      color: 'bg-blue-500'
    },
    {
      title: 'Career Match',
      description: 'Find jobs that match your skills and preferences with our AI-powered matching',
      icon: Briefcase,
      path: '/career-match',
      color: 'bg-purple-500'
    },
    {
      title: 'Post Job',
      description: 'Companies can post job opportunities and reach qualified candidates',
      icon: Building,
      path: '/post-job',
      color: 'bg-green-500'
    },
    {
      title: 'QR Scanner',
      description: 'Scan QR codes to quickly access job details and apply',
      icon: QrCode,
      path: '/scan',
      color: 'bg-indigo-500'
    }
  ]

  const stats = [
    { label: 'Active Jobs', value: '150+' },
    { label: 'Students', value: '500+' },
    { label: 'Companies', value: '50+' },
    { label: 'Success Rate', value: '85%' }
  ]

  return (
    <div className="space-y-12 md:space-y-20">
      {/* EDITED: Hero Section with dark background and larger logo */}
      <section className="text-center space-y-6 p-8 md:p-16 rounded-3xl bg-slate-900">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            {/* EDITED: Wrapped Logo in a div to make it larger */}
            <div className="w-48">
              <Logo />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Find Your Perfect
            {/* EDITED: Brighter gradient for dark background */}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Career Match</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Connect talented students with innovative companies through our AI-powered job matching platform.
            Complete assessments, discover opportunities, and build your career.
          </p>
        </div>
        
        {/* EDITED: Centered single button */}
        <div className="flex justify-center pt-4">
          <Link to="/assessment" className="btn-primary text-lg px-8 py-3">
            Start Assessment
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center py-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section with Dark Background */}
      <section className="space-y-10 bg-gray-900 rounded-3xl p-8 md:p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform provides comprehensive tools for both students and companies to find the perfect match.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link
                key={index}
                to={feature.path}
                className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-700/80 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-blue-400 font-medium text-sm group-hover:text-blue-300">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Complete Assessment</h3>
            <p className="text-gray-600">
              Take our comprehensive assessment to evaluate your skills, experience, and career goals.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Get Matched</h3>
            <p className="text-gray-600">
              Our AI algorithm matches you with the best job opportunities based on your profile.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Apply & Connect</h3>
            <p className="text-gray-600">
              Apply to matched jobs and connect with companies through our streamlined process.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join thousands of students who have found their dream careers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/assessment" className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-lg">
              Start Assessment
            </Link>
            <Link to="/post-job" className="border border-gray-500 text-white font-medium py-3 px-8 rounded-lg hover:bg-white hover:text-gray-900 transition-colors duration-200">
              Post a Job
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
