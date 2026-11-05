/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { NavigationPage } from './Sidebar';
import { OfficerUser } from './OfficerLoginPage';
import { PragatiLogo } from './PragatiLogo';

interface TopHeaderProps {
  currentPage: NavigationPage;
  onOpenMobileMenu: () => void;
  isOfficerLoggedIn: boolean;
  officerUser: OfficerUser | null;
  onNavigate: (page: NavigationPage) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentPage,
  onOpenMobileMenu,
  isOfficerLoggedIn,
  officerUser,
  onNavigate
}) => {
  const getPageTitle = (page: NavigationPage) => {
    switch (page) {
      case 'pathway':
        return 'System Pathway & How It Works';
      case 'register':
        return 'Officer Registration';
      case 'login':
        return 'Officer Sign In';
      case 'generator':
        return 'Exam Setup & Seating Generator';
      case 'allotment':
        return 'Seating Allotment & Visual Bench Grids';
      case 'documents':
        return 'Document Printing & Official Exports';
      default:
        return 'ExamSeat Pro';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#FAF4F0]/95 backdrop-blur-md border-b-2 border-[#D88C72]/40 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        
        {/* Mobile Left: Menu Toggle + College Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#D88C72]/60 text-[#6B2F2F] hover:bg-[#F4D6C6] cursor-pointer shadow-2xs"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Pragati Crest */}
          <div
            onClick={() => onNavigate('pathway')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <PragatiLogo size="sm" className="lg:hidden" />
            <div>
              <span className="text-xs sm:text-sm font-black text-[#6B2F2F] tracking-tight block uppercase">
                {getPageTitle(currentPage)}
              </span>
              <span className="text-[10px] font-bold text-[#A44A3F] hidden sm:block">
                Pragati Engineering College (Autonomous)
              </span>
            </div>
          </div>
        </div>

        {/* Right Status / Quick Actions */}
        <div className="flex items-center gap-2">
          {isOfficerLoggedIn && officerUser ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#D88C72] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#A44A3F] animate-pulse" />
              <div className="text-right">
                <span className="text-[11px] font-black text-[#6B2F2F] block leading-none truncate max-w-[120px] sm:max-w-none">
                  {officerUser.name}
                </span>
                <span className="text-[9px] font-bold text-[#A44A3F] block leading-tight">
                  Officer Verified
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4D6C6] text-[#6B2F2F] text-xs font-bold border border-[#D88C72]/60 shadow-2xs cursor-pointer transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="px-3 py-1.5 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors hidden sm:block"
              >
                Register
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
