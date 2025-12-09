function Logo() {
  return (
    <img
      src="/logo.png"
      alt="Advisor.AI Logo"
      className="advisor-logo"
      onError={(e) => {
        console.error('Logo image failed to load:', e.target.src)
      }}
      onLoad={() => {
        console.log('Logo image loaded successfully')
      }}
    />
  )
}

export default Logo

