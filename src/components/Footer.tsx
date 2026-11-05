/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUp, ShieldCheck } from 'lucide-react';
import { PragatiLogo } from './PragatiLogo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF4F0] border-t-2 border-[#D88C72]/40 py-6 sm:py-8 text-xs text-stone-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* College Crest & Title */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <PragatiLogo size="sm" className="ring-2 ring-[#D88C72]/50 shadow-xs" />
          <div>
            <span className="font-extrabold text-[#6B2F2F] text-sm block">
              Pragati Engineering College (Autonomous)
            </span>
            <span className="text-[#A44A3F] text-[11px] font-semibold flex items-center gap-1 justify-center md:justify-start">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A44A3F]" />
              <span>ExamSeat Pro • Office of Controller of Examinations</span>
            </span>
          </div>
        </div>

        {/* System Specs */}
        <p className="text-center md:text-left text-stone-500 text-[11px] font-medium">
          Automatic Seating Arrangement System • 4 Blocks (30 Halls Each • 120 Total) • 4 Columns × 6 Benches
        </p>

        {/* Back to Top */}
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4D6C6]/50 text-[#6B2F2F] font-bold transition-all cursor-pointer border-2 border-[#D88C72]/60 shadow-xs"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5 text-[#A44A3F]" />
        </button>

      </div>
    </footer>
  );
};
