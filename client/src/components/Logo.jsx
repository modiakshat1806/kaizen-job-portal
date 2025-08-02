import logoImage from '../assets/logo1.png' // Change if needed

const Logo = () => {
  return (
    // This container sets the size of the logo.
    // We've simplified this component to remove the extra text and size options
    // for a cleaner look, just like in your example image.
    // EDITED: Increased width from w-28 to w-36 to make the logo bigger.
    <div className="w-36 h-auto">
      <img
        src={logoImage}
        alt="Kaizen Job Portal Logo"
        className="w-full h-full object-contain"
      />
    </div>
  )
}

export default Logo
