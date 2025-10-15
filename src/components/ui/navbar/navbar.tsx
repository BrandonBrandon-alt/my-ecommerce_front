'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X, Home, LayoutDashboard, User, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Define navigation links
const navigationLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show navbar on auth pages
  const hideNavbar = ['/login', '/register'].includes(pathname)
  if (hideNavbar) return null

  // Mock user data - replace with real auth data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://github.com/shadcn.png",
    initials: "JD"
  }

  const handleLogout = () => {
    // Implement logout logic
    router.push('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/home" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              MyApp
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {navigationLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === link.href && "bg-accent"
                      )}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {/* Theme Toggle */}
          <ThemeTogglerButton />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Theme Toggle Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              
              {/* User Info */}
              <div className="flex items-center space-x-4 py-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-2 py-4">
                {navigationLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === link.href && "bg-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Logout Button */}
              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}