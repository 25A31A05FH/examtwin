/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Users, Building2, Armchair, CheckCircle2, ArrowDown, Columns4, Award } from 'lucide-react';
import { SeatingPlan } from '../types';

interface HeroSectionProps {
  currentPlan: SeatingPlan;
  isOfficerLoggedIn: boolean;
  onOpenLoginPage: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentPlan,
  isOfficerLoggedIn,
  onOpenLoginPage
}) => {
  const { totalStudentsExpected, totalStudentsAllocated, roomAllocations } = currentPlan;
  const totalRooms = roomAllocations.length;
  const totalBenches = roomAllocations.reduce((sum, r) => sum + r.totalBenches, 0);
  const totalCapacity = roomAllocations.reduce((sum, r) => sum + r.totalCapacity, 0);

  const scrollToForm = () => {
    const el = document.getElementById('seating-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToResults = () => {
    const el = document.getElementById('seating-results');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSearch = () => {
    const el = document.getElementById('student-search');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="pt-8 pb-10 sm:pt-12 sm:pb-14 bg-gradient-to-b from-[#FAF4F0] to-[#F4D6C6]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* College Masthead - Perfectly Symmetrical, Centered & Aligned */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#D88C72] shadow-md flex flex-col items-center text-center space-y-3.5">
          {/* Official College Crest Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-[#FAF4F0] border-2 border-[#6B2F2F] shadow-sm flex items-center justify-center">
            <img
              src="/assets/aistudio/pragati_e6e0ac40.jpg"
              alt="Pragati Engineering College Crest"
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Perfectly Aligned College Hierarchy */}
          <div className="space-y-1.5 w-full">
            <h2 className="text-xl sm:text-3xl font-black text-[#6B2F2F] tracking-wide uppercase font-serif">
              PRAGATI ENGINEERING COLLEGE
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#A44A3F]">
              <span className="bg-[#F4D6C6] text-[#6B2F2F] px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[11px] sm:text-xs">
                (Autonomous)
              </span>
              <span>•</span>
              <span>Permanently Affiliated to JNTUK</span>
              <span>•</span>
              <span className="text-[#6B2F2F]">Accredited by NAAC &apos;A&apos; Grade</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#6B2F2F] tracking-wide pt-0.5">
              Office of the Controller of Examinations • Automatic Exam Seating Arrangement System
            </p>
          </div>

          {/* Balanced Subtle Divider */}
          <div className="w-24 h-0.5 bg-[#D88C72]/60 rounded-full my-0.5"></div>

          {/* Clean Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF4F0] border border-[#D88C72] text-[#6B2F2F] text-xs sm:text-sm font-extrabold tracking-wide shadow-xs">
            <Sparkles className="w-4 h-4 text-[#A44A3F] shrink-0" />
            <span>4 Blocks (30 Rooms Each • 120 Total) • 4 Columns × 6 Benches Layout</span>
          </div>
        </div>

        {/* Main Heading & Description */}
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-[#6B2F2F] tracking-tight leading-tight uppercase">
            Smart Exam Seating Arrangement
          </h1>
          <p className="text-sm sm:text-base text-[#3D2222]/80 leading-relaxed max-w-2xl mx-auto">
            Select examination halls across <strong className="text-[#6B2F2F]">Main Block (CSE), Tech Block, Civil Block, and ECE Block</strong> (30 rooms each). Automatically pairs branches alternately across <strong className="text-[#6B2F2F]">4 columns of 6 benches</strong> per room (24 benches / 48 seats) to eliminate copying and output visual seating charts.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isOfficerLoggedIn ? (
            <button
              type="button"
              onClick={scrollToForm}
              className="px-6 py-3 bg-[#6B2F2F] hover:bg-[#A44A3F] active:bg-[#6B2F2F] text-[#FAF4F0] text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#6B2F2F]/25 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F4D6C6]" />
              <span>Select Blocks & Generate Seating</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginPage}
              className="px-6 py-3 bg-[#6B2F2F] hover:bg-[#A44A3F] active:bg-[#6B2F2F] text-[#FAF4F0] text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#6B2F2F]/25 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F4D6C6]" />
              <span>Exam Officer Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={scrollToSearch}
            className="px-6 py-3 bg-white hover:bg-[#F4D6C6]/40 text-[#6B2F2F] text-xs sm:text-sm font-bold rounded-xl border border-[#D88C72]/70 shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Armchair className="w-4 h-4 text-[#A44A3F]" />
            <span>Find Student Seating & Hall</span>
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 text-left">
          
          {/* Card 1: Students */}
          <div className="bg-white p-4 rounded-xl border border-[#D88C72]/50 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A44A3F] uppercase tracking-wider">
                Total Students
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#6B2F2F] mt-0.5">
                {totalStudentsAllocated}
                <span className="text-xs font-normal text-[#A44A3F]/70"> / {totalStudentsExpected}</span>
              </p>
              <p className="text-[10px] text-[#A44A3F] font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-[#A44A3F]" />
                Students Details Verified
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF4F0] text-[#6B2F2F] flex items-center justify-center border border-[#D88C72]/40">
              <Users className="w-5 h-5 text-[#A44A3F]" />
            </div>
          </div>

          {/* Card 2: Examination Halls */}
          <div className="bg-white p-4 rounded-xl border border-[#D88C72]/50 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A44A3F] uppercase tracking-wider">
                Active Halls
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#6B2F2F] mt-0.5">
                {totalRooms}
                <span className="text-xs font-normal text-[#A44A3F]/70"> Halls</span>
              </p>
              <p className="text-[10px] text-[#6B2F2F] font-semibold flex items-center gap-1 mt-0.5">
                Across 4 College Blocks
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF4F0] text-[#6B2F2F] flex items-center justify-center border border-[#D88C72]/40">
              <Building2 className="w-5 h-5 text-[#A44A3F]" />
            </div>
          </div>

          {/* Card 3: Benches Allocated */}
          <div className="bg-white p-4 rounded-xl border border-[#D88C72]/50 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A44A3F] uppercase tracking-wider">
                Total Benches
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#6B2F2F] mt-0.5">
                {totalBenches}
              </p>
              <p className="text-[10px] text-[#A44A3F] font-semibold flex items-center gap-1 mt-0.5">
                4 Cols × 6 Benches / Room
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF4F0] text-[#6B2F2F] flex items-center justify-center border border-[#D88C72]/40">
              <Columns4 className="w-5 h-5 text-[#A44A3F]" />
            </div>
          </div>

          {/* Card 4: Total Hall Capacity */}
          <div className="bg-white p-4 rounded-xl border border-[#D88C72]/50 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A44A3F] uppercase tracking-wider">
                Total Capacity
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#6B2F2F] mt-0.5">
                {totalCapacity}
              </p>
              <p className="text-[10px] text-[#6B2F2F] font-semibold flex items-center gap-1 mt-0.5">
                48 Candidates / Hall
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF4F0] text-[#6B2F2F] flex items-center justify-center border border-[#D88C72]/40">
              <Armchair className="w-5 h-5 text-[#A44A3F]" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
