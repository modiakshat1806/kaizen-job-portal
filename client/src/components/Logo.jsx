import logoImage from '../assests/logo1.jpg'

const Logo = ({ size = 'default', showText = true }) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    default: 'w-28 h-28',
    large: 'w-40 h-40'
  }

  const textSizes = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  }

  return (
    <div className="flex items-center">
      {/* Logo Image with Jobs Text */}
      <div className={`${sizeClasses[size]} relative`}>
        <img 
          src={logoImage} 
          alt="THE PROJECT Kaizen" 
          className="w-full h-full object-cover"
        />
        {showText && (
          <div className="absolute bottom-0 right-0 bg-primary-500 text-white px-1 py-0.5 rounded-tl text-xs font-semibold shadow-sm">
            Jobs
          </div>
        )}
      </div>
    </div>
  )
}

export default Logo 