/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Armchair,
  Search,
  Building2,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Columns3
} from 'lucide-react';
import { SeatingPlan, RoomAllocation, Student, StudentSearchResult, BenchSeat } from '../types';
import { exportRoomNoticePDF, exportAttendanceSheetPDF } from '../utils/exportUtils';
import { SeatingApiService } from '../services/api';

interface SeatingResultsViewProps {
  currentPlan: SeatingPlan | null;
  onNavigateToGenerator?: () => void;
}

export const SeatingResultsView: React.FC<SeatingResultsViewProps> = ({
  currentPlan,
  onNavigateToGenerator
}) => {
  if (!currentPlan) {
    return (
      <div className="py-20 px-4 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#FAF4F0] border-2 border-[#D88C72] mx-auto flex items-center justify-center text-[#6B2F2F] shadow-sm">
          <Armchair className="w-8 h-8 text-[#A44A3F]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-[#6B2F2F] uppercase">
            Seating Allotment Pending
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            No seating arrangement has been generated yet. The Examination Officer must first configure the cohorts and halls, then click <strong>&quot;Generate Seating Allotment&quot;</strong> in the Exam Setup module.
          </p>
        </div>
        {onNavigateToGenerator && (
          <button
            type="button"
            onClick={onNavigateToGenerator}
            className="px-6 py-3 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white font-bold text-xs rounded-xl shadow-md shadow-[#6B2F2F]/20 cursor-pointer transition-all inline-flex items-center gap-2"
          >
            <span>Go to Exam Setup & Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  const { roomAllocations, examDetails, conflicts, unallocatedStudents } = currentPlan;

  // Selected room
  const [activeRoomId, setActiveRoomId] = useState<string>(roomAllocations[0]?.roomId || '');
  const [blockFilter, setBlockFilter] = useState<string>('All');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [highlightedBench, setHighlightedBench] = useState<number | null>(null);

  // Admit card modal state
  const [admitStudent, setAdmitStudent] = useState<{
    student: Student;
    roomNumber: string;
    block: string;
    benchNumber: number;
    columnNumber?: number;
    rowInColumn?: number;
    position: string;
  } | null>(null);

  // Keep active room in sync if allocations change
  useEffect(() => {
    if (roomAllocations.length > 0 && !roomAllocations.some(r => r.roomId === activeRoomId)) {
      setActiveRoomId(roomAllocations[0].roomId);
    }
  }, [roomAllocations, activeRoomId]);

  // Live search handler
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setHighlightedBench(null);
      return;
    }
    const res = SeatingApiService.searchStudent(q, currentPlan);
    setSearchResults(res);
  };

  const handleJumpToStudent = (res: StudentSearchResult) => {
    const targetRoom = roomAllocations.find(r => r.roomNumber === res.roomNumber);
    if (targetRoom) {
      setActiveRoomId(targetRoom.roomId);
      setHighlightedBench(res.benchNumber);

      const benchEl = document.getElementById(`bench-card-${targetRoom.roomId}-${res.benchNumber}`);
      if (benchEl) {
        benchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const container = document.getElementById(`room-container-${targetRoom.roomId}`);
        if (container) container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const allBlocks = Array.from(new Set(roomAllocations.map(r => r.block)));
  const filteredRooms = blockFilter === 'All'
    ? roomAllocations
    : roomAllocations.filter(r => r.block === blockFilter);

  const currentRoom = roomAllocations.find(r => r.roomId === activeRoomId) || roomAllocations[0];

  // Warm theme badge styles for branches
  const getBranchTheme = (branch: string) => {
    const b = branch.toUpperCase();
    if (b.includes('CS')) {
      return { bg: 'bg-[#FAF4F0]', text: 'text-[#6B2F2F]', border: 'border-[#6B2F2F]/40', badge: 'bg-[#6B2F2F] text-white' };
    }
    if (b.includes('EC')) {
      return { bg: 'bg-[#FAF4F0]', text: 'text-[#A44A3F]', border: 'border-[#A44A3F]/40', badge: 'bg-[#A44A3F] text-white' };
    }
    if (b.includes('IT')) {
      return { bg: 'bg-[#FAF4F0]', text: 'text-[#8B3A3A]', border: 'border-[#D88C72]/60', badge: 'bg-[#8B3A3A] text-[#F4D6C6]' };
    }
    if (b.includes('CIVIL')) {
      return { bg: 'bg-[#FAF4F0]', text: 'text-[#6B2F2F]', border: 'border-[#D88C72]/60', badge: 'bg-[#6B2F2F] text-[#F4D6C6]' };
    }
    if (b.includes('MECH')) {
      return { bg: 'bg-[#FAF4F0]', text: 'text-[#A44A3F]', border: 'border-[#D88C72]/60', badge: 'bg-[#A44A3F] text-[#FAF4F0]' };
    }
    return { bg: 'bg-[#FAF4F0]', text: 'text-[#6B2F2F]', border: 'border-[#A44A3F]/40', badge: 'bg-[#6B2F2F] text-white' };
  };

  // Group benches into 4 distinct columns of 6 benches each
  const numColumns = currentRoom?.columns || 4;
  const benchesPerCol = currentRoom?.benchesPerColumn || 6;
  const columnsList: { colNum: number; label: string; benches: BenchSeat[] }[] = [];

  if (currentRoom) {
    for (let c = 1; c <= numColumns; c++) {
      const colBenches = currentRoom.benches.filter(b => {
        if (b.columnNumber) return b.columnNumber === c;
        return Math.floor((b.benchNumber - 1) / benchesPerCol) + 1 === c;
      });

      const startBench = (c - 1) * benchesPerCol + 1;
      const endBench = Math.min(c * benchesPerCol, currentRoom.totalBenches);

      columnsList.push({
        colNum: c,
        label: `Column ${c} (Benches ${startBench} - ${endBench})`,
        benches: colBenches
      });
    }
  }

  return (
    <section id="seating-results" className="py-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4D6C6] border border-[#D88C72]/60 text-[#6B2F2F] text-xs font-bold">
            <Columns3 className="w-3.5 h-3.5 text-[#A44A3F]" />
            <span>Interactive Layout • 4 Columns × 6 Benches</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#6B2F2F] tracking-tight">
            Generated Seating Arrangement
          </h2>
          <p className="text-xs sm:text-sm text-[#3D2222]/80">
            Room-wise bench layouts arranged into 4 columns of 6 benches each (24 benches / 48 seats per room).
          </p>
        </div>

        {/* Conflict / Warning Alerts */}
        {conflicts.length > 0 && (
          <div className="p-4 rounded-xl bg-[#F4D6C6] border border-[#A44A3F] text-xs text-[#6B2F2F] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#A44A3F] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">System Notice & Rule Checks:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-[#6B2F2F]">
                {conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SEARCH BOX: Find Student by Register Number */}
        {/* ======================================================== */}
        <div id="student-search" className="bg-white p-5 rounded-2xl border border-[#D88C72]/60 shadow-sm space-y-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#6B2F2F] text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-[#A44A3F]" />
                Find Student Seating by Register Number
              </h3>
              <p className="text-xs text-[#3D2222]/70">
                Enter register number (e.g. 24CS101) or name to find the exact Room, Block, Column (1, 2, 3), Row (1-8), Bench, and Seat
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#A44A3F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Type Register Number (e.g. 24CS101, 24EC102) or student name..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF4F0]/60 border border-[#D88C72]/60 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A44A3F]/30 focus:border-[#6B2F2F] text-[#3D2222] font-medium"
            />
          </div>

          {/* Search Results Preview */}
          {searchResults.length > 0 && (
            <div className="p-3 bg-[#FAF4F0] rounded-xl border border-[#D88C72]/60 space-y-2 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-bold text-[#6B2F2F] uppercase">
                Matching Candidates ({searchResults.length}):
              </div>
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded-lg border border-[#D88C72]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#6B2F2F]">{res.student.name}</span>
                      <span className="font-mono font-bold text-[#6B2F2F] bg-[#F4D6C6] px-1.5 py-0.2 rounded text-[11px] border border-[#D88C72]/50">
                        {res.student.regNo}
                      </span>
                      <span className="text-[10px] text-[#A44A3F] font-semibold">
                        ({res.student.branch} - Sec {res.student.section})
                      </span>
                    </div>
                    <div className="text-[#3D2222]/80 text-[11px] flex flex-wrap items-center gap-2">
                      <span>Block: <strong className="text-[#6B2F2F]">{res.block}</strong></span>
                      <span>•</span>
                      <span>Room: <strong className="text-[#6B2F2F]">{res.roomNumber}</strong></span>
                      <span>•</span>
                      <span className="text-[#6B2F2F] font-bold bg-[#F4D6C6] px-1.5 py-0.5 rounded">
                        Column {res.columnNumber || Math.floor((res.benchNumber - 1) / (currentRoom?.benchesPerColumn || 6)) + 1}
                      </span>
                      <span>•</span>
                      <span className="text-[#3D2222] font-semibold">
                        Row {res.rowInColumn || ((res.benchNumber - 1) % (currentRoom?.benchesPerColumn || 6)) + 1} (Bench #{res.benchNumber})
                      </span>
                      <span>•</span>
                      <span className="text-[#A44A3F] font-bold">
                        {res.position}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJumpToStudent(res)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white rounded-lg font-bold text-xs self-start sm:self-center transition-colors cursor-pointer"
                  >
                    <span>Highlight on Bench</span>
                    <ArrowRight className="w-3 h-3 text-[#F4D6C6]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.trim() && searchResults.length === 0 && (
            <div className="text-center py-4 text-xs text-[#3D2222]/70">
              No matching student found for "{searchQuery}". Please check the register number or verify they were uploaded.
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* ROOM SELECTOR & BLOCK FILTERS */}
        {/* ======================================================== */}
        <div className="bg-white p-5 rounded-2xl border border-[#D88C72]/60 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#6B2F2F] text-sm">
                Examination Hall Layouts by Block
              </h3>
              <p className="text-xs text-[#3D2222]/70">
                Filter by block (Main Block (CSE), Tech Block, Civil Block, ECE Block) to view allocated rooms
              </p>
            </div>

            {/* Block Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[#6B2F2F] font-semibold mr-1">Filter Block:</span>
              <button
                type="button"
                onClick={() => setBlockFilter('All')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  blockFilter === 'All'
                    ? 'bg-[#6B2F2F] text-white'
                    : 'bg-[#FAF4F0] text-[#6B2F2F] border border-[#D88C72]/50 hover:bg-[#F4D6C6]'
                }`}
              >
                All Blocks ({roomAllocations.length})
              </button>
              {allBlocks.map(b => {
                const count = roomAllocations.filter(r => r.block === b).length;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBlockFilter(b)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      blockFilter === b
                        ? 'bg-[#6B2F2F] text-white'
                        : 'bg-[#FAF4F0] text-[#6B2F2F] border border-[#D88C72]/50 hover:bg-[#F4D6C6]'
                    }`}
                  >
                    {b} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-[#D88C72]/30">
            {filteredRooms.map(r => {
              const isSelected = r.roomId === (currentRoom?.roomId || '');
              return (
                <button
                  key={r.roomId}
                  type="button"
                  onClick={() => {
                    setActiveRoomId(r.roomId);
                    setHighlightedBench(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#6B2F2F] text-white shadow-sm shadow-[#6B2F2F]/25'
                      : 'bg-[#FAF4F0] text-[#6B2F2F] hover:bg-[#F4D6C6] border border-[#D88C72]/50'
                  }`}
                >
                  <span>{r.roomNumber} ({r.block.split(' ')[0]})</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isSelected ? 'bg-[#A44A3F] text-white' : 'bg-[#F4D6C6] text-[#6B2F2F]'
                  }`}>
                    {r.totalAllocated}/{r.totalCapacity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* ACTIVE ROOM DETAILS BAR & ACTIONS */}
        {/* ======================================================== */}
        {currentRoom && (
          <div
            id={`room-container-${currentRoom.roomId}`}
            className="bg-white p-5 rounded-2xl border border-[#D88C72]/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-black text-[#6B2F2F]">
                  Hall {currentRoom.roomNumber}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F4D6C6] text-[#6B2F2F] border border-[#D88C72]">
                  {currentRoom.block}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#6B2F2F] text-[#F4D6C6]">
                  4 Columns × 6 Benches = 24 Benches
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#F4D6C6] text-[#A44A3F] border border-[#D88C72]">
                  {Math.round((currentRoom.totalAllocated / currentRoom.totalCapacity) * 100)}% Full
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#3D2222]/80 pt-1">
                <span>
                  Seat 1 (Left): <strong className="text-[#6B2F2F]">{currentRoom.branchACount} {currentRoom.branchA}</strong>
                </span>
                <span>•</span>
                <span>
                  Seat 2 (Right): <strong className="text-[#A44A3F]">{currentRoom.branchBCount} {currentRoom.branchB}</strong>
                </span>
                <span>•</span>
                <span>
                  Total: <strong className="text-[#6B2F2F]">{currentRoom.totalAllocated} / {currentRoom.totalCapacity} Candidates</strong> (24 Benches • 2 Seats/Bench)
                </span>
              </div>
            </div>

            {/* Print door notice for this room */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportRoomNoticePDF(currentPlan, currentRoom)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6B2F2F] bg-[#FAF4F0] hover:bg-[#F4D6C6] border border-[#D88C72]/60 rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#A44A3F]" />
                <span>Door Notice (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => exportAttendanceSheetPDF(currentPlan, currentRoom)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6B2F2F] bg-[#FAF4F0] hover:bg-[#F4D6C6] border border-[#D88C72]/60 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#A44A3F]" />
                <span>Attendance (PDF)</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2D CLASSROOM BENCH GRID: 3 COLUMNS × 8 BENCHES */}
        {/* ======================================================== */}
        {currentRoom && (
          <div className="bg-[#FAF4F0]/80 p-6 rounded-2xl border border-[#D88C72]/60 shadow-inner space-y-6">
            
            {/* Classroom Blackboard Banner */}
            <div className="max-w-md mx-auto">
              <div className="bg-[#6B2F2F] text-[#F4D6C6] px-6 py-2.5 rounded-xl border-4 border-[#3D1E1E] shadow-md text-center">
                <div className="text-xs font-black tracking-widest uppercase text-[#FAF4F0]">
                  BLACKBOARD / INVIGILATOR PODIUM
                </div>
                <div className="text-[10px] text-[#F4D6C6] font-mono mt-0.5">
                  Front of Examination Hall • Room {currentRoom.roomNumber} ({currentRoom.block})
                </div>
              </div>
            </div>

            {/* Layout Indicator: 4 Columns Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {columnsList.map(col => (
                <div key={col.colNum} className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F4D6C6] text-[#6B2F2F] font-bold text-xs uppercase tracking-wider border border-[#D88C72]/60">
                    <Columns3 className="w-3.5 h-3.5 text-[#A44A3F]" />
                    <span>{col.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* The 4 Columns Container with 6 Benches in Each Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {columnsList.map((col) => (
                <div
                  key={col.colNum}
                  className="space-y-3 bg-white/80 p-3 rounded-2xl border border-[#D88C72]/50 shadow-xs relative"
                >
                  {/* Column Label & Counter */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#D88C72]/30 text-xs font-bold text-[#6B2F2F]">
                    <span>COLUMN {col.colNum}</span>
                    <span className="text-[#A44A3F]">{col.benches.length} Benches (Rows 1 - 6)</span>
                  </div>

                  {/* 6 Benches vertically in this column */}
                  {col.benches.map((bench, rowIdx) => {
                    const isPulse = highlightedBench === bench.benchNumber;
                    const rowNumber = bench.rowInColumn || rowIdx + 1;

                    return (
                      <div
                        id={`bench-card-${currentRoom.roomId}-${bench.benchNumber}`}
                        key={bench.benchNumber}
                        className={`bg-[#FAF4F0]/60 rounded-xl border p-3 shadow-xs transition-all ${
                          isPulse
                            ? 'border-[#6B2F2F] ring-4 ring-[#A44A3F]/40 scale-102 bg-[#F4D6C6]/60 shadow-md'
                            : 'border-[#D88C72]/50 hover:border-[#6B2F2F]'
                        }`}
                      >
                        {/* Bench Header: Row & Bench # */}
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#D88C72]/30 text-[11px]">
                          <div className="flex items-center gap-1.5 font-extrabold text-[#6B2F2F]">
                            <Armchair className="w-3.5 h-3.5 text-[#A44A3F]" />
                            <span>BENCH {bench.benchNumber.toString().padStart(2, '0')}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-[#F4D6C6] text-[#6B2F2F] border border-[#D88C72]/50">
                            Row {rowNumber}
                          </span>
                        </div>

                        {/* The 2 Seats on the Bench */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          
                          {/* Seat 1 (Left - Branch A) */}
                          {bench.leftSeat ? (
                            <div
                              onClick={() =>
                                setAdmitStudent({
                                  student: bench.leftSeat!,
                                  roomNumber: currentRoom.roomNumber,
                                  block: currentRoom.block,
                                  benchNumber: bench.benchNumber,
                                  columnNumber: col.colNum,
                                  rowInColumn: rowNumber,
                                  position: 'Seat 1 (Left)'
                                })
                              }
                              className={`p-2 rounded-lg border cursor-pointer hover:shadow-xs transition-all bg-white hover:bg-[#F4D6C6]/30 ${getBranchTheme(bench.leftSeat.branch).border}`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[9px] font-bold text-[#A44A3F]">SEAT 1 (L)</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${getBranchTheme(bench.leftSeat.branch).badge}`}>
                                  {bench.leftSeat.branch}
                                </span>
                              </div>
                              <div className="font-mono font-bold text-[#6B2F2F] text-xs truncate">
                                {bench.leftSeat.regNo}
                              </div>
                              <div className="text-[11px] font-semibold text-[#3D2222] truncate mt-0.5">
                                {bench.leftSeat.name}
                              </div>
                              <div className="text-[10px] text-[#A44A3F] mt-0.5">
                                Sec {bench.leftSeat.section}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg border border-dashed border-[#D88C72] bg-white/70 text-center flex flex-col items-center justify-center min-h-[68px]">
                              <span className="text-[9px] font-bold text-[#A44A3F]">SEAT 1 (L)</span>
                              <span className="text-[10px] font-semibold text-[#A44A3F] mt-1">VACANT</span>
                            </div>
                          )}

                          {/* Seat 2 (Right - Branch B) */}
                          {bench.rightSeat ? (
                            <div
                              onClick={() =>
                                setAdmitStudent({
                                  student: bench.rightSeat!,
                                  roomNumber: currentRoom.roomNumber,
                                  block: currentRoom.block,
                                  benchNumber: bench.benchNumber,
                                  columnNumber: col.colNum,
                                  rowInColumn: rowNumber,
                                  position: 'Seat 2 (Right)'
                                })
                              }
                              className={`p-2 rounded-lg border cursor-pointer hover:shadow-xs transition-all bg-white hover:bg-[#F4D6C6]/30 ${getBranchTheme(bench.rightSeat.branch).border}`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[9px] font-bold text-[#A44A3F]">SEAT 2 (R)</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${getBranchTheme(bench.rightSeat.branch).badge}`}>
                                  {bench.rightSeat.branch}
                                </span>
                              </div>
                              <div className="font-mono font-bold text-[#6B2F2F] text-xs truncate">
                                {bench.rightSeat.regNo}
                              </div>
                              <div className="text-[11px] font-semibold text-[#3D2222] truncate mt-0.5">
                                {bench.rightSeat.name}
                              </div>
                              <div className="text-[10px] text-[#A44A3F] mt-0.5">
                                Sec {bench.rightSeat.section}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg border border-dashed border-[#D88C72] bg-white/70 text-center flex flex-col items-center justify-center min-h-[68px]">
                              <span className="text-[9px] font-bold text-[#A44A3F]">SEAT 2 (R)</span>
                              <span className="text-[10px] font-semibold text-[#A44A3F] mt-1">VACANT</span>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="bg-white p-3.5 rounded-xl border border-[#D88C72]/50 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B2F2F]">
              <span className="font-bold">Seating Legend & Hall Setup:</span>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#6B2F2F]"></span>
                  <span>Branch 1 (Seat 1 - Left)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#A44A3F]"></span>
                  <span>Branch 2 (Seat 2 - Right)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border border-dashed border-[#D88C72] bg-[#FAF4F0]"></span>
                  <span>Vacant Seat</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#3D2222] font-semibold">
                  <span>3 Columns × 8 Benches = 24 Benches (48 Seats)</span>
                </span>
              </div>
              <span className="text-[11px] text-[#A44A3F] italic">
                *Click any bench seat to view Candidate Hall Admit Slip
              </span>
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* CANDIDATE ADMIT SLIP MODAL */}
      {/* ======================================================== */}
      {admitStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#D88C72] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="bg-[#6B2F2F] text-[#FAF4F0] p-5 flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm tracking-wide text-white">
                  EXAM SEAT ADMIT SLIP
                </h4>
                <p className="text-[11px] text-[#F4D6C6]">
                  {examDetails.examName} ({examDetails.examType || 'Semester'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdmitStudent(null)}
                className="text-[#F4D6C6] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-b border-[#D88C72]/30 pb-3">
                <span className="text-[10px] text-[#A44A3F] font-bold uppercase tracking-wider block">Candidate Name</span>
                <span className="text-base font-bold text-[#6B2F2F] block mt-0.5">{admitStudent.student.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-[#A44A3F] font-bold uppercase tracking-wider block">Register No</span>
                  <span className="font-mono font-bold text-[#6B2F2F] text-sm block mt-0.5">{admitStudent.student.regNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A44A3F] font-bold uppercase tracking-wider block">Branch & Section</span>
                  <span className="font-bold text-[#3D2222] text-sm block mt-0.5">{admitStudent.student.branch} (Sec {admitStudent.student.section})</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF4F0] rounded-xl border border-[#D88C72] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#3D2222]/80">College Block:</span>
                  <strong className="text-[#6B2F2F]">{admitStudent.block}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3D2222]/80">Assigned Hall:</span>
                  <strong className="text-[#6B2F2F]">Room {admitStudent.roomNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3D2222]/80">Column Position:</span>
                  <strong className="text-[#A44A3F]">Column {admitStudent.columnNumber || 1}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3D2222]/80">Row & Bench Number:</span>
                  <strong className="text-[#A44A3F]">Row {admitStudent.rowInColumn || 1} (Bench #{admitStudent.benchNumber})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3D2222]/80">Seat Position:</span>
                  <strong className="text-[#6B2F2F] font-bold">{admitStudent.position}</strong>
                </div>
              </div>

              <div className="text-[11px] text-[#3D2222]/70">
                Date: {examDetails.examDate} • Session: {examDetails.session}
              </div>
            </div>

            <div className="p-4 bg-[#FAF4F0] border-t border-[#D88C72]/40 flex justify-end">
              <button
                type="button"
                onClick={() => setAdmitStudent(null)}
                className="px-4 py-2 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
