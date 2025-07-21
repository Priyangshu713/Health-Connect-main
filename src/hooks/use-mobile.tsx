
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    handleResize()
    
    // Add event listener for window resize
    window.addEventListener("resize", handleResize)
    
    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return !!isMobile
}

// Additional helper hooks for more granular breakpoints
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  
  return !!isTablet
}

export function useIsLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = React.useState<boolean | undefined>(undefined)
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1280)
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  
  return !!isLargeScreen
}
