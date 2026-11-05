/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitCommit,
  UserPlus,
  LogIn,
  Sliders,
  Armchair,
  Printer,
  ShieldCheck,
  LogOut,
  Lock,
  CheckCircle2,
  X,
  Building2,
  ChevronRight
} from 'lucide-react';
import { OfficerUser } from './OfficerLoginPage';
import { PragatiLogo } from './PragatiLogo';

export type NavigationPage = 'pathway' | 'register' | 'login' | 'generator' | 'allotment' | 'documents';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isOfficerLoggedIn: boolean;
  officerUser: OfficerUser | null;
  onLogout: () => void;
  isPlanGenerated: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOfficerLoggedIn,
  officerUser,
  onLogout,
  isPlanGenerated,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'pathway' as NavigationPage,
      label: 'How System Works',
      sublabel: 'Interactive Pathway & Guide',
      icon: GitCommit,
      requiresAuth: false,
      requiresPlan: false
    },
    {
      id: 'register' as NavigationPage,
      label: 'Officer Registration',
      sublabel: 'Mandatory Account Setup',
      icon: UserPlus,
      requiresAuth: false,
      requiresPlan: false
    },
    {
      id: 'login' as NavigationPage,
      label: 'Officer Sign In',
      sublabel: 'Secure Authentication',
      icon: LogIn,
      requiresAuth: false,
      requiresPlan: false
    },
    {
      id: 'generator' as NavigationPage,
      label: 'Exam Setup & Generator',
      sublabel: 'Blocks, Rooms & Cohorts',
      icon: Sliders,
      requiresAuth: true,
      requiresPlan: false
    },
    {
      id: 'allotment' as NavigationPage,
      label: 'Seating Allotment',
      sublabel: 'Interactive Bench Grids',
      icon: Armchair,
      requiresAuth: true,
      requiresPlan: true
    },
    {
      id: 'documents' as NavigationPage,
      label: 'Document Printing & Exports',
      sublabel: 'Door Charts, PDFs & Excel',
      icon: Printer,
      requiresAuth: true,
      requiresPlan: true
    }
  ];

  const handleItemClick = (item: (typeof navItems)[0]) => {
    onNavigate(item.id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 bg-[#FAF4F0] text-stone-800">
      
      {/* Top Header & Branding */}
      <div className="space-y-4">
        
        {/* Mobile close button & College Logo block */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D88C72]/40">
          <div
            onClick={() => {
              onNavigate('pathway');
              onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <PragatiLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#A44A3F] bg-[#F4D6C6] px-2 py-0.2 rounded-full border border-[#D88C72]/60">
                  Autonomous
                </span>
                <span className="text-[9px] font-bold text-[#6B2F2F]">
                  NAAC &apos;A&apos;
                </span>
              </div>
              <span className="text-sm font-black text-[#6B2F2F] tracking-tight block leading-tight uppercase">
                Pragati Engg College
              </span>
              <span className="text-[10px] font-bold text-[#A44A3F] tracking-wide block">
                ExamSeat Pro System
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl bg-white border border-[#D88C72]/60 text-[#6B2F2F] hover:bg-[#F4D6C6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Officer Status Card */}
        <div className="p-3 rounded-2xl bg-white border border-[#D88C72]/60 shadow-xs">
          {isOfficerLoggedIn && officerUser ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4D6C6] text-[#6B2F2F] text-[10px] font-extrabold border border-[#D88C72]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A44A3F] animate-pulse" />
                  <span>Authorized Officer</span>
                </span>
                <span className="text-[10px] font-mono text-stone-500 font-bold">
                  {officerUser.id}
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-[#6B2F2F] truncate">
                  {officerUser.name}
                </p>
                <p className="text-[10px] font-medium text-stone-600 truncate">
                  {officerUser.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                  <Lock className="w-2.5 h-2.5 text-amber-700" />
                  <span>Officer Sign-in Required</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-tight">
                Exam seating & hall allocation requires verified officer credentials.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="space-y-1 pt-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#A44A3F] px-2 mb-1">
            Navigation Modules
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isLocked = (item.requiresAuth && !isOfficerLoggedIn) || (item.requiresPlan && !isPlanGenerated);

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer text-left border ${
                    isActive
                      ? 'bg-[#6B2F2F] text-white border-[#6B2F2F] shadow-md shadow-[#6B2F2F]/20 font-bold'
                      : 'bg-white hover:bg-[#F4D6C6]/40 text-stone-800 border-[#D88C72]/30 hover:border-[#D88C72]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-[#F4D6C6]'
                          : 'bg-[#FAF4F0] text-[#6B2F2F] border border-[#D88C72]/40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className={`text-xs sm:text-sm font-extrabold truncate ${isActive ? 'text-white' : 'text-[#6B2F2F]'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-[#F4D6C6]' : 'text-stone-500'}`}>
                        {item.sublabel}
                      </p>
                    </div>
                  </div>

                  {/* Status / Lock badges */}
                  <div className="shrink-0 ml-1">
                    {item.requiresAuth && !isOfficerLoggedIn ? (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                        <Lock className="w-2.5 h-2.5" />
                        <span>Lock</span>
                      </span>
                    ) : item.requiresPlan && !isPlanGenerated ? (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>
                        <span>Pending</span>
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Bottom Actions & Accreditation */}
      <div className="pt-4 border-t border-[#D88C72]/40 space-y-3">
        {isOfficerLoggedIn ? (
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#F4D6C6] text-[#6B2F2F] border border-[#D88C72]/70 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-[#A44A3F]" />
            <span>Sign Out of Officer Session</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onNavigate('register');
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#6B2F2F] hover:bg-[#A44A3F] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#6B2F2F]/20"
          >
            <UserPlus className="w-4 h-4 text-[#F4D6C6]" />
            <span>Register as Officer</span>
          </button>
        )}

        <div className="text-center text-[10px] text-stone-500 font-medium space-y-0.5">
          <p className="font-bold text-[#6B2F2F]">PRAGATI ENGINEERING COLLEGE</p>
          <p>Permanently Affiliated to JNTUK • NAAC &apos;A&apos;</p>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 border-r-2 border-[#D88C72]/40 overflow-y-auto shadow-xs z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#FAF4F0] border-r-2 border-[#D88C72] shadow-2xl overflow-y-auto"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
