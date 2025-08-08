import { useState, useEffect } from 'react'

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [networkInfo, setNetworkInfo] = useState(null)
  const [orientation, setOrientation] = useState('portrait')

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent
      const platform = navigator.platform
      const maxTouchPoints = navigator.maxTouchPoints || 0

      // Detect mobile devices
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      const isMobileDevice = mobileRegex.test(userAgent) || maxTouchPoints > 0

      // Detect tablets
      const isTabletDevice = (
        (/iPad/.test(userAgent)) ||
        (navigator.platform === 'MacIntel' && maxTouchPoints > 1) ||
        (/Android/.test(userAgent) && !/Mobile/.test(userAgent))
      )

      // Detect specific platforms
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || 
        (navigator.platform === 'MacIntel' && maxTouchPoints > 1)
      const isAndroidDevice = /Android/.test(userAgent)

      // Get device info
      const info = {
        userAgent,
        platform,
        maxTouchPoints,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        pixelRatio: window.devicePixelRatio || 1,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }

      // Get network info if available
      const network = navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : null

      setIsMobile(isMobileDevice)
      setIsTablet(isTabletDevice)
      setIsIOS(isIOSDevice)
      setIsAndroid(isAndroidDevice)
      setDeviceInfo(info)
      setNetworkInfo(network)
    }

    const detectOrientation = () => {
      if (window.screen && window.screen.orientation) {
        setOrientation(window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape')
      } else {
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      }
    }

    // Initial detection
    detectDevice()
    detectOrientation()

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(detectOrientation, 100) // Small delay to ensure dimensions are updated
    }

    const handleResize = () => {
      detectDevice()
      detectOrientation()
    }

    const handleOnlineStatusChange = () => {
      detectDevice()
    }

    // Event listeners
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleResize)
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    // Network change listener
    if (navigator.connection) {
      navigator.connection.addEventListener('change', detectDevice)
    }

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
      
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', detectDevice)
      }
    }
  }, [])

  // Utility functions
  const isSmallScreen = () => {
    return window.innerWidth < 640 // Tailwind's sm breakpoint
  }

  const isMediumScreen = () => {
    return window.innerWidth >= 640 && window.innerWidth < 1024 // Between sm and lg
  }

  const isLargeScreen = () => {
    return window.innerWidth >= 1024 // Tailwind's lg breakpoint and above
  }

  const getTouchTargetSize = () => {
    // iOS requires minimum 44px touch targets
    return isIOS ? 44 : 40
  }

  const getOptimalFontSize = () => {
    // iOS Safari auto-zooms on inputs with font-size < 16px
    return isIOS ? 16 : 14
  }

  const supportsHover = () => {
    return window.matchMedia('(hover: hover)').matches
  }

  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const isSlowConnection = () => {
    if (!networkInfo) return false
    return networkInfo.effectiveType === 'slow-2g' || 
           networkInfo.effectiveType === '2g' ||
           (networkInfo.downlink && networkInfo.downlink < 1)
  }

  const getConnectionQuality = () => {
    if (!networkInfo) return 'unknown'
    
    const { effectiveType, downlink } = networkInfo
    
    if (effectiveType === '4g' && downlink > 10) return 'excellent'
    if (effectiveType === '4g' || (downlink && downlink > 5)) return 'good'
    if (effectiveType === '3g' || (downlink && downlink > 1)) return 'fair'
    return 'poor'
  }

  return {
    // Device detection
    isMobile,
    isTablet,
    isIOS,
    isAndroid,
    deviceInfo,
    networkInfo,
    orientation,
    
    // Screen utilities
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // Mobile-specific utilities
    getTouchTargetSize,
    getOptimalFontSize,
    supportsHover,
    prefersReducedMotion,
    
    // Network utilities
    isSlowConnection,
    getConnectionQuality,
    
    // Computed properties
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isOnline: deviceInfo?.onLine ?? true,
    hasTouch: (deviceInfo?.maxTouchPoints ?? 0) > 0
  }
}

export default useMobile
