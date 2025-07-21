import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Heart, User, Apple, Bot, Menu, X, Info, LogIn, LogOut, History, UserRound, Settings, Sparkles } from 'lucide-react';
import { useHealthStore } from '@/store/healthStore';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { dispatchAuthEvent } from '@/App';
import DoctorMenuNavigation from './DoctorMenuNavigation';
import AccountSettings from '@/components/settings/AccountSettings';
import ChangelogDialog from '@/components/common/ChangelogDialog';
import { getUserProfile } from '@/api/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MobileBottomSheet from './mobile/MobileBottomSheet';

const Navbar = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { healthData, geminiTier } = useHealthStore();
  const isMobile = useIsMobile();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('userEmail') || '';
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showChangelogDialog, setShowChangelogDialog] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const isHomePage = location.pathname === '/';
  const showNavbar = !isHomePage || isScrolled;
  const isProUser = geminiTier === 'pro';

  const [isDoctorUser, setIsDoctorUser] = useState(() => {
    return localStorage.getItem('isDoctorAuthenticated') === 'true';
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const email = localStorage.getItem('userEmail') || '';
        setUserEmail(email);
      } else {
        setUserEmail('');
      }

      const isDoctorAuth = localStorage.getItem('isDoctorAuthenticated') === 'true';
      setIsDoctorUser(isDoctorAuth);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChanged', (event: CustomEvent) => {
      const { isAuthenticated, email } = event.detail;
      setIsAuthenticated(isAuthenticated);
      setUserEmail(email || '');
    });

    window.addEventListener('doctorAuthChanged', () => {
      const isDoctorAuth = localStorage.getItem('isDoctorAuthenticated') === 'true';
      setIsDoctorUser(isDoctorAuth);
    });

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', (event: CustomEvent) => {
        const { isAuthenticated, email } = event.detail;
        setIsAuthenticated(isAuthenticated);
        setUserEmail(email || '');
      });
      window.removeEventListener('doctorAuthChanged', () => {
        const isDoctorAuth = localStorage.getItem('isDoctorAuthenticated') === 'true';
        setIsDoctorUser(isDoctorAuth);
      });
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMenuOpen) return;

      const target = e.target as HTMLElement;
      const menuTrigger = document.querySelector('[data-mobile-menu="trigger"]');
      const menuContent = document.querySelector('[data-mobile-menu="content"]');

      if (
        !menuTrigger?.contains(target) &&
        !menuContent?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMobileNavigation = (path: string) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 10);
  };

  const handleItemClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();

    setActiveItem(path);

    setTimeout(() => {
      navigate(path);
      setIsMenuOpen(false);
    }, 150);
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    localStorage.removeItem('geminiTier');

    dispatchAuthEvent(false);

    setIsAuthenticated(false);
    setUserEmail('');
    setUserProfileImage(null);

    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });

    navigate('/');
  };

  const getUserInitials = () => {
    // Get the stored userName from localStorage
    const storedName = localStorage.getItem('userName');

    if (storedName) {
      // Split the name by spaces and get initials from each part
      const nameParts = storedName.split(' ');
      if (nameParts.length > 1) {
        // If there are multiple parts (first and last name), use first letter of first and last name
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
      }
      // If there's only one part, use the first letter
      return storedName.charAt(0).toUpperCase();
    }

    // Fallback to email-based initial if userName is not available
    if (!userEmail) return 'U';

    const namePart = userEmail.split('@')[0];
    const cleanName = namePart.replace(/[0-9]/g, '');
    return cleanName.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    // Get the stored userName from localStorage, which comes from the registration process
    const storedName = localStorage.getItem('userName');

    // If the stored name exists, use it
    if (storedName) {
      return storedName;
    }

    // Fallback to email-based name extraction if userName is not available
    if (!userEmail) return 'User';

    const namePart = userEmail.split('@')[0];
    const cleanName = namePart.replace(/[0-9]/g, '');
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Heart className="mr-2 h-4 w-4" /> },
    { path: '/profile', label: 'Profile', icon: <User className="mr-2 h-4 w-4" /> },
    { path: '/health-report', label: 'Health Report', icon: <Heart className="mr-2 h-4 w-4" /> },
    { path: '/nutrition', label: 'Nutrition', icon: <Apple className="mr-2 h-4 w-4" /> },
    ...(isDoctorUser ? [] : [{ path: '/doctor-finder', label: 'Specialists', icon: <UserRound className="mr-2 h-4 w-4" />, proOnly: true }]),
    { path: '/ai-bot', label: 'AI Bot', icon: <Bot className="mr-2 h-4 w-4" /> },
    { path: '/about', label: 'About Us', icon: <Info className="mr-2 h-4 w-4" /> },
    //  Temporarily disabled Doctor Portal
    ...(isDoctorUser ? [{ path: '/doctor-portal', label: 'Doctor Portal', icon: <UserRound className="mr-2 h-4 w-4" /> }] : []),
    
  ];

  // Load user profile data including profile image
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated || !localStorage.getItem('token')) return;

      setLoadingProfile(true);
      try {
        const data = await getUserProfile();
        if (data.profileImage) {
          setUserProfileImage(data.profileImage);
        }
      } catch (error) {
        console.error('Error fetching user profile image:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      const fetchProfileImage = async () => {
        if (!isAuthenticated) return;

        try {
          const data = await getUserProfile();
          if (data.profileImage) {
            setUserProfileImage(data.profileImage);
          } else {
            setUserProfileImage(null);
          }
        } catch (error) {
          console.error('Error fetching user profile image on update:', error);
        }
      };

      fetchProfileImage();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [isAuthenticated]);

  // Fix profile image not being cleared properly
  useEffect(() => {
    // Function to reload profile data
    const loadProfileData = async () => {
      try {
        // First clear the profile image to force UI refresh
        setUserProfileImage(null);

        // Then fetch the latest profile data
        const user = await getUserProfile();

        if (user.profileImage) {
          setUserProfileImage(user.profileImage);
        } else {
          // Explicitly set to null and ensure UI updates
          setUserProfileImage(null);
          // Force a re-render by updating state
          setTimeout(() => {
            setIsAuthenticated(prev => {
              // This trick forces a re-render without changing the value
              localStorage.setItem('isAuthenticated', 'true');
              return prev;
            });
          }, 50);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        // Clear image on error to be safe
        setUserProfileImage(null);
      }
    };

    // Initial load
    if (isAuthenticated) {
      loadProfileData();
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      console.log('Profile updated event received');
      // Force clear image first
      setUserProfileImage(null);
      // Then reload
      loadProfileData();
    };

    // Listen for force reloads
    const handleForceReload = () => {
      console.log('Force profile reload event received');
      // Clear all cached data
      setUserProfileImage(null);

      // Force redraw of avatar component
      const avatarElements = document.querySelectorAll('.avatar-image');
      avatarElements.forEach(el => {
        if (el instanceof HTMLImageElement) {
          // Clear any src to force reload
          el.src = '';
          el.style.display = 'none';
          setTimeout(() => {
            el.style.display = '';
          }, 50);
        }
      });

      // Then reload from server
      setTimeout(loadProfileData, 100);
    };

    // Add event listeners
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('forceProfileReload', handleForceReload);

    // Clean up event listeners
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('forceProfileReload', handleForceReload);
    };
  }, [isAuthenticated]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out mobile-safe-bottom',
        isScrolled
          ? 'py-2 bg-black/70 backdrop-blur-md shadow-md text-white'
          : 'py-3 sm:py-4 bg-white/90 backdrop-blur-md shadow-sm text-foreground border-b',
        isHomePage && !isScrolled && 'bg-transparent border-0 shadow-none'
      )}
      style={{
        opacity: showNavbar ? 1 : 0,
        pointerEvents: showNavbar ? 'auto' : 'none',
        transform: `translateY(${showNavbar ? '0' : '-100%'})`,
        paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : '',
      }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center"
        >
          <span className="text-gradient font-bold text-lg sm:text-xl md:text-2xl tracking-tight animate-fade-in">
            <Heart className="inline-block mr-1 sm:mr-2 h-4 w-4 text-primary animate-pulse-slow" />
            Health<span className="font-extralight">Connect</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => {
            if (item.proOnly && !isProUser) {
              return null;
            }

            if (item.path === '/health-report' && !healthData.completedProfile) {
              return null;
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-full transition-all duration-300 ease-in-out flex items-center text-sm font-medium',
                  location.pathname === item.path
                    ? 'text-primary bg-primary/10 backdrop-blur-sm'
                    : 'hover:text-primary hover:bg-black/10'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          <DoctorMenuNavigation />

          {!isAuthenticated && !isDoctorUser ? (
            <Button
              variant="outline"
              size="sm"
              className="ml-2 border-primary text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => navigate('/profile')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          ) : (
            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10 transition-all duration-200"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8 bg-primary text-white">
                      {userProfileImage ? (
                        <AvatarImage
                          src={userProfileImage}
                          alt="Profile"
                          className="avatar-image"
                          key={`avatar-${Date.now()}`}
                        />
                      ) : (
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <div className="flex flex-col px-4 py-3">
                    <p className="text-sm font-medium">{getUserName()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{userEmail}</p>
                    {isDoctorUser && (
                      <span className="mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full w-fit">
                        Doctor Account
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => isDoctorUser ? navigate('/doctor-portal') : setShowAccountSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{isDoctorUser ? 'Doctor Portal' : 'Account Settings'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/history')}>
                    <History className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setShowChangelogDialog(true)}>
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    <span>What's New</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-black/10 mobile-touch-target p-2 rounded-full transition-all duration-300"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          data-mobile-menu="trigger"
        >
          <div className="relative w-5 h-5">
            <span
              className={cn(
                "absolute left-0 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out",
                isMenuOpen
                  ? "w-5 top-2 rotate-45"
                  : "w-5 top-0.5"
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out",
                isMenuOpen
                  ? "w-0 opacity-0"
                  : "w-4 opacity-100 top-2"
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out",
                isMenuOpen
                  ? "w-5 top-2 -rotate-45"
                  : "w-3 top-3.5"
              )}
            />
          </div>
        </Button>
      </div>

      {isMobile && (
        <MobileBottomSheet
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          title="Menu"
          showHandle={true}
        >
          <div className="container mx-auto py-4 px-4 flex flex-col space-y-2 momentum-scroll scrollbar-hide"
            style={{ maxHeight: "calc(90vh - 56px)" }}>

            {(isAuthenticated || isDoctorUser) && (
              <>
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2">
                  <Avatar className="h-10 w-10 bg-primary text-white">
                    {userProfileImage ? (
                      <AvatarImage
                        src={userProfileImage}
                        alt="Profile"
                        className="avatar-image"
                        key={`avatar-${Date.now()}`}
                      />
                    ) : (
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{getUserName()}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                    {isDoctorUser && (
                      <span className="mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full w-fit">
                        Doctor Account
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
              </>
            )}

            {navItems.map((item) => {
              if (item.proOnly && !isProUser) {
                return null;
              }

              if (item.path === '/health-report' && !healthData.completedProfile) {
                return null;
              }

              const isActive = location.pathname === item.path;
              const isAnimating = activeItem === item.path;

              return (
                <div
                  key={item.path}
                  onClick={() => handleMobileNavigation(item.path)}
                  className={cn(
                    'px-4 py-3 rounded-xl transition-all duration-300 ease-in-out flex items-center mobile-touch-target cursor-pointer',
                    isActive
                      ? 'text-primary bg-primary/10 font-medium'
                      : 'text-foreground hover:text-primary hover:bg-black/5',
                    isAnimating && 'animate-tap-effect'
                  )}
                >
                  <span className={cn(
                    'flex items-center',
                    isAnimating && 'animate-scale-in'
                  )}>
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </span>
                </div>
              );
            })}

            {(isAuthenticated || isDoctorUser) && (
              <div
                onClick={() => handleMobileNavigation('/history')}
                className="px-4 py-3 rounded-xl transition-all duration-300 ease-in-out flex items-center mobile-touch-target cursor-pointer text-foreground hover:text-primary hover:bg-black/5"
              >
                <History className="mr-2 h-4 w-4" />
                <span>History</span>
              </div>
            )}

            {!isAuthenticated && !isDoctorUser ? (
              <div
                onClick={() => handleMobileNavigation('/profile')}
                className="mt-2 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium flex items-center mobile-touch-target cursor-pointer"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="mt-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center justify-start w-full mobile-touch-target"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            )}

            {isAuthenticated && !isDoctorUser && (
              <div
                onClick={() => setShowAccountSettings(true)}
                className="px-4 py-3 rounded-xl flex items-center space-x-3 hover:bg-accent mobile-touch-target cursor-pointer"
              >
                <Settings className="h-5 w-5 text-primary" />
                <span>Account Settings</span>
              </div>
            )}
          </div>
        </MobileBottomSheet>
      )}

      <>
        {/* Backdrop overlay */}
        <div
          className={cn(
            "md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-all duration-300 ease-in-out",
            isMenuOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          )}
          onClick={() => setIsMenuOpen(false)}
          style={{
            top: `calc(56px + env(safe-area-inset-top, 0px))`
          }}
        />

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden fixed inset-x-0 top-[var(--nav-height,56px)] bg-white dark:bg-gray-900 shadow-lg z-40 transition-all duration-500 ease-in-out",
            isMenuOpen
              ? "translate-y-0 opacity-100 visible"
              : "translate-y-[-20px] opacity-0 invisible"
          )}
          style={{
            "--nav-height": `calc(56px + env(safe-area-inset-top, 0px))`,
            top: `calc(56px + env(safe-area-inset-top, 0px))`,
            maxHeight: isMenuOpen ? "80vh" : "0",
            overflow: "hidden",
          } as React.CSSProperties}
          data-mobile-menu="content"
        >
          <div className={cn(
            "container mx-auto px-4 flex flex-col space-y-2 transition-all duration-500 ease-in-out",
            isMenuOpen ? "py-4 opacity-100" : "py-0 opacity-0"
          )}
            style={{
              maxHeight: isMenuOpen ? "calc(90vh - 56px)" : "0",
              overflow: "auto"
            }}>
            {(isAuthenticated || isDoctorUser) && (
              <>
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2">
                  <Avatar className="h-10 w-10 bg-primary text-white">
                    {userProfileImage ? (
                      <AvatarImage
                        src={userProfileImage}
                        alt="Profile"
                        className="avatar-image"
                        key={`avatar-${Date.now()}`}
                      />
                    ) : (
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{getUserName()}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                    {isDoctorUser && (
                      <span className="mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full w-fit">
                        Doctor Account
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
              </>
            )}

            {navItems.map((item) => {
              if (item.proOnly && !isProUser) {
                return null;
              }

              if (item.path === '/health-report' && !healthData.completedProfile) {
                return null;
              }

              const isActive = location.pathname === item.path;
              const isAnimating = activeItem === item.path;

              return (
                <div
                  key={item.path}
                  onClick={() => handleMobileNavigation(item.path)}
                  className={cn(
                    'px-4 py-3 rounded-xl transition-all duration-300 ease-in-out flex items-center mobile-touch-target cursor-pointer',
                    isActive
                      ? 'text-primary bg-primary/10 font-medium'
                      : 'text-foreground hover:text-primary hover:bg-black/5',
                    isAnimating && 'animate-tap-effect'
                  )}
                >
                  <span className={cn(
                    'flex items-center',
                    isAnimating && 'animate-scale-in'
                  )}>
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </span>
                </div>
              );
            })}

            {(isAuthenticated || isDoctorUser) && (
              <div
                onClick={() => handleMobileNavigation('/history')}
                className="px-4 py-3 rounded-xl transition-all duration-300 ease-in-out flex items-center mobile-touch-target cursor-pointer text-foreground hover:text-primary hover:bg-black/5"
              >
                <History className="mr-2 h-4 w-4" />
                <span>History</span>
              </div>
            )}

            {!isAuthenticated && !isDoctorUser ? (
              <div
                onClick={() => handleMobileNavigation('/profile')}
                className="mt-2 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium flex items-center mobile-touch-target cursor-pointer"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="mt-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center justify-start w-full mobile-touch-target"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            )}

            {isAuthenticated && !isDoctorUser && (
              <div
                onClick={() => setShowAccountSettings(true)}
                className="px-4 py-3 rounded-xl flex items-center space-x-3 hover:bg-accent mobile-touch-target cursor-pointer"
              >
                <Settings className="h-5 w-5 text-primary" />
                <span>Account Settings</span>
              </div>
            )}
          </div>
        </div>
      </>

      {showAccountSettings && (
        <AccountSettings
          isOpen={showAccountSettings}
          onClose={() => setShowAccountSettings(false)}
        />
      )}

      {showChangelogDialog && (
        <ChangelogDialog
          isOpen={showChangelogDialog}
          onClose={() => setShowChangelogDialog(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
