/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Layers, Building2, Sparkles, Armchair, Printer } from 'lucide-react';
import { PragatiLogo } from './PragatiLogo';

export const PathwayGuide: React.FC = () => {
  // 6 Connected Stages matching user reference image structure
  const pathwaySteps = [
    {
      num: '01',
      title: 'Register',
      fullTitle: 'Officer Registration',
      emoji: '🛡️',
      desc: 'Officer registers credentials, faculty ID, and department to unlock examination control privileges.',
      isActive: false
    },
    {
      num: '02',
      title: 'Configure',
      fullTitle: 'Exam & Branch Cohorts',
      emoji: '📋',
      desc: 'Set examination title, academic year, semester, session, and student cohorts (CSE, ECE, EEE, IT).',
      isActive: false
    },
    {
      num: '03',
      title: 'Allocate',
      fullTitle: 'Campus Exam Halls',
      emoji: '🏛️',
      desc: 'Select available halls across 4 academic blocks (Main Block, Tech, Civil, ECE) with 30 rooms each.',
      isActive: true // Highlighted glowing step matching user screenshot 03
    },
    {
      num: '04',
      title: 'Generate',
      fullTitle: 'Anti-Copy Pairing',
      emoji: '⚡',
      desc: 'Automatic algorithm pairs candidate branches alternately across 4 columns × 6 benches (48 seats per hall).',
      isActive: false
    },
    {
      num: '05',
      title: 'Locate',
      fullTitle: 'Visual Bench & Search',
      emoji: '🔍',
      desc: 'Explore interactive bench grids with live student register number search and hall admit slip preview.',
      isActive: false
    },
    {
      num: '06',
      title: 'Export',
      fullTitle: 'Official Print Suite',
      emoji: '🎖️',
      desc: 'Instant production of physical Department Door Charts, invigilator attendance sheets, and Master Excel.',
      isActive: false
    }
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* College Masthead - 05. Terracotta Warmth Theme (No brownish button blocks, No Phase 1/2/3) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D88C72]/50 shadow-md text-center space-y-4">
        
        {/* Official College Crest Logo */}
        <div className="flex justify-center">
          <PragatiLogo size="xl" className="shadow-lg ring-3 ring-[#D88C72]/50" />
        </div>

        {/* College Hierarchy */}
        <div className="space-y-1.5 max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#A44A3F]">
            <span className="bg-[#F4D6C6] text-[#6B2F2F] px-3.5 py-0.5 rounded-full font-black uppercase text-[10px] sm:text-xs border border-[#D88C72]/60 tracking-wider">
              Autonomous College
            </span>
            <span className="text-[#D88C72]">•</span>
            <span className="text-stone-600">Permanently Affiliated to JNTUK</span>
            <span className="text-[#D88C72]">•</span>
            <span className="text-[#6B2F2F] font-extrabold">Accredited by NAAC &apos;A&apos; Grade</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#6B2F2F] tracking-tight uppercase font-serif drop-shadow-xs">
            PRAGATI ENGINEERING COLLEGE
          </h1>

          <p className="text-xs sm:text-sm font-extrabold text-[#A44A3F] tracking-wide">
            Office of the Controller of Examinations • ExamSeat Pro Automated Pipeline
          </p>
        </div>

        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D88C72] to-transparent mx-auto" />

        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Automated examination seating management across <strong className="text-[#6B2F2F]">4 Blocks (30 Halls Each • 120 Total Halls)</strong> with <strong className="text-[#6B2F2F]">4 Columns × 6 Benches</strong> alternating seating to eliminate exam copying and output high-resolution door notices.
        </p>

        {/* Terracotta Spec Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-bold">
          <span className="px-3 py-1 rounded-full bg-[#FAF4F0] border border-[#D88C72]/70 text-[#6B2F2F] shadow-2xs">
            🏛️ 4 Blocks (MB, TB, CV, EC)
          </span>
          <span className="px-3 py-1 rounded-full bg-[#FAF4F0] border border-[#D88C72]/70 text-[#6B2F2F] shadow-2xs">
            🚪 120 Total Halls (48 Seats Each)
          </span>
          <span className="px-3 py-1 rounded-full bg-[#FAF4F0] border border-[#D88C72]/70 text-[#6B2F2F] shadow-2xs">
            🪑 4 Columns × 6 Benches Layout
          </span>
          <span className="px-3 py-1 rounded-full bg-[#FAF4F0] border border-[#D88C72]/70 text-[#6B2F2F] shadow-2xs">
            📋 Official Physical Door Charts
          </span>
        </div>
      </div>

      {/* Mind Map Section Header */}
      <div className="text-center space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#6B2F2F] bg-[#F4D6C6] px-3.5 py-1 rounded-full border border-[#D88C72]/70 inline-block shadow-2xs">
          Interactive Pathway Mind Map
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#6B2F2F] tracking-tight uppercase">
          How ExamSeat Pro Works
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          Visual progression from officer verification to final physical door chart generation.
        </p>
      </div>

      {/* ======================================================== */}
      {/* 3D SPHERE MIND MAP (TERRACOTTA WARMTH THEME)             */}
      {/* ======================================================== */}
      <div className="relative bg-white rounded-3xl border-2 border-[#D88C72]/60 p-6 sm:p-12 overflow-hidden shadow-lg">
        
        {/* Horizontal Connecting Rail & Nodes Container */}
        <div className="relative z-10 overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-none">
          <div className="min-w-[950px] relative">
            
            {/* The Horizontal Rail Line passing straight through center of all nodes */}
            <div className="absolute top-[68px] left-[70px] right-[70px] h-[3px] bg-gradient-to-r from-[#D88C72]/50 via-[#A44A3F] to-[#D88C72]/50 pointer-events-none rounded-full" />

            {/* Glowing Pulse Line Animation */}
            <motion.div
              className="absolute top-[67px] left-[70px] h-[5px] bg-gradient-to-r from-transparent via-[#6B2F2F] to-transparent pointer-events-none rounded-full"
              style={{ width: '220px' }}
              animate={{ left: ['5%', '75%', '5%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* 6 Connected Mind Map Spheres */}
            <div className="grid grid-cols-6 gap-6 relative">
              {pathwaySteps.map((step) => {
                return (
                  <div key={step.num} className="flex flex-col items-center text-center space-y-4 group">
                    
                    {/* Circular Sphere Node (Matching user screenshot) */}
                    <div className="relative flex items-center justify-center">
                      
                      {/* Active Glowing Ring (Like Step 03 in screenshot) */}
                      {step.isActive ? (
                        <motion.div
                          className="absolute -inset-2.5 rounded-full border-2 border-[#A44A3F] shadow-[0_0_20px_rgba(164,74,63,0.45)]"
                          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ) : null}

                      {/* Main Sphere (Clean glass/terracotta tone) */}
                      <div
                        className={`w-32 h-32 rounded-full backdrop-blur-md flex flex-col items-center justify-center relative transition-all duration-300 ${
                          step.isActive
                            ? 'bg-[#F4D6C6] border-2 border-[#6B2F2F] shadow-md ring-4 ring-[#D88C72]/40'
                            : 'bg-[#FAF4F0] border-2 border-[#D88C72]/70 hover:border-[#6B2F2F] shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* 3D Emoji Icon */}
                        <span className="text-3xl filter drop-shadow-sm select-none transform group-hover:scale-110 transition-transform duration-200">
                          {step.emoji}
                        </span>

                        {/* Step Number inside sphere (Exact match to screenshot) */}
                        <span
                          className={`text-xs font-mono font-black tracking-widest mt-1.5 ${
                            step.isActive ? 'text-[#6B2F2F]' : 'text-[#A44A3F]'
                          }`}
                        >
                          {step.num}
                        </span>
                      </div>
                    </div>

                    {/* Step Title & Subtitle below sphere (NO buttons!) */}
                    <div className="space-y-1.5 max-w-[150px]">
                      <h3
                        className={`text-base font-black tracking-tight ${
                          step.isActive ? 'text-[#6B2F2F]' : 'text-stone-800'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-stone-600 leading-snug font-medium">
                        {step.desc}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* Pragati College Exam Hall Infrastructure Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#D88C72]/50 shadow-md space-y-4">
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-lg sm:text-xl font-black uppercase text-[#6B2F2F]">
            Pragati College Exam Hall Infrastructure
          </h3>
          <p className="text-xs text-stone-600">
            120 Examination Halls Distributed Across 4 Academic Blocks (30 Halls Each • 48 Seats Per Hall)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-800">
          <div className="bg-[#FAF4F0] p-3.5 rounded-2xl text-center border border-[#D88C72]/60 shadow-2xs">
            <span className="text-[10px] font-black text-[#A44A3F] block tracking-wider uppercase">MAIN BLOCK (CSE)</span>
            <span className="text-xl font-black text-[#6B2F2F]">30 Halls</span>
            <span className="text-[10px] block text-stone-500 font-medium">Halls MB-101 to MB-310</span>
          </div>

          <div className="bg-[#FAF4F0] p-3.5 rounded-2xl text-center border border-[#D88C72]/60 shadow-2xs">
            <span className="text-[10px] font-black text-[#A44A3F] block tracking-wider uppercase">TECH BLOCK</span>
            <span className="text-xl font-black text-[#6B2F2F]">30 Halls</span>
            <span className="text-[10px] block text-stone-500 font-medium">Halls TB-101 to TB-310</span>
          </div>

          <div className="bg-[#FAF4F0] p-3.5 rounded-2xl text-center border border-[#D88C72]/60 shadow-2xs">
            <span className="text-[10px] font-black text-[#A44A3F] block tracking-wider uppercase">CIVIL BLOCK</span>
            <span className="text-xl font-black text-[#6B2F2F]">30 Halls</span>
            <span className="text-[10px] block text-stone-500 font-medium">Halls CV-101 to CV-310</span>
          </div>

          <div className="bg-[#FAF4F0] p-3.5 rounded-2xl text-center border border-[#D88C72]/60 shadow-2xs">
            <span className="text-[10px] font-black text-[#A44A3F] block tracking-wider uppercase">ECE BLOCK</span>
            <span className="text-xl font-black text-[#6B2F2F]">30 Halls</span>
            <span className="text-[10px] block text-stone-500 font-medium">Halls EC-101 to EC-310</span>
          </div>
        </div>
      </div>

    </div>
  );
};
