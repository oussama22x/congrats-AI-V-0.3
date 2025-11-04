import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWizardProgress } from "@/hooks/useWizardProgress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LogOut, User, Briefcase, Building2, PencilLine, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
export function Navigation() {
  const {
    currentUser,
    signOut
  } = useCurrentUser();
  const { progress } = useWizardProgress();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  const getNavItems = () => {
    if (!currentUser) return [];
    switch (currentUser.role) {
      case "TALENT":
        return [{
          label: "Dashboard",
          path: "/talent/dashboard",
          icon: User
        }];
      case "RECRUITER":
        return [{
          label: "Cockpit",
          path: "/recruiter",
          icon: Briefcase
        }];
      case "PARTNER_VIEWER":
        return [{
          label: "Shortlists",
          path: "/partner",
          icon: Building2
        }];
      default:
        return [];
    }
  };
  const navItems = getNavItems();
  return <motion.nav initial={{
    opacity: 0,
    y: -8
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.24,
    ease: [0.22, 1, 0.36, 1]
  }} className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="CongratsAI" className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight"><span className="text-primary">CongratsAI</span></span>
        </Link>

        {/* Nav Items & User Menu */}
        {currentUser && <div className="flex items-center gap-4">
            {/* Nav Links */}
            <div className="hidden items-center gap-1 sm:flex">
              {navItems.map(item => {
            const Icon = item.icon;
            return <Link key={item.path} to={item.path}>
                    <Button variant={isActive(item.path) ? "default" : "ghost"} size="sm" className="gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Button>
                  </Link>;
          })}
            </div>

            {/* User Badge with Profile Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative gap-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden sm:inline font-medium">
                      {currentUser.email?.split('@')[0] || 'Account'}
                    </span>
                  </div>
                  {/* Completion Checkmark */}
                  {currentUser.role === "TALENT" && progress === 100 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-600 flex items-center justify-center border-2 border-background">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 bg-popover z-50">
                {/* Header with Email & Progress */}
                <div className="px-3 py-3 border-b">
                  <p className="text-sm font-medium truncate">
                    {currentUser.email}
                  </p>
                  {currentUser.role === "TALENT" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className={cn(
                        "text-xs font-medium",
                        progress === 100 ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {progress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit Profile Action (Talent Only) */}
                {currentUser.role === "TALENT" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/talent/profile" className="cursor-pointer">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {/* Mobile Dashboard Links */}
                <div className="sm:hidden">
                  {navItems.map(item => {
                const Icon = item.icon;
                return <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="cursor-pointer">
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>;
              })}
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>}
      </div>
    </motion.nav>;
}