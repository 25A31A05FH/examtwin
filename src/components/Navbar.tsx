
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  LogOut,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { NavigationPage } from './Sidebar';
import { OfficerUser } from './OfficerLoginPage';
import { PragatiLogo } from './PragatiLogo';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isOfficerLoggedIn: boolean;
  officerUser: OfficerUser | null;
  onOfficerLogout: () => void;
  isPlanGenerated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  isOfficerLoggedIn,
  officerUser,
  onOfficerLogout,
  isPlanGenerated
}) => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const allNavItems = [
    {
      id: 'pathway' as NavigationPage,
      label: 'How System Works',
      requiresAuth: false,
      requiresPlan: false
    },
    {
      id: 'register' as NavigationPage,
      label: 'Officer Registration',
      requiresAuth: false,
      requiresPlan: false
    },
    {
      id: 'login' as NavigationPage,
      label: 'Officer Sign In',
      requiresAuth: false,
      requiresPlan: false
    },
    {
      id: 'generator' as NavigationPage,
      label: 'Exam Setup & Generator',
      requiresAuth: true,
      requiresPlan: false
    },
    {
      id: 'allotment' as NavigationPage,
      label: 'Seating Allotment',
      requiresAuth: true,
      requiresPlan: true
    },
    {
      id: 'documents' as NavigationPage,
      label: 'Document Printing & Exports',
      requiresAuth: true,
      requiresPlan: true
    }
  ];

  const visibleNavItems = allNavItems.filter(item => {
    if (isOfficerLoggedIn && (item.id === 'register' || item.id === 'login')) {
      return false;
    }
    return true;
  });

  const handleNavClick = (pageId: NavigationPage) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  const renderOfficerStatus = () => (
    <div className="flex items-center gap-3 bg-white border-2 border-[#D88C72]/60 px-3 py-2 rounded-xl shadow-xs">
      <ShieldCheck className="w-4 h-4 text-[#A44A3F] shrink-0" />

      <div className="text-left text-xs min-w-0">
        <span className="font-black text-[#6B2F2F] block leading-none truncate max-w-[140px]">
          {officerUser?.name}
        </span>

        <span className="text-[10px] text-[#A44A3F] font-semibold">
          Verified Officer
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          onOfficerLogout();
          setIsMobileMenuOpen(false);
        }}
        className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#6B2F2F] font-bold transition-colors cursor-pointer ml-2 border-l border-stone-200 pl-2"
        title="Sign out of Officer session"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-[#FAF4F0]/95 backdrop-blur-md border-b-2 border-[#D88C72]/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ROW 1: College Brand and Account Controls */}
        <div className="flex items-center justify-between py-3.5 border-b border-[#D88C72]/30 gap-2">

          {/* College Brand */}
          <div
            onClick={() => handleNavClick('pathway')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <PragatiLogo
              size="md"
              className="group-hover:scale-105 transition-transform ring-2 ring-[#D88C72]/50 shadow-sm shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#6B2F2F] bg-[#F4D6C6] px-2 py-0.5 rounded-full border border-[#D88C72]/60">
                  Autonomous
                </span>

                <span className="text-[10px] font-bold text-stone-500 hidden sm:inline">
                  NAAC &apos;A&apos; Grade • JNTUK
                </span>
              </div>

              <span className="text-sm sm:text-lg font-black text-[#6B2F2F] tracking-tight leading-tight block uppercase">
                Pragati Engineering College
              </span>

              <span className="text-[10px] sm:text-[11px] text-[#A44A3F] font-bold block -mt-0.5">
                ExamSeat Pro
                <span className="text-stone-500 font-medium hidden md:inline">
                  {' '}• Automatic Seating Arrangement
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Account Controls */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isOfficerLoggedIn && officerUser ? (
              renderOfficerStatus()
            ) : (
              <div className="flex items-center gap-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleNavClick('login')}
                  className={`cursor-pointer transition-colors ${
                    currentPage === 'login'
                      ? 'text-[#6B2F2F] font-black'
                      : 'text-stone-600 hover:text-[#6B2F2F]'
                  }`}
                >
                  Sign In
                </button>

                <span className="text-stone-300">|</span>

                <button
                  type="button"
                  onClick={() => handleNavClick('register')}
                  className={`cursor-pointer transition-colors ${
                    currentPage === 'register'
                      ? 'text-[#6B2F2F] font-black'
                      : 'text-stone-600 hover:text-[#6B2F2F]'
                  }`}
                >
                  Registration
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden shrink-0 p-2 rounded-lg border border-[#D88C72]/50 bg-white text-[#6B2F2F] hover:bg-[#F4D6C6] transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

        </div>

        {/* DESKTOP NAVIGATION - CENTER ALIGNED */}
        <nav className="hidden md:flex w-full items-center justify-center flex-wrap gap-x-4 lg:gap-x-7 gap-y-2 py-2.5 text-xs">
          {visibleNavItems.map(item => {
            const isActive = currentPage === item.id;

            const isLocked =
              (item.requiresAuth && !isOfficerLoggedIn) ||
              (item.requiresPlan && !isPlanGenerated);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'text-[#6B2F2F] font-black'
                    : 'text-stone-600 hover:text-[#6B2F2F] font-bold'
                }`}
              >
                <span>{item.label}</span>

                {isLocked && (
                  <Lock className="w-3 h-3 text-stone-400" />
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="absolute -bottom-2.5 left-0 right-0 h-[2.5px] bg-[#6B2F2F] rounded-full shadow-[0_0_8px_rgba(107,47,47,0.4)]"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#D88C72]/30 py-3 space-y-2">

            {isOfficerLoggedIn && officerUser && (
              <div className="pb-2">
                {renderOfficerStatus()}
              </div>
            )}

            {visibleNavItems.map(item => {
              const isActive = currentPage === item.id;

              const isLocked =
                (item.requiresAuth && !isOfficerLoggedIn) ||
                (item.requiresPlan && !isPlanGenerated);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-[#F4D6C6] text-[#6B2F2F] font-black border-l-4 border-[#6B2F2F]'
                      : 'text-stone-600 font-bold hover:bg-[#F4D6C6]/60'
                  }`}
                >
                  <span>{item.label}</span>

                  {isLocked && (
                    <Lock className="w-4 h-4 text-stone-400" />
                  )}
                </button>
              );
            })}

          </div>
        )}

      </div>
    </header>
  );
};
