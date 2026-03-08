import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Menu,
  X,
  User,
  LogOut,
  History,
  LayoutDashboard,
  Settings,
  Heart,
  ChevronDown,
  Siren,
} from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Simplified nav - only core features visible
  const mainNavLinks = [
    { href: "/symptoms", label: "Symptoms" },
    { href: "/upload", label: "Reports" },
    { href: "/chatbot", label: "AI Chat" },
  ];

  // Emergency dropdown items
  const emergencyLinks = [
    { href: "/emergency", label: "Emergency Contacts" },
    { href: "/first-aid", label: "First Aid Guide" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isEmergencyActive = emergencyLinks.some(link => location.pathname === link.href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" style={{ transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold hidden sm:block">
            Medi<span className="text-primary">Brief</span>
          </span>
        </Link>

        {/* Desktop Navigation - Simplified */}
        <nav className="hidden md:flex items-center gap-1">
          {mainNavLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant={isActive(link.href) ? "default" : "ghost"}
                size="sm"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          
          {/* Emergency Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isEmergencyActive ? "default" : "ghost"} 
                size="sm" 
                className="gap-1"
              >
                <Siren className="h-4 w-4" />
                Help
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border">
              {emergencyLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link to={link.href} className="cursor-pointer">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/learn" className="cursor-pointer">
                  Disease Library
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/health-tracking" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="h-4 w-4" />
                    Health Tracking
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/history" className="flex items-center gap-2 cursor-pointer">
                    <History className="h-4 w-4" />
                    My History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-primary text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Simplified */}
      <div className={cn(
        "md:hidden border-t border-border bg-background overflow-hidden transition-all duration-300 ease-out",
        mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 border-t-0"
      )}>
        <nav className="container py-3 flex flex-col gap-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="border-t border-border my-1" />
            {emergencyLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  {link.label}
                </Button>
              </Link>
            ))}
            <Link to="/learn" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Disease Library
              </Button>
            </Link>
            {!user && (
              <>
                <div className="border-t border-border my-1" />
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full gradient-primary text-primary-foreground" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
    </header>
  );
};

export default Header;
