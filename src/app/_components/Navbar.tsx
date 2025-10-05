// src/components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Menu, X, LogOut, Home, Link2 as LinkIcon, Users, Globe, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 w-full text-white shadow-lg transition-all duration-300 z-50 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-white/10' 
          : 'bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold tracking-tight hover:text-purple-300 transition-all duration-300 flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <LinkIcon className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                Save URL
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-medium hover:bg-white/10 hover:scale-105 transform transition-all duration-300 rounded-lg flex items-center gap-2 ${
                isActive('/') ? 'bg-white/10 text-purple-300' : ''
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Link
            </Link>

            <Link
              href="/public"
              className={`px-4 py-2 text-sm font-medium hover:bg-white/10 hover:scale-105 transform transition-all duration-300 rounded-lg flex items-center gap-2 ${
                isActive('/public') ? 'bg-white/10 text-blue-300' : ''
              }`}
            >
              <Globe className="w-4 h-4" />
              Public
            </Link>

            {status === 'authenticated' ? (
              <>
                <Link
                  href="/links"
                  className={`px-4 py-2 text-sm font-medium hover:bg-white/10 hover:scale-105 transform transition-all duration-300 rounded-lg flex items-center gap-2 ${
                    isActive('/links') ? 'bg-white/10 text-purple-300' : ''
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  My Links
                </Link>

                <Link
                  href="/groups"
                  className={`px-4 py-2 text-sm font-medium hover:bg-white/10 hover:scale-105 transform transition-all duration-300 rounded-lg flex items-center gap-2 ${
                    isActive('/groups') ? 'bg-white/10 text-pink-300' : ''
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Groups
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 text-sm font-medium hover:bg-red-500/20 hover:scale-105 transform transition-all duration-300 rounded-lg flex items-center gap-2 text-red-300 hover:text-red-200 ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium hover:bg-white/10 hover:scale-105 transform transition-all duration-300 rounded-lg ml-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 transform transition-all duration-300 rounded-lg shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden animate-slideDown">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900/50 backdrop-blur-xl rounded-lg mb-4 border border-white/10">
              <Link
                href="/"
                className={`block px-3 py-2 text-base font-medium hover:bg-white/10 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                  isActive('/') ? 'bg-white/10 text-purple-300' : ''
                }`}
                onClick={toggleMenu}
              >
                <Plus className="w-4 h-4" />
                Add Link
              </Link>

              <Link
                href="/public"
                className={`block px-3 py-2 text-base font-medium hover:bg-white/10 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                  isActive('/public') ? 'bg-white/10 text-blue-300' : ''
                }`}
                onClick={toggleMenu}
              >
                <Globe className="w-4 h-4" />
                Public Links
              </Link>

              {status === 'authenticated' ? (
                <>
                  <Link
                    href="/links"
                    className={`block px-3 py-2 text-base font-medium hover:bg-white/10 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                      isActive('/links') ? 'bg-white/10 text-purple-300' : ''
                    }`}
                    onClick={toggleMenu}
                  >
                    <LinkIcon className="w-4 h-4" />
                    My Links
                  </Link>

                  <Link
                    href="/groups"
                    className={`block px-3 py-2 text-base font-medium hover:bg-white/10 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                      isActive('/groups') ? 'bg-white/10 text-pink-300' : ''
                    }`}
                    onClick={toggleMenu}
                  >
                    <Users className="w-4 h-4" />
                    My Groups
                  </Link>

                  <div className="border-t border-white/10 my-2"></div>

                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      toggleMenu();
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-red-500/20 rounded-lg transition-colors duration-300 flex items-center gap-2 text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  
                  <Link
                    href="/signin"
                    className="block px-3 py-2 text-base font-medium hover:bg-white/10 rounded-lg transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}