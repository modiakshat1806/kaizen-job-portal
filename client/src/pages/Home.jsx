import { Link } from 'react-router-dom'
import { User, Briefcase, Building, QrCode, ArrowRight, Zap, Shield, Trophy } from 'lucide-react'

const Home = () => {
  const stats = [
    { label: 'Active Jobs', value: '150+' },
    { label: 'Students Matched', value: '500+' },
    { label: 'Partner Companies', value: '50+' },
    { label: 'Success Stories', value: '85%' }
  ]

  const features = [
    {
      title: 'Skill Assessment',
      description: 'Comprehensive evaluation of your technical and soft skills',
      icon: User,
      path: '/assessment'
    },
    {
      title: 'Career Opportunities',
      description: 'Browse curated job listings from top companies',
      icon: Briefcase,
      path: '/jobs'
    },
    {
      title: 'Company Hub',
      description: 'Streamlined recruitment process for hiring managers',
      icon: Building,
      path: '/companies'
    },
    {
      title: 'Quick Apply',
      description: 'One-click applications with QR code technology',
      icon: QrCode,
      path: '/apply'
    }
  ]

  const benefits = [
    {
      title: 'Lightning Fast',
      description: 'Get matched with relevant opportunities in seconds',
      icon: Zap
    },
    {
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security',
      icon: Shield
    },
    {
      title: 'Proven Results',
      description: 'Join thousands who found their dream careers',
      icon: Trophy
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-16 pb-24 px-4 overflow-hidden">
        {/* Enhanced 3D Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600 rounded-full blur-3xl animate-pulse"></div>
          <div 
            className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse" 
            style={{animationDelay: '1s'}}
          ></div>
          <div 
            className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-bounce" 
            style={{animationDelay: '2s'}}
          ></div>
        </div>
       
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6 transform hover:scale-105 transition-transform duration-300 shadow-lg">
              🚀 August Fest 2025 - Career Connection Platform
            </div>
           
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 transform hover:scale-105 transition-transform duration-500">
              Your career journey
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                starts here
              </span>
            </h1>
           
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Connect with innovative companies, showcase your skills, and discover opportunities
              that align with your career aspirations through our intelligent matching system.
            </p>
           
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/assessment"
                className="group inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                Begin Assessment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center px-8 py-4 border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-md hover:shadow-lg"
              >
                Browse Opportunities
              </Link>
            </div>
          </div>

          {/* Enhanced 3D Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 text-center hover:bg-white transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 shadow-lg hover:shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="text-3xl font-bold text-purple-600 mb-1 transform hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with 3D Cards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 transform hover:scale-105 transition-transform duration-300">
              Everything you need to succeed
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful tools designed to connect talent with opportunity seamlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={index}
                  to={feature.path}
                  className="group bg-gray-50 hover:bg-white p-8 rounded-2xl transition-all duration-500 hover:shadow-2xl border border-transparent hover:border-purple-100 transform hover:-translate-y-4 hover:rotate-y-6"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-600 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                    <Icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors transform group-hover:scale-105">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-purple-600 font-medium text-sm group-hover:text-purple-700">
                    Explore
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Process Section with 3D Elements */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-purple-700 relative overflow-hidden">
        {/* 3D Floating Elements */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-bounce" 
            style={{animationDelay: '0s'}}
          ></div>
          <div 
            className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full animate-bounce" 
            style={{animationDelay: '1s'}}
          ></div>
          <div 
            className="absolute bottom-10 left-1/4 w-12 h-12 bg-white rounded-full animate-bounce" 
            style={{animationDelay: '2s'}}
          ></div>
        </div>
       
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 transform hover:scale-105 transition-transform duration-300">
              Simple. Fast. Effective.
            </h2>
            <p className="text-purple-100 text-lg">
              Get started in just three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center text-white transform hover:-translate-y-2 transition-transform duration-500">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transform hover:rotate-12 hover:scale-110 transition-all duration-300 shadow-lg">
                01
              </div>
              <h3 className="text-2xl font-semibold mb-4">Create Profile</h3>
              <p className="text-purple-100 leading-relaxed">
                Build your professional profile and complete our comprehensive skills assessment
              </p>
            </div>

            <div className="text-center text-white transform hover:-translate-y-2 transition-transform duration-500">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transform hover:rotate-12 hover:scale-110 transition-all duration-300 shadow-lg">
                02
              </div>
              <h3 className="text-2xl font-semibold mb-4">Get Matched</h3>
              <p className="text-purple-100 leading-relaxed">
                Our AI analyzes your profile and connects you with the most relevant opportunities
              </p>
            </div>

            <div className="text-center text-white transform hover:-translate-y-2 transition-transform duration-500">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold transform hover:rotate-12 hover:scale-110 transition-all duration-300 shadow-lg">
                03
              </div>
              <h3 className="text-2xl font-semibold mb-4">Land the Job</h3>
              <p className="text-purple-100 leading-relaxed">
                Apply with confidence and start your career journey with the right company
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Benefits Section with 3D Layout */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 transform hover:scale-105 transition-transform duration-300">
                Why students choose our platform
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                We've built the most effective career platform specifically for August Fest 2025,
                combining cutting-edge technology with deep understanding of student needs.
              </p>
             
              <div className="space-y-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 transform hover:-translate-x-2 transition-transform duration-300"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 transform hover:rotate-12 hover:scale-110 transition-all duration-300 shadow-md">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
           
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-12 rounded-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl">
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-600 mb-2 transform hover:scale-110 transition-transform duration-300">
                  85%
                </div>
                <div className="text-gray-700 font-medium mb-4">Success Rate</div>
                <p className="text-gray-600 text-sm">
                  of students find their ideal role within 30 days of joining our platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA with 3D Effects */}
      <section className="py-20 px-4 bg-gray-50 relative overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-600 rounded-full blur-3xl animate-pulse"></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse" 
            style={{animationDelay: '1.5s'}}
          ></div>
        </div>
       
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 transform hover:scale-105 transition-transform duration-300">
            Ready to accelerate your career?
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            Join the future of career discovery at August Fest 2025
          </p>
         
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/learn-more"
              className="inline-flex items-center px-10 py-4 text-purple-600 font-semibold hover:text-purple-700 transition-colors transform hover:-translate-y-1 hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home