import { Link } from 'react-router-dom'
import { User, Briefcase, Building, QrCode, ArrowRight, Star } from 'lucide-react'

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
      color: 'bg-green-500'
    },
    {
      title: 'Post Job',
      description: 'Companies can post job opportunities and reach qualified candidates',
      icon: Building,
      path: '/post-job',
      color: 'bg-purple-500'
    },
    {
      title: 'QR Scanner',
      description: 'Scan QR codes to quickly access job details and apply',
      icon: QrCode,
      path: '/scan',
      color: 'bg-orange-500'
    }
  ]

  const stats = [
    { label: 'Active Jobs', value: '150+' },
    { label: 'Students', value: '500+' },
    { label: 'Companies', value: '50+' },
    { label: 'Success Rate', value: '85%' }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Find Your Perfect
            <span className="text-primary-600"> Career Match</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect talented students with innovative companies through our AI-powered job matching platform.
            Complete assessments, discover opportunities, and build your career.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/assessment" className="btn-primary text-lg px-8 py-3">
            Start Assessment
          </Link>
          <Link to="/career-match" className="btn-outline text-lg px-8 py-3">
            Browse Jobs
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
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
                className="card hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Complete Assessment</h3>
            <p className="text-gray-600">
              Take our comprehensive assessment to evaluate your skills, experience, and career goals.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Get Matched</h3>
            <p className="text-gray-600">
              Our AI algorithm matches you with the best job opportunities based on your profile.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Apply & Connect</h3>
            <p className="text-gray-600">
              Apply to matched jobs and connect with companies through our streamlined process.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 rounded-2xl p-8 text-center text-white">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <p className="text-primary-100 text-lg">
            Join thousands of students who have found their dream careers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assessment" className="bg-white text-primary-600 font-medium py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Start Assessment
            </Link>
            <Link to="/post-job" className="border border-white text-white font-medium py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200">
              Post a Job
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 