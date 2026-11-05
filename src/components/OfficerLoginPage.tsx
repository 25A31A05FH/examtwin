/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Mail
} from 'lucide-react';
import { PragatiLogo } from './PragatiLogo';

export interface OfficerUser {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  loginTime: string;
}

interface OfficerLoginPageProps {
  onLoginSuccess: (officer: OfficerUser) => void;
  onNavigateToRegister: () => void;
  onNavigateToPathway?: () => void;
}

export const OfficerLoginPage: React.FC<OfficerLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToPathway
}) => {
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputId = officerId.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputId) {
      setErrorMessage('Please enter your Officer Email or ID.');
      return;
    }
    if (!inputPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Check in registered users list first
      let matchedUser: OfficerUser | null = null;
      try {
        const storedUsersRaw = localStorage.getItem('examseat_registered_officers');
        if (storedUsersRaw) {
          const registeredList: OfficerUser[] = JSON.parse(storedUsersRaw);
          const found = registeredList.find(
            u => u.email.toLowerCase() === inputId || u.id.toLowerCase() === inputId
          );
          if (found) {
            matchedUser = found;
          }
        }
      } catch (err) {
        console.warn(err);
      }

      // Default authorized officer accounts
      const authorizedOfficers: Record<string, { name: string; role: string; dept: string }> = {
        'officer@pragati.ac.in': {
          name: 'Dr. K. V. Raman',
          role: 'Chief Controller of Examinations',
          dept: 'Examination Cell'
        },
        'examcell@pragati.ac.in': {
          name: 'Prof. S. R. Murthy',
          role: 'Controller of Examinations',
          dept: 'Academic & Examination Section'
        }
      };

      if (matchedUser) {
        const sessionOfficer: OfficerUser = {
          ...matchedUser,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('examseat_officer_session', JSON.stringify(sessionOfficer));
        onLoginSuccess(sessionOfficer);
      } else if (authorizedOfficers[inputId] && inputPass.length >= 6) {
        const info = authorizedOfficers[inputId];
        const sessionOfficer: OfficerUser = {
          id: inputId.split('@')[0].toUpperCase(),
          name: info.name,
          role: info.role,
          email: inputId,
          department: info.dept,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('examseat_officer_session', JSON.stringify(sessionOfficer));
        onLoginSuccess(sessionOfficer);
      } else {
        setErrorMessage(
          'No matching Officer record found. Please verify your credentials or register a new Officer account.'
        );
      }
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12"
    >
      <div className="w-full max-w-md">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          {onNavigateToPathway && (
            <button
              type="button"
              onClick={onNavigateToPathway}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B2F2F] hover:text-[#A44A3F] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#A44A3F]" />
              <span>How System Works</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToRegister}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#6B2F2F] hover:text-[#A44A3F] transition-colors cursor-pointer ml-auto"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#A44A3F]" />
            <span>New Officer? Register</span>
          </button>
        </div>

        {/* Main Login Card - Terracotta Warmth Theme */}
        <div className="bg-white rounded-3xl border-2 border-[#D88C72]/60 shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#6B2F2F] via-[#A44A3F] to-[#6B2F2F] text-white p-6 sm:p-7 text-center relative overflow-hidden">
            <div className="flex justify-center mb-3">
              <PragatiLogo size="lg" className="shadow-lg ring-3 ring-white/30" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6B2F2F] bg-[#F4D6C6] px-3 py-0.5 rounded-full border border-[#D88C72]/60 inline-block shadow-2xs">
                Pragati Engineering College (Autonomous)
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                Exam Officer Sign In
              </h1>
              <p className="text-xs text-white/90 font-medium max-w-xs mx-auto">
                Authorized access for Examination Controllers & Section In-Charges
              </p>
            </div>

            <div className="mt-3 text-[10px] font-bold tracking-wider uppercase text-white bg-white/20 py-0.5 px-3 rounded-full inline-block border border-white/30">
              Secure Officer Verification
            </div>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-7 space-y-5 text-stone-800">
            
            <div className="flex items-center gap-2 pb-3 border-b border-[#D88C72]/30">
              <ShieldCheck className="w-5 h-5 text-[#A44A3F]" />
              <div>
                <h2 className="font-extrabold text-[#6B2F2F] text-sm sm:text-base">
                  Officer Authentication
                </h2>
                <p className="text-xs text-stone-600">
                  Enter your registered credentials to unlock exam room allocations
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-[#F4D6C6] border border-[#A44A3F] rounded-xl text-xs font-semibold text-[#6B2F2F] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#A44A3F] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Officer ID / Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#A44A3F]" />
                  <span>College Email or Officer ID *</span>
                </label>
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. officer@pragati.ac.in or PEC-EXAM-01"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF4F0] border border-[#D88C72]/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D88C72]/40 focus:border-[#6B2F2F] text-stone-900 font-medium transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#A44A3F]" />
                  <span>Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-[#FAF4F0] border border-[#D88C72]/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D88C72]/40 focus:border-[#6B2F2F] text-stone-900 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#6B2F2F] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#6B2F2F] hover:bg-[#A44A3F] active:bg-[#6B2F2F] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#6B2F2F]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#F4D6C6]" />
                    <span>Sign In & Unlock Exam Portal</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Bottom Links */}
            <div className="pt-4 border-t border-[#D88C72]/30 text-center">
              <p className="text-xs text-stone-600 font-medium">
                Don&apos;t have an Officer account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="font-extrabold text-[#6B2F2F] hover:text-[#A44A3F] underline underline-offset-2 cursor-pointer ml-1"
                >
                  Register here &rarr;
                </button>
              </p>
            </div>

          </div>
        </div>

        {/* Security and College Stamp */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-[11px] font-semibold text-stone-600">
            PRAGATI ENGINEERING COLLEGE (AUTONOMOUS) • Surampalem
          </p>
          <p className="text-[10px] text-[#A44A3F] font-bold">
            Automatic Seating Arrangement System • 4 Blocks (30 Rooms Each)
          </p>
        </div>

      </div>
    </motion.div>
  );
};
