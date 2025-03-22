import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function VolunteerNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: "/volunteer", label: "Home" },
    { path: "/volunteer/search", label: "Search NGOs" },
    { path: "/volunteer/applications", label: "My Applications" },
    { path: "/volunteer/profile", label: "My Profile" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary text-xl font-bold cursor-pointer">VolunteerConnect</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`${
                      location === link.path
                        ? "border-primary text-neutral-700"
                        : "border-transparent text-neutral-500 hover:border-primary hover:text-neutral-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <Button 
                onClick={handleLogout}
                variant="ghost"
                className="text-neutral-700 hover:text-neutral-900"
              >
                Log out
              </Button>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-neutral-700 hover:text-neutral-900">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="ml-3 bg-primary hover:bg-primary-dark text-white">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } sm:hidden bg-white border-t border-neutral-200`}
      >
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <a
                onClick={closeMobileMenu}
                className={`${
                  location === link.path
                    ? "bg-primary-light border-primary text-primary"
                    : "border-transparent text-neutral-600 hover:bg-neutral-100 hover:border-primary-light hover:text-neutral-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {link.label}
              </a>
            </Link>
          ))}
          <div className="flex items-center justify-between mt-4 px-3">
            {user ? (
              <Button 
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="w-full"
                variant="outline"
              >
                Log out
              </Button>
            ) : (
              <>
                <Link href="/auth">
                  <Button onClick={closeMobileMenu} variant="outline" className="w-1/2 mr-2">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button onClick={closeMobileMenu} className="w-1/2 bg-primary hover:bg-primary-dark">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
