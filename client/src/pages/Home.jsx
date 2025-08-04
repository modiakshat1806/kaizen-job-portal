import { Link } from 'react-router-dom'
import { User, Briefcase, Building, QrCode, ArrowRight, Zap, MapPin, Users, Target } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import Logo from '../components/Logo'

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2500, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime = null
          const startValue = 0

          const animate = (currentTime) => {
            if (startTime === null) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            // Smoother easing function (ease-out-cubic)
            const easeOutCubic = 1 - Math.pow(1 - progress, 3)
            const currentCount = Math.floor(easeOutCubic * (end - startValue) + startValue)

            setCount(currentCount)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(end) // Ensure we end exactly at the target
            }
          }

          requestAnimationFrame(animate)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [end, duration, hasAnimated])

  return (
    <span
      ref={ref}
      style={{
        display: 'inline-block',
        minWidth: `${end.toString().length + suffix.length}ch`,
        textAlign: 'center'
      }}
    >
      {count}{suffix}
    </span>
  )
}

const Home = () => {
  // Add CSS animations for 3D hero title effect
  const heroAnimationStyles = `
    @keyframes heroTitlePop {
      0% {
        transform: scale(0.8) translateY(30px) rotateX(15deg);
        opacity: 0;
      }
      60% {
        transform: scale(1.05) translateY(-5px) rotateX(-5deg);
        opacity: 0.9;
      }
      100% {
        transform: scale(1) translateY(0) rotateX(0deg);
        opacity: 1;
      }
    }

    @keyframes heroSpanPop {
      0% {
        transform: scale(0.7) translateY(20px) rotateY(10deg);
        opacity: 0;
      }
      70% {
        transform: scale(1.08) translateY(-3px) rotateY(-3deg);
        opacity: 0.95;
      }
      100% {
        transform: scale(1) translateY(0) rotateY(0deg);
        opacity: 1;
      }
    }
  `

  // Inject styles
  React.useEffect(() => {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = heroAnimationStyles
    document.head.appendChild(styleSheet)
    return () => document.head.removeChild(styleSheet)
  }, [])
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const sectionsRef = useRef([])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)

      // Determine which section is currently in view with smoother transitions
      const sectionElements = sectionsRef.current
      if (sectionElements.length > 0) {
        const windowHeight = window.innerHeight
        const scrollPosition = currentScrollY + windowHeight * 0.3 // Earlier trigger for smoother animations

        sectionElements.forEach((section, index) => {
          if (section) {
            const sectionTop = section.offsetTop
            const sectionHeight = section.offsetHeight

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
              setActiveSection(index)
            }
          }
        })
      }
    }

    // Throttle scroll events for better performance and smoother animations
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    handleScroll() // Call once to set initial state
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [])

  const stats = [
    { label: 'Active Jobs', value: 150, suffix: '+' },
    { label: 'Students Matched', value: 500, suffix: '+' },
    { label: 'Partner Companies', value: 50, suffix: '+' },
    { label: 'Success Stories', value: 85, suffix: '%' }
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
      path: '/post-job',
      scrollToTop: true
    }

  ]



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={(el) => (sectionsRef.current[0] = el)}
        className="relative bg-gradient-to-br from-purple-100 via-purple-50 to-purple-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center transition-colors duration-300"
        style={{
          transform: `translateZ(${scrollY * 0.01}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Enhanced 3D Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute top-20 left-10 w-32 h-32 bg-purple-600 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translateZ(${scrollY * 0.005}px) translateY(${scrollY * 0.002}px)`
            }}
          ></div>
          <div 
            className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse" 
            style={{
              animationDelay: '1s',
              transform: `translateZ(${scrollY * 0.004}px) translateY(${scrollY * -0.001}px)`
            }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-bounce" 
            style={{
              animationDelay: '2s',
              transform: `translateZ(${scrollY * 0.008}px) translateY(${scrollY * 0.004}px)`
            }}
          ></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative w-full">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div
              className={`inline-block px-4 py-2 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full text-sm font-medium mb-6 transform transition-all duration-700 ease-out shadow-lg ${
                activeSection === 0 ? 'scale-105 translate-y-0 opacity-100' : 'scale-100 translate-y-4 opacity-80'
              }`}
            >
              🚀 August Fest 2025 - Career Connection Platform
            </div>
            
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 transform transition-all duration-700 ease-out ${
                activeSection === 0 ? 'scale-105 translate-y-0 opacity-100' : 'scale-100 translate-y-6 opacity-85'
              }`}
              style={{
                animation: 'heroTitlePop 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
                transformStyle: 'preserve-3d',
                textShadow: '0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)'
              }}
            >
              Your career journey
              <br />
              <span
                className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"
                style={{
                  animation: 'heroSpanPop 1.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s forwards',
                  display: 'inline-block',
                  transformStyle: 'preserve-3d'
                }}
              >
                starts here
              </span>
            </h1>
            
            <p
              className={`text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto transform transition-all duration-500 ease-out ${
                activeSection === 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-85'
              }`}
            >
              Connect with innovative companies, showcase your skills, and discover opportunities
              that align with your career aspirations through our intelligent matching system.
            </p>
            
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transform transition-all duration-1000 ${
                activeSection === 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-80'
              }`}
            >
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
                to="/post-job"
                className="inline-flex items-center px-8 py-4 border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-md hover:shadow-lg"
              >
                Post Opportunities
              </Link>
            </div>

            {/* Feature Icons Row */}
            <div
              className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 transform transition-all duration-1000 ${
                activeSection === 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>August Fest 2025</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Smart Matching</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Target className="w-4 h-4 text-purple-600" />
                <span>Instant Fitment</span>
              </div>
            </div>
          </div>

          {/* Enhanced 3D Stats Grid */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto transform transition-all duration-1000 ${
              activeSection === 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-60 scale-95'
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 dark:border-purple-400 text-center hover:bg-white dark:hover:bg-gray-700 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 shadow-lg hover:shadow-2xl"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                  animationDelay: `${index * 0.1}s`,
                  transform: `translateZ(${scrollY * 0.01}px)`
                }}
              >
                <div className="text-3xl font-bold text-purple-600 mb-1 transform hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with 3D Cards */}
      <section 
        ref={(el) => (sectionsRef.current[1] = el)}
        className="py-20 px-4 bg-white dark:bg-gray-800 relative min-h-screen flex items-center transition-colors duration-300"
        style={{
          transform: `translateZ(${Math.max(0, scrollY - 800) * 0.005}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* 3D Section Transition Effect */}
        <div 
          className={`absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/20 to-transparent transition-opacity duration-1000 ${
            activeSection === 1 ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>
        
        <div className="max-w-7xl mx-auto relative w-full">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transform transition-all duration-700 ease-out ${
                activeSection === 1 ? 'scale-105 translate-y-0 opacity-100' : 'scale-100 translate-y-6 opacity-85'
              }`}
            >
              Everything you need to succeed
            </h2>
            <p 
              className={`text-gray-600 text-lg max-w-2xl mx-auto transform transition-all duration-1000 ${
                activeSection === 1 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-80'
              }`}
            >
              Powerful tools designed to connect talent with opportunity seamlessly
            </p>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto transform transition-all duration-1000 ${
              activeSection === 1 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-60 scale-95'
            }`}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={index}
                  to={feature.path}
                  onClick={() => {
                    if (feature.scrollToTop) {
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
                    }
                  }}
                  className="group bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 p-6 sm:p-8 rounded-2xl transition-all duration-500 hover:shadow-2xl border border-transparent hover:border-purple-100 dark:hover:border-purple-400 transform hover:-translate-y-2 hover:rotate-y-3"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                    animationDelay: `${index * 0.1}s`,
                    transform: `translateZ(${scrollY * 0.005}px)`
                  }}
                >
                  <div className="w-14 h-14 bg-purple-100 group-hover:bg-purple-600 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                    <Icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors transform group-hover:scale-105">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
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



      {/* Simple. Fast. Effective. Section */}
      <section
        ref={(el) => (sectionsRef.current[2] = el)}
        className="py-16 px-4 bg-gradient-to-br from-purple-100 via-purple-200 to-indigo-100 relative"
        style={{
          transform: `translateZ(${Math.max(0, scrollY - 1200) * 0.005}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="max-w-6xl mx-auto relative w-full">
          <div className="text-center mb-12">
            <h2
              className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 transform transition-all duration-1000 ${
                activeSection === 2 ? 'scale-105 translate-y-0 opacity-100' : 'scale-100 translate-y-8 opacity-80'
              }`}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Simple. Fast. Effective.
            </h2>
            <p
              className={`text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 ${
                activeSection === 2 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-80'
              }`}
            >
              A seamless three-step process that revolutionizes how students discover and apply for opportunities
            </p>
          </div>

          <div
            className={`grid md:grid-cols-3 gap-8 transform transition-all duration-1000 ${
              activeSection === 2 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-60 scale-95'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300 shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-600">1. Companies Post</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto leading-relaxed">Companies create job postings through our simple form and receive unique QR codes for the Opportunity Wall</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300 shadow-lg">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-600">2. Students Scan</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto leading-relaxed">Students scan QR codes and complete a quick onboarding with education details and personality assessment</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-600">3. Smart Matching</h3>
              <p className="text-gray-600 text-sm max-w-xs mx-auto leading-relaxed">Our AI instantly calculates fitment scores, showing how well students align with each opportunity</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Kaizen Section */}
      <section
        ref={(el) => (sectionsRef.current[3] = el)}
        className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-purple-100 relative"
        style={{
          transform: `translateZ(${Math.max(0, scrollY - 1600) * 0.005}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="max-w-6xl mx-auto relative w-full">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 transform transition-all duration-1000 ${
                activeSection === 3 ? 'scale-105 translate-y-0 opacity-100' : 'scale-100 translate-y-8 opacity-80'
              }`}
            >
              Why Choose Kaizen?
            </h2>
            <p
              className={`text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 ${
                activeSection === 3 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-80'
              }`}
            >
              Built specifically for August Fest 2025 with cutting-edge technology and user experience
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 transform transition-all duration-1000 ${
              activeSection === 3 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-60 scale-95'
            }`}
          >
            {/* QR Code Magic */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-all duration-300 group-hover:scale-110">
                <QrCode className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                QR Code Magic
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Instant access to opportunities with a simple scan
              </p>
            </div>

            {/* Smart Fitment */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-all duration-300 group-hover:scale-110">
                <Target className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Smart Fitment
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI-powered matching based on personality and skills
              </p>
            </div>

            {/* Instant Results */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-all duration-300 group-hover:scale-110">
                <Zap className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Instant Results
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get your fitment score immediately after assessment
              </p>
            </div>

            {/* Event Exclusive */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-all duration-300 group-hover:scale-110">
                <Users className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Event Exclusive
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Designed exclusively for August Fest 2025 participants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Aspirant Community Section */}
      <section
        ref={(el) => (sectionsRef.current[4] = el)}
        className="py-20 px-4 text-white transition-colors duration-300 relative overflow-hidden"
        style={{
          backgroundColor: '#1e5631',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >


        <div className="max-w-6xl mx-auto relative w-full">
          <div
            className={`text-center transform transition-all duration-1000 ${
              activeSection === 4 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-80'
            }`}
          >
            {/* Main Heading */}
            <div className="mb-16">
              <h2
                className={`text-4xl md:text-5xl font-bold text-white mb-6 transform transition-all duration-1000 ${
                  activeSection === 4 ? 'scale-105 translate-y-0 opacity-100' : 'scale-100 translate-y-8 opacity-80'
                }`}
              >
                Ready to Accelerate your Career?
              </h2>
              <p
                className={`text-xl mb-16 leading-relaxed max-w-3xl mx-auto transform transition-all duration-500 ease-out ${
                  activeSection === 4 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-85'
                }`}
                style={{ color: '#a7f3d0' }}
              >
                Join hundreds of students and companies already using Kaizen Job Portal at August Fest 2025
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-6 justify-center items-center transform transition-all duration-1000 ${
                activeSection === 4 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-80'
              }`}
            >
              <Link
                to="/assessment"
                onClick={() => {
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
                }}
                className="group inline-flex items-center px-8 py-4 bg-white font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                style={{ color: '#1e5631' }}
              >
                <QrCode className="w-5 h-5 mr-3" style={{ color: '#1e5631' }} />
                <span className="text-lg">Start as Student</span>
              </Link>
              <Link
                to="/post-job"
                onClick={() => {
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
                }}
                className="group inline-flex items-center px-8 py-4 border-2 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                style={{
                  borderColor: '#a7f3d0',
                  color: '#a7f3d0',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#a7f3d0'
                  e.currentTarget.style.color = '#1e5631'
                  e.currentTarget.style.borderColor = '#a7f3d0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#a7f3d0'
                  e.currentTarget.style.borderColor = '#a7f3d0'
                }}
              >
                <Briefcase className="w-5 h-5 mr-3" />
                <span className="text-lg">Post as Company</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer Section */}
      <footer className="py-12 px-4 text-white bg-gray-900 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            {/* Logo Section - Left Side */}
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="transform scale-150 md:scale-125 origin-left">
                <Logo />
              </div>
            </div>

            {/* Content Section - Center */}
            <div className="md:w-2/3 text-center md:text-left md:pl-8">
              <p className="text-gray-300 text-lg mb-2">
                Smart matchmaking for August Fest 2025
              </p>
              <p className="text-gray-400 text-sm">
                Built with ❤️ for connecting talent with opportunity
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home