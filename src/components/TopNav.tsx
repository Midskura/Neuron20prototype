import { useState } from "react";
import { Truck, Wallet, Settings, Menu, ChevronDown, User, LogOut, Shield, Users, BarChart3, UserCog } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import logoImage from "figma:asset/28c84ed117b026fbf800de0882eb478561f37f4f.png";

type Page = "bookings" | "booking-detail" | "clients" | "accounting" | "reports" | "hr" | "admin";
export type UserRole = "Operations" | "Accounting" | "HR" | "Admin";

interface TopNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  currentUser?: { name: string; role: string };
  userRole?: UserRole;
  onLogout: () => void;
}

export function TopNav({ currentPage, onNavigate, currentUser, userRole = "Admin", onLogout }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define all nav items
  const allNavItems = [
    { id: "bookings" as Page, label: "Bookings", icon: Truck, roles: ["Operations", "Admin"] },
    { id: "clients" as Page, label: "Clients", icon: Users, roles: ["Operations", "Admin"] },
    { id: "accounting" as Page, label: "Accounting", icon: Wallet, roles: ["Accounting", "Admin"] },
    { id: "reports" as Page, label: "Reports", icon: BarChart3, roles: ["Accounting", "Admin"] },
    { id: "hr" as Page, label: "HR", icon: UserCog, roles: ["HR", "Admin"] },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 h-16 bg-[#0A1D4D] border-b border-white/10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section: Brand */}
        <div className="flex items-center gap-2 pl-[18px]">
          {/* Mobile Hamburger - visible only on mobile */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/5 p-2 mr-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="bg-[#0A1D4D] border-white/10 pt-20">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Access navigation options</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-[#F25C05] text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[15px]">{item.label}</span>
                    </button>
                  );
                })}
                
                {currentUser && (
                  <>
                    <div className="h-px bg-white/10 my-2" />
                    
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-full transition-all duration-200 text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-[15px]">Logout</span>
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Neuron Logo */}
          <img
            src={logoImage}
            alt="Neuron"
            style={{
              height: "24px",
              width: "auto",
            }}
          />
        </div>

        {/* Center Section: Primary Nav (Desktop only) */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#F25C05] text-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[15px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section: Account Dropdown */}
        {currentUser && (
          <div className="pr-[18px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 text-white hover:bg-white/5 h-10 px-3 rounded-xl transition-all duration-200 group"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-[#F25C05] text-white text-xs">
                      {currentUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-[14px] text-white/80 group-hover:text-white transition-colors">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="hidden md:block w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-white border-[#E5E7EB] min-w-[220px] rounded-lg shadow-lg"
                sideOffset={8}
              >
                <div className="px-3 py-2 border-b border-[#E5E7EB]">
                  <p className="text-[14px] text-[#1F2937]">{currentUser.name}</p>
                  <p className="text-xs text-[#6B7280]">{currentUser.role}</p>
                </div>
                
                <DropdownMenuItem 
                  className="cursor-pointer h-10 px-3 hover:bg-[#F8F9FB] rounded transition-colors my-1"
                  onClick={() => {
                    // Placeholder for Profile action
                  }}
                >
                  <User className="w-4 h-4 mr-3 text-[#6B7280]" />
                  <span className="text-[14px] text-[#1F2937]">Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="cursor-pointer h-10 px-3 hover:bg-[#F8F9FB] rounded transition-colors my-1"
                  onClick={() => {
                    // Placeholder for Settings action
                  }}
                >
                  <Settings className="w-4 h-4 mr-3 text-[#6B7280]" />
                  <span className="text-[14px] text-[#1F2937]">Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1 bg-[#E5E7EB]" />
                
                <DropdownMenuItem 
                  className="cursor-pointer h-10 px-3 hover:bg-[#FFF6F2] rounded transition-colors my-1"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4 mr-3 text-[#F25C05]" />
                  <span className="text-[14px] text-[#F25C05]">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}
