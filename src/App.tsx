/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { NavigationPage } from './components/Sidebar';
import { PathwayGuide } from './components/PathwayGuide';
import { OfficerRegisterPage } from './components/OfficerRegisterPage';
import { OfficerLoginPage, OfficerUser } from './components/OfficerLoginPage';
import { ExamSeatingForm } from './components/ExamSeatingForm';
import { SeatingResultsView } from './components/SeatingResultsView';
import { DownloadPrintSection } from './components/DownloadPrintSection';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import {
  SeatingPlan,
  ExamDetails,
  Room,
  BranchCohort,
  BranchPairing
} from './types';
import { SeatingApiService } from './services/api';

export default function App() {
  // Global persisted state - Starts null until officer generates!
  const [currentPlan, setCurrentPlan] = useState<SeatingPlan | null>(() =>
    SeatingApiService.getCurrentPlan()
  );
  const [examDetails, setExamDetails] = useState<ExamDetails>(() =>
    SeatingApiService.getExamDetails()
  );
  const [branchCohorts, setBranchCohorts] = useState<BranchCohort[]>(() =>
    SeatingApiService.getBranchCohorts()
  );
  const [branchPairings, setBranchPairings] = useState<BranchPairing[]>(() =>
    SeatingApiService.getBranchPairings()
  );
  const [rooms, setRooms] = useState<Room[]>(() =>
    SeatingApiService.getRooms()
  );
  const [sectionRule, setSectionRule] = useState<'mix' | 'separate'>(() =>
    SeatingApiService.getSectionRule()
  );

  // Officer Authentication State
  const [officerUser, setOfficerUser] = useState<OfficerUser | null>(() => {
    try {
      const raw = localStorage.getItem('examseat_officer_session');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    return null;
  });

  // URL Hash & Refresh-Persistent Page Routing
  const getInitialPage = (): NavigationPage => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const validPages: NavigationPage[] = [
        'pathway',
        'register',
        'login',
        'generator',
        'allotment',
        'documents'
      ];
      if (validPages.includes(hash as NavigationPage)) {
        return hash as NavigationPage;
      }
      const saved = localStorage.getItem('examseat_active_page');
      if (saved && validPages.includes(saved as NavigationPage)) {
        return saved as NavigationPage;
      }
    }
    return 'pathway';
  };

  const [currentPage, setCurrentPage] = useState<NavigationPage>(getInitialPage);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Loading / Buffering Screen ('looding...' with Pragati circular logo)
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);

  // Display 'looding...' screen on initial page refresh/load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingScreen(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Listen to browser hash changes (e.g. back/forward, direct address bar navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const validPages: NavigationPage[] = [
        'pathway',
        'register',
        'login',
        'generator',
        'allotment',
        'documents'
      ];
      if (validPages.includes(hash as NavigationPage)) {
        setCurrentPage(hash as NavigationPage);
        localStorage.setItem('examseat_active_page', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    window.location.hash = '#' + page;
    localStorage.setItem('examseat_active_page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRegisterSuccess = (officer: OfficerUser) => {
    setOfficerUser(officer);
    showToast(`✨ Account created & verified for ${officer.name}! Welcome to ExamSeat Pro.`);
    handleNavigate('pathway'); // Always navigate to How System Works main page upon registration
  };

  const handleLoginSuccess = (officer: OfficerUser) => {
    setOfficerUser(officer);
    showToast(`✨ Welcome, Exam Officer ${officer.name} (${officer.role})`);
    handleNavigate('pathway'); // Always navigate to How System Works main page
  };

  const handleOfficerLogout = () => {
    localStorage.removeItem('examseat_officer_session');
    setOfficerUser(null);
    showToast('Logged out of Exam Officer session successfully.');
    handleNavigate('pathway');
  };

  const handleGenerateSuccess = (plan: SeatingPlan) => {
    setCurrentPlan(plan);
    setExamDetails(plan.examDetails);
    setBranchCohorts(plan.branchCohorts);
    setBranchPairings(plan.branchPairings);
    setSectionRule(plan.sectionRule);

    SeatingApiService.saveCurrentPlan(plan);
    SeatingApiService.saveExamDetails(plan.examDetails);
    SeatingApiService.saveBranchCohorts(plan.branchCohorts);
    SeatingApiService.saveBranchPairings(plan.branchPairings);
    SeatingApiService.saveSectionRule(plan.sectionRule);

    showToast('✨ Seating allotment generated & saved across Pragati Engineering College halls!');
    handleNavigate('allotment');
  };

  return (
    <div className="min-h-screen bg-[#FAF4F0] flex flex-col font-sans text-stone-800 antialiased selection:bg-[#6B2F2F] selection:text-[#F4D6C6]">
      
      {/* Loading / Buffering Screen (displays Pragati logo circle and 'looding...') */}
      {isLoadingScreen && <LoadingScreen message="looding..." />}

      {/* Horizontal Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOfficerLoggedIn={!!officerUser}
        officerUser={officerUser}
        onOfficerLogout={handleOfficerLogout}
        isPlanGenerated={!!currentPlan}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 p-4 bg-white text-stone-800 text-xs font-semibold rounded-2xl shadow-xl border-2 border-[#D88C72] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-[#A44A3F] animate-pulse" />
          <span className="text-[#6B2F2F] font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-[#6B2F2F] ml-1 p-0.5 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          
          {/* Module 1: Pathway & System Workflow (Main Page) */}
          {currentPage === 'pathway' && (
            <motion.div
              key="pathway"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <PathwayGuide />
            </motion.div>
          )}

          {/* Module 2: Officer Registration */}
          {currentPage === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <OfficerRegisterPage
                onRegisterSuccess={handleRegisterSuccess}
                onNavigateToLogin={() => handleNavigate('login')}
                onNavigateToPathway={() => handleNavigate('pathway')}
              />
            </motion.div>
          )}

          {/* Module 3: Officer Sign In */}
          {currentPage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <OfficerLoginPage
                onLoginSuccess={handleLoginSuccess}
                onNavigateToRegister={() => handleNavigate('register')}
                onNavigateToPathway={() => handleNavigate('pathway')}
              />
            </motion.div>
          )}

          {/* Module 4: Exam Setup & Seating Generator */}
          {currentPage === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ExamSeatingForm
                initialExamDetails={examDetails}
                initialCohorts={branchCohorts}
                initialPairings={branchPairings}
                initialRooms={rooms}
                initialSectionRule={sectionRule}
                onGenerateSuccess={handleGenerateSuccess}
                isOfficerLoggedIn={!!officerUser}
                officerName={officerUser?.name}
                onOpenLoginPage={() => handleNavigate('login')}
                onOpenRegisterPage={() => handleNavigate('register')}
                onNavigateToAllotment={() => handleNavigate('allotment')}
              />
            </motion.div>
          )}

          {/* Module 5: Seating Allotment & Visual Bench Grids */}
          {currentPage === 'allotment' && (
            <motion.div
              key="allotment"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <SeatingResultsView
                currentPlan={currentPlan}
                onNavigateToGenerator={() => handleNavigate('generator')}
              />
            </motion.div>
          )}

          {/* Module 6: Document Printing & Official Exports */}
          {currentPage === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <DownloadPrintSection
                currentPlan={currentPlan}
                onNavigateToGenerator={() => handleNavigate('generator')}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Clean College Footer */}
      <Footer />

    </div>
  );
}
