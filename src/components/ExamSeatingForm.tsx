/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Users,
  Plus,
  Trash2,
  Upload,
  Download,
  Armchair,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Building2,
  Clock,
  FileSpreadsheet,
  Columns3,
  Search,
  CheckSquare,
  Square,
  Lock,
  ShieldCheck
} from 'lucide-react';
import {
  ExamDetails,
  Room,
  BranchCohort,
  BranchPairing,
  SeatingPlan
} from '../types';
import { POPULAR_BRANCHES, COLLEGE_BLOCKS, generateRealisticStudents, generateBlockRooms } from '../data/sampleData';
import { parseStudentFile, downloadSampleStudentTemplate } from '../utils/exportUtils';
import { generateSeatingPlan } from '../utils/seatingGenerator';

interface ExamSeatingFormProps {
  initialExamDetails: ExamDetails;
  initialCohorts: BranchCohort[];
  initialPairings: BranchPairing[];
  initialRooms: Room[];
  initialSectionRule: 'mix' | 'separate';
  onGenerateSuccess: (plan: SeatingPlan) => void;
  isOfficerLoggedIn: boolean;
  officerName?: string;
  onOpenLoginPage: () => void;
  onOpenRegisterPage?: () => void;
  onNavigateToAllotment?: () => void;
}

export const ExamSeatingForm: React.FC<ExamSeatingFormProps> = ({
  initialExamDetails,
  initialCohorts,
  initialPairings,
  initialRooms,
  initialSectionRule,
  onGenerateSuccess,
  isOfficerLoggedIn,
  officerName,
  onOpenLoginPage,
  onOpenRegisterPage,
  onNavigateToAllotment
}) => {
  // Form State
  const [examDetails, setExamDetails] = useState<ExamDetails>(initialExamDetails);
  const [branchCohorts, setBranchCohorts] = useState<BranchCohort[]>(initialCohorts);
  const [branchPairings, setBranchPairings] = useState<BranchPairing[]>(initialPairings);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [sectionRule, setSectionRule] = useState<'mix' | 'separate'>(initialSectionRule);

  // Block & Room selection state
  const [selectedBlock, setSelectedBlock] = useState<string>('Main Block (CSE)');
  const [roomFilterFloor, setRoomFilterFloor] = useState<number | 'All'>('All');
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>('');

  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<Record<string, string>>({});

  // Calculations
  const totalStudents = branchCohorts.reduce((sum, c) => sum + (c.students?.length || c.studentCount || 0), 0);
  const activeRooms = rooms.filter(r => r.isActive);
  const totalCapacity = activeRooms.reduce((sum, r) => sum + r.totalCapacity, 0);

  // Cohort actions
  const handleAddCohort = () => {
    const existing = new Set(branchCohorts.map(c => c.branch));
    const nextBranch = POPULAR_BRANCHES.find(b => !existing.has(b)) || 'Cybersecurity';
    const newStudents = generateRealisticStudents(nextBranch, 'A', 24, examDetails.bTechYear, examDetails.semester, 1);

    const newCohort: BranchCohort = {
      id: `cohort-${Date.now()}`,
      branch: nextBranch,
      year: examDetails.bTechYear,
      semester: examDetails.semester,
      section: 'A',
      studentCount: 24,
      students: newStudents,
      uploadedFileName: `${nextBranch}_Sample_24.xlsx`
    };

    setBranchCohorts([...branchCohorts, newCohort]);
  };

  const handleRemoveCohort = (id: string) => {
    if (branchCohorts.length <= 1) {
      setValidationError('At least one branch cohort is required.');
      return;
    }
    setBranchCohorts(branchCohorts.filter(c => c.id !== id));
  };

  const handleUpdateCohort = (id: string, updates: Partial<BranchCohort>) => {
    setBranchCohorts(
      branchCohorts.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          if (updates.studentCount !== undefined && (!c.uploadedFileName || c.uploadedFileName.includes('Sample') || c.uploadedFileName.includes('Auto'))) {
            updated.students = generateRealisticStudents(
              updated.branch,
              updated.section,
              updates.studentCount,
              updated.year,
              updated.semester,
              1
            );
          }
          return updated;
        }
        return c;
      })
    );
  };

  const handleFileUpload = async (cohortId: string, file: File) => {
    try {
      setUploadNotice(prev => ({ ...prev, [cohortId]: 'Parsing file...' }));
      const cohort = branchCohorts.find(c => c.id === cohortId);
      const parsed = await parseStudentFile(
        file,
        cohort?.branch || 'CSE',
        cohort?.year || '3rd Year',
        cohort?.semester || '5th Sem',
        cohort?.section || 'A'
      );

      setBranchCohorts(
        branchCohorts.map(c => {
          if (c.id === cohortId) {
            return {
              ...c,
              studentCount: parsed.length,
              students: parsed,
              uploadedFileName: file.name
            };
          }
          return c;
        })
      );
      setUploadNotice(prev => ({ ...prev, [cohortId]: `✓ Loaded ${parsed.length} students` }));
    } catch (err: any) {
      setValidationError(`Upload error: ${err.message}`);
      setUploadNotice(prev => ({ ...prev, [cohortId]: 'Upload failed' }));
    }
  };

  const handleResetCohortStudents = (cohortId: string, count = 24) => {
    const c = branchCohorts.find(item => item.id === cohortId);
    if (!c) return;
    const stds = generateRealisticStudents(c.branch, c.section, count, c.year, c.semester, 101);
    handleUpdateCohort(cohortId, {
      studentCount: count,
      students: stds,
      uploadedFileName: `${c.branch}_Sample_${count}.xlsx`
    });
    setUploadNotice(prev => ({ ...prev, [cohortId]: `✓ Reset to ${count} students` }));
  };

  // Branch pairings
  const handleAddPairing = () => {
    const allBranches = Array.from(new Set(branchCohorts.map(c => c.branch)));
    const bA = allBranches[0] || 'CSE';
    const bB = allBranches[1] || allBranches[0] || 'ECE';

    setBranchPairings([
      ...branchPairings,
      {
        id: `pair-${Date.now()}`,
        branchA: bA,
        branchB: bB,
        studentsPerRoomA: 24,
        studentsPerRoomB: 24
      }
    ]);
  };

  const handleRemovePairing = (id: string) => {
    if (branchPairings.length <= 1) {
      setValidationError('At least one branch pairing is required.');
      return;
    }
    setBranchPairings(branchPairings.filter(p => p.id !== id));
  };

  const handleUpdatePairing = (id: string, updates: Partial<BranchPairing>) => {
    setBranchPairings(
      branchPairings.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Room actions for the selected block
  const handleToggleRoom = (roomId: string) => {
    setRooms(rooms.map(r => (r.id === roomId ? { ...r, isActive: !r.isActive } : r)));
  };

  const handleSelectAllInBlock = (blockName: string, active: boolean) => {
    setRooms(rooms.map(r => (r.block === blockName ? { ...r, isActive: active } : r)));
  };

  const handleQuickSelectDemo = (blockName: string, count = 2) => {
    let selectedCount = 0;
    setRooms(rooms.map(r => {
      if (r.block === blockName) {
        selectedCount++;
        return { ...r, isActive: selectedCount <= count };
      }
      return r;
    }));
  };

  // Submission & Generation with strict validation of EVERY detail
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isOfficerLoggedIn) {
      setValidationError('Access Denied: Only the Examination Officer is authorized to generate seating arrangements. Please log in.');
      onOpenLoginPage();
      return;
    }

    const missingFields: string[] = [];

    // Check Exam Name
    if (!examDetails.examName || !examDetails.examName.trim()) {
      missingFields.push('Exam Name / Title (e.g. B.Tech Regular End Examinations)');
    }

    // Check Exam Date
    if (!examDetails.examDate || !examDetails.examDate.trim()) {
      missingFields.push('Exam Date (Please select examination date)');
    }

    // Check Academic Year
    if (!examDetails.academicYear || !examDetails.academicYear.trim()) {
      missingFields.push('Academic Year (e.g. 2026-2027)');
    }

    // Check B.Tech Year
    if (!examDetails.bTechYear) {
      missingFields.push('B.Tech Year (Please select 1st, 2nd, 3rd, or 4th Year)');
    }

    // Check Semester
    if (!examDetails.semester) {
      missingFields.push('Semester (Please select 1st to 8th Semester)');
    }

    // Check Exam Session
    if (!examDetails.session) {
      missingFields.push('Exam Session (Please choose Morning or Afternoon session)');
    }

    // Check Branch Cohorts
    if (branchCohorts.length === 0) {
      missingFields.push('Student Branch Cohorts (At least one branch cohort must be configured. Click "+ Add Branch Cohort" or upload student Excel file)');
    } else {
      const invalidCohort = branchCohorts.find(
        c => !c.branch || (c.students?.length || c.studentCount || 0) <= 0
      );
      if (invalidCohort) {
        missingFields.push(`Student Count / Roster for branch ${invalidCohort.branch || 'unspecified'} (Must contain at least 1 student)`);
      }
    }

    // Check Examination Halls
    if (activeRooms.length === 0) {
      missingFields.push('Campus Exam Halls (Please select and activate at least one examination room from the blocks below)');
    } else if (totalCapacity < totalStudents) {
      missingFields.push(`Hall Capacity Shortage (Active rooms seat ${totalCapacity} students, but there are ${totalStudents} students configured. Please activate more examination halls)`);
    }

    // If any detail is missing, WARN THEM and DO NOT generate!
    if (missingFields.length > 0) {
      setValidationError(
        `Action Required: Please enter each and every detail in the form before generating seating:\n• ${missingFields.join('\n• ')}`
      );
      const errBox = document.getElementById('seating-form');
      if (errBox) {
        errBox.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsCalculating(true);

    try {
      const plan = generateSeatingPlan({
        examDetails,
        branchCohorts,
        branchPairings,
        rooms,
        sectionRule
      });

      setTimeout(() => {
        setIsCalculating(false);
        onGenerateSuccess(plan);
        if (onNavigateToAllotment) {
          onNavigateToAllotment();
        } else {
          const resEl = document.getElementById('seating-results');
          if (resEl) {
            resEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 400);
    } catch (err: any) {
      setIsCalculating(false);
      setValidationError(err.message || 'Error occurred while generating seating arrangement.');
    }
  };

  const allDistinctBranches = Array.from(new Set(branchCohorts.map(c => c.branch)));

  // Rooms belonging to the currently selected block
  const blockRooms = rooms.filter(r => r.block === selectedBlock);
  const activeRoomsInSelectedBlock = blockRooms.filter(r => r.isActive);

  // Filtered rooms in current block by floor and search query
  const displayedBlockRooms = blockRooms.filter(r => {
    const matchesFloor = roomFilterFloor === 'All' || r.floor === roomFilterFloor;
    const matchesQuery = !roomSearchQuery.trim() || r.roomNumber.toLowerCase().includes(roomSearchQuery.toLowerCase().trim());
    return matchesFloor && matchesQuery;
  });

  return (
    <section id="seating-form" className="py-8 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4D6C6] border border-[#D88C72]/60 text-[#6B2F2F] text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-[#A44A3F]" />
            <span>Block & Room Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#6B2F2F] tracking-tight">
            Exam Seating Generation Form
          </h2>
          <p className="text-xs sm:text-sm text-[#3D2222]/80">
            Configure examination parameters, student cohorts, branch combinations, and select rooms block-by-block.
          </p>
        </div>

        {validationError && (
          <div className="mb-6 p-5 rounded-2xl bg-[#F4D6C6] border-2 border-[#A44A3F] text-xs text-[#6B2F2F] shadow-md space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-black text-sm text-[#6B2F2F]">
              <AlertTriangle className="w-5 h-5 text-[#A44A3F] shrink-0" />
              <span>Incomplete Examination Form — Action Required</span>
            </div>
            <div className="pl-7 text-xs font-semibold whitespace-pre-line leading-relaxed text-[#6B2F2F]">
              {validationError}
            </div>
          </div>
        )}

        {/* Officer Gate Notice: Highlight that this form is strictly for the Exam Officer */}
        {!isOfficerLoggedIn ? (
          <div className="py-16 px-4 bg-white rounded-3xl border-2 border-[#D88C72] shadow-md text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF4F0] border-2 border-[#D88C72] mx-auto flex items-center justify-center text-[#6B2F2F] shadow-xs">
              <Lock className="w-8 h-8 text-[#A44A3F]" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#A44A3F] bg-[#F4D6C6] px-3 py-0.5 rounded-full border border-[#D88C72]/60">
                Restricted Officer Module
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#6B2F2F] uppercase">
                Officer Authorization Required
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                Every feature on this website, including cohort setup, hall allocation, and the anti-copy seating generation algorithm, is strictly accessible only when the Examination Officer registers.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onOpenLoginPage}
                className="px-5 py-2.5 bg-white hover:bg-[#F4D6C6] text-[#6B2F2F] font-bold text-xs rounded-xl border border-[#D88C72]/60 shadow-2xs cursor-pointer transition-colors"
              >
                Sign In with Officer Account
              </button>
              {onOpenRegisterPage && (
                <button
                  type="button"
                  onClick={onOpenRegisterPage}
                  className="px-6 py-2.5 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white font-bold text-xs rounded-xl shadow-md shadow-[#6B2F2F]/20 cursor-pointer transition-all"
                >
                  Register as Examination Officer &rarr;
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 rounded-2xl bg-white border border-[#D88C72] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6B2F2F] text-[#F4D6C6] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#F4D6C6]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#6B2F2F] text-xs sm:text-sm">
                      {officerName || 'Dr. K. V. Raman'}
                    </span>
                    <span className="text-[10px] font-bold bg-[#F4D6C6] text-[#6B2F2F] px-2 py-0.2 rounded border border-[#D88C72]/60">
                      Chief Controller of Examinations
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A44A3F] font-semibold block">
                    Examination Officer Session Active • Full Allotment Privileges Enabled
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#6B2F2F] bg-[#FAF4F0] px-3 py-1 rounded-lg border border-[#D88C72]/50 self-start sm:self-auto">
                ✓ Ready to Generate Seating
              </span>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#D88C72]/50 shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* ======================================================== */}
          {/* PART 1: EXAM DETAILS */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#D88C72]/30">
              <span className="w-6 h-6 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-[#6B2F2F] text-sm sm:text-base">
                Examination Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Exam Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-[#6B2F2F]">Exam Name *</label>
                <input
                  type="text"
                  required
                  value={examDetails.examName}
                  onChange={e => setExamDetails({ ...examDetails, examName: e.target.value })}
                  placeholder="e.g. B.Tech Regular End Examinations"
                  className="w-full px-3 py-2 bg-[#FAF4F0]/60 border border-[#D88C72]/50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A44A3F]/30 focus:border-[#6B2F2F] text-[#3D2222]"
                />
              </div>

              {/* Exam Type (Internal/Mid, Semester, Supplementary) */}
              <div className="space-y-1">
                <label className="font-semibold text-[#6B2F2F]">Exam Type *</label>
                <select
                  value={examDetails.examType}
                  onChange={e => setExamDetails({ ...examDetails, examType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF4F0]/60 border border-[#D88C72]/50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A44A3F]/30 focus:border-[#6B2F2F] text-[#3D2222] font-medium"
                >
                  <option value="Semester">Semester End Regular</option>
                  <option value="Internal/Mid">Internal / Mid Examination</option>
                  <option value="Supplementary">Supplementary Examination</option>
                </select>
              </div>

              {/* Exam Date */}
              <div className="space-y-1">
                <label className="font-semibold text-[#6B2F2F]">Exam Date *</label>
                <input
                  type="date"
                  required
                  value={examDetails.examDate}
                  onChange={e => setExamDetails({ ...examDetails, examDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF4F0]/60 border border-[#D88C72]/50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A44A3F]/30 focus:border-[#6B2F2F] text-[#3D2222]"
                />
              </div>

              {/* Academic Year */}
              <div className="space-y-1">
                <label className="font-semibold text-[#6B2F2F]">Academic Year *</label>
                <input
                  type="text"
                  required
                  value={examDetails.academicYear}
                  onChange={e => setExamDetails({ ...examDetails, academicYear: e.target.value })}
                  placeholder="e.g. 2026-2027"
                  className="w-full px-3 py-2 bg-[#FAF4F0]/60 border border-[#D88C72]/50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A44A3F]/30 focus:border-[#6B2F2F] text-[#3D2222]"
                />
              </div>

              {/* B.Tech Year */}
              <div className="space-y-1">
                <label className="font-semibold text-[#6B2F2F]">B.Tech Year *</label>
                <select
                  value={examDetails.bTechYear}
                  onChange={e => setExamDetails({ ...examDetails, bTechYear: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF4F0]/60 border border-[#D88C72]/50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A44A3F]/30 focus:border-[#6B2F2F] text-[#3D2222]"
                >
                  <option value="">-- Select B.Tech Year --</option>
                  <option value="1st Year">1st Year B.Tech</option>
                  <option value="2nd Year">2nd Year B.Tech</option>
                  <option value="3rd Year">3rd Year B.Tech</option>
                  <option value="4th Year">4th Year B.Tech</option>
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-1">
                <label className="font-semibold text-[#6B2F2F]">Semester *</label>
                <select
                  value={examDetails.semester}
                  onChange={e => setExamDetails({ ...examDetails, semester: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF4F0]/60 border border-[#D88C72]/50 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A44A3F]/30 focus:border-[#6B2F2F] text-[#3D2222]"
                >
                  <option value="">-- Select Semester --</option>
                  <option value="1st Sem">1st Semester</option>
                  <option value="2nd Sem">2nd Semester</option>
                  <option value="3rd Sem">3rd Semester</option>
                  <option value="4th Sem">4th Semester</option>
                  <option value="5th Sem">5th Semester</option>
                  <option value="6th Sem">6th Semester</option>
                  <option value="7th Sem">7th Semester</option>
                  <option value="8th Sem">8th Semester</option>
                </select>
              </div>

              {/* Session: Morning or Afternoon */}
              <div className="space-y-1">
                <label className="font-semibold text-[#6B2F2F]">Session *</label>
                <div className="flex gap-2">
                  <label className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg border cursor-pointer font-semibold transition-all ${
                    examDetails.session.startsWith('Morning')
                      ? 'border-[#6B2F2F] bg-[#F4D6C6] text-[#6B2F2F] shadow-xs'
                      : 'border-[#D88C72]/40 bg-[#FAF4F0] text-[#3D2222]/80 hover:bg-[#F4D6C6]/40'
                  }`}>
                    <input
                      type="radio"
                      name="session"
                      className="hidden"
                      checked={examDetails.session.startsWith('Morning')}
                      onChange={() => setExamDetails({ ...examDetails, session: 'Morning (09:30 AM – 12:30 PM)' })}
                    />
                    <span>Morning</span>
                  </label>

                  <label className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg border cursor-pointer font-semibold transition-all ${
                    examDetails.session.startsWith('Afternoon')
                      ? 'border-[#6B2F2F] bg-[#F4D6C6] text-[#6B2F2F] shadow-xs'
                      : 'border-[#D88C72]/40 bg-[#FAF4F0] text-[#3D2222]/80 hover:bg-[#F4D6C6]/40'
                  }`}>
                    <input
                      type="radio"
                      name="session"
                      className="hidden"
                      checked={examDetails.session.startsWith('Afternoon')}
                      onChange={() => setExamDetails({ ...examDetails, session: 'Afternoon (01:30 PM – 04:30 PM)' })}
                    />
                    <span>Afternoon</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* PART 2: STUDENTS DETAILS & EXCEL UPLOAD */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D88C72]/30">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h3 className="font-bold text-[#6B2F2F] text-sm sm:text-base">
                    Students Details & Excel / CSV Upload
                  </h3>
                  <p className="text-[11px] text-[#3D2222]/70">
                    Enter branches, sections, candidate counts, and upload Excel files with student names & register numbers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSampleStudentTemplate('CSE')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6B2F2F] bg-[#FAF4F0] hover:bg-[#F4D6C6]/80 border border-[#D88C72]/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#A44A3F]" />
                  <span>Download Excel Template</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCohort}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#6B2F2F] hover:bg-[#A44A3F] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F4D6C6]" />
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            {/* List of Branch Cohorts */}
            <div className="space-y-3">
              {branchCohorts.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-[#D88C72] bg-[#FAF4F0]/60 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4D6C6] text-[#6B2F2F] flex items-center justify-center mx-auto border border-[#D88C72]">
                    <Users className="w-6 h-6 text-[#A44A3F]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#6B2F2F]">No Student Branch Cohorts Added Yet</h4>
                    <p className="text-xs text-stone-600 max-w-md mx-auto">
                      Each and every detail must be entered manually by the officer. Please click &quot;+ Add Branch&quot; or upload an Excel student sheet to configure cohorts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCohort}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#6B2F2F] hover:bg-[#A44A3F] rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#F4D6C6]" />
                    <span>+ Add Branch Cohort</span>
                  </button>
                </div>
              ) : (
                branchCohorts.map((cohort, idx) => (
                <div
                  key={cohort.id}
                  className="p-4 rounded-xl border border-[#D88C72]/40 bg-[#FAF4F0]/50 hover:bg-white hover:border-[#A44A3F] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#6B2F2F] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#F4D6C6] text-[#6B2F2F] text-[10px] font-black flex items-center justify-center border border-[#D88C72]">
                        {idx + 1}
                      </span>
                      Cohort #{idx + 1}: {cohort.branch} (Sec {cohort.section})
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleResetCohortStudents(cohort.id, 24)}
                        className="text-[11px] text-[#A44A3F] hover:text-[#6B2F2F] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-[#A44A3F]" />
                        Generate 24 Sample Students
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveCohort(cohort.id)}
                        className="text-[#A44A3F]/70 hover:text-[#6B2F2F] p-1 rounded transition-colors"
                        title="Delete cohort"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    
                    {/* Branch */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B2F2F]">Branch Name</label>
                      <select
                        value={cohort.branch}
                        onChange={e => handleUpdateCohort(cohort.id, { branch: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D88C72]/50 rounded-lg font-medium text-[#3D2222]"
                      >
                        {POPULAR_BRANCHES.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Section */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B2F2F]">Section</label>
                      <input
                        type="text"
                        value={cohort.section}
                        onChange={e => handleUpdateCohort(cohort.id, { section: e.target.value.toUpperCase() })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D88C72]/50 rounded-lg font-bold text-[#6B2F2F] uppercase"
                        placeholder="A"
                      />
                    </div>

                    {/* Count */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B2F2F]">No. of Students</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={cohort.studentCount}
                        onChange={e => handleUpdateCohort(cohort.id, { studentCount: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D88C72]/50 rounded-lg font-bold text-[#6B2F2F]"
                      />
                    </div>

                    {/* Excel File Upload */}
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B2F2F]">Excel / CSV File</label>
                      <label className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white border border-dashed border-[#D88C72] hover:border-[#6B2F2F] rounded-lg text-[#6B2F2F] hover:bg-[#F4D6C6]/40 cursor-pointer text-xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#A44A3F]" />
                        <span className="truncate max-w-[100px]">
                          {cohort.uploadedFileName || 'Upload File'}
                        </span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(cohort.id, f);
                          }}
                        />
                      </label>
                    </div>

                  </div>

                  {/* Upload notice / status */}
                  <div className="flex items-center justify-between text-[11px] text-[#3D2222]/70">
                    <span>
                      Active Roster: <strong className="text-[#6B2F2F]">{cohort.students.length} students loaded</strong> ({cohort.students[0]?.regNo || '—'} ... {cohort.students[cohort.students.length - 1]?.regNo || '—'})
                    </span>
                    {uploadNotice[cohort.id] && (
                      <span className="text-[#A44A3F] font-bold">{uploadNotice[cohort.id]}</span>
                    )}
                  </div>
                </div>
              )))}
            </div>

            {/* Total count callout */}
            <div className="p-3 bg-[#F4D6C6]/60 rounded-xl border border-[#D88C72]/60 flex items-center justify-between text-xs text-[#6B2F2F] font-semibold">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A44A3F]" />
                Total Registered Candidates: <strong>{totalStudents} Students</strong> across {branchCohorts.length} cohorts
              </span>
              <span className="text-[#A44A3F] text-[11px] font-bold">
                Ready for branch pairing (24 students/room)
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PART 3: BRANCH COMBINATION & SECTION SETTINGS */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D88C72]/30">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h3 className="font-bold text-[#6B2F2F] text-sm sm:text-base">
                    Branch Combination & Section Rules
                  </h3>
                  <p className="text-[11px] text-[#3D2222]/70">
                    Pairs two branches in each room (24 from Branch 1 + 24 from Branch 2 across 3 columns × 8 benches)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddPairing}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#6B2F2F] bg-[#FAF4F0] hover:bg-[#F4D6C6] border border-[#D88C72]/60 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#A44A3F]" />
                <span>Add Combination</span>
              </button>
            </div>

            {/* Pairings */}
            <div className="space-y-2.5">
              {branchPairings.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-[#D88C72] bg-[#FAF4F0]/60 text-center text-xs text-stone-600">
                  <span>Automatic pairing will pair candidate branches alternately across benches, or click &quot;+ Add Combination&quot; to specify branch pairs.</span>
                </div>
              ) : (
                branchPairings.map((pair, idx) => (
                  <div
                    key={pair.id}
                    className="p-3.5 rounded-xl border border-[#D88C72]/40 bg-[#FAF4F0]/40 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#6B2F2F]">Pair #{idx + 1}:</span>
                      
                      <select
                        value={pair.branchA}
                        onChange={e => handleUpdatePairing(pair.id, { branchA: e.target.value })}
                        className="px-2.5 py-1 bg-white border border-[#D88C72] rounded-lg font-bold text-[#6B2F2F]"
                      >
                        {allDistinctBranches.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>

                      <span className="font-black text-[#A44A3F]">+</span>

                      <select
                        value={pair.branchB}
                        onChange={e => handleUpdatePairing(pair.id, { branchB: e.target.value })}
                        className="px-2.5 py-1 bg-white border border-[#D88C72] rounded-lg font-bold text-[#A44A3F]"
                      >
                        {allDistinctBranches.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#3D2222]/80">
                        Standard Room Allocation: <strong className="text-[#6B2F2F]">24 {pair.branchA} + 24 {pair.branchB} = 48 Seats (4 Columns × 6 Benches)</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemovePairing(pair.id)}
                        className="text-[#A44A3F] hover:text-[#6B2F2F] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Section Settings Toggle */}
            <div className="pt-2">
              <label className="font-semibold text-[#6B2F2F] text-xs block mb-2">
                Section Distribution Rule:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    sectionRule === 'separate'
                      ? 'border-[#6B2F2F] bg-[#F4D6C6]/60 ring-2 ring-[#A44A3F]/20'
                      : 'border-[#D88C72]/40 bg-[#FAF4F0]/40 hover:bg-[#F4D6C6]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="sectionRule"
                    checked={sectionRule === 'separate'}
                    onChange={() => setSectionRule('separate')}
                    className="mt-0.5 accent-[#6B2F2F]"
                  />
                  <div>
                    <div className="font-bold text-[#6B2F2F] text-xs">
                      Keep Sections Separate (Default)
                    </div>
                    <p className="text-[11px] text-[#3D2222]/70 mt-0.5">
                      Allocate Section A sequentially, then proceed to Section B.
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    sectionRule === 'mix'
                      ? 'border-[#6B2F2F] bg-[#F4D6C6]/60 ring-2 ring-[#A44A3F]/20'
                      : 'border-[#D88C72]/40 bg-[#FAF4F0]/40 hover:bg-[#F4D6C6]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="sectionRule"
                    checked={sectionRule === 'mix'}
                    onChange={() => setSectionRule('mix')}
                    className="mt-0.5 accent-[#6B2F2F]"
                  />
                  <div>
                    <div className="font-bold text-[#6B2F2F] text-xs">
                      Mix Students from Different Sections
                    </div>
                    <p className="text-[11px] text-[#3D2222]/70 mt-0.5">
                      Interleave students across sections uniformly.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PART 4: ROOM DETAILS & BLOCK SELECTION (30 ROOMS EACH) */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D88C72]/30">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#6B2F2F] text-[#F4D6C6] font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <div>
                  <h3 className="font-bold text-[#6B2F2F] text-sm sm:text-base">
                    Room Details & Available Halls
                  </h3>
                  <p className="text-[11px] text-[#3D2222]/70">
                    Select block first (Main Block (CSE), Tech Block, Civil Block, ECE Block - 30 rooms each), then choose rooms for the exam
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#6B2F2F] bg-[#F4D6C6] px-2.5 py-1 rounded-lg border border-[#D88C72]/60 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A44A3F]" />
                  <span>{activeRooms.length} Rooms Active ({totalCapacity} Seats)</span>
                </span>
              </div>
            </div>

            {/* Step 1: Block Selection Cards (The 4 Blocks) */}
            <div>
              <label className="text-xs font-bold text-[#6B2F2F] block mb-2">
                Step 1: Choose Block to View & Select Rooms:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {COLLEGE_BLOCKS.map(blockName => {
                  const isSelected = selectedBlock === blockName;
                  const countInBlock = rooms.filter(r => r.block === blockName && r.isActive).length;
                  const totalInBlock = rooms.filter(r => r.block === blockName).length;

                  return (
                    <div
                      key={blockName}
                      onClick={() => setSelectedBlock(blockName)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#6B2F2F] bg-[#F4D6C6]/80 ring-2 ring-[#6B2F2F]/30 shadow-sm'
                          : 'border-[#D88C72]/50 bg-[#FAF4F0]/60 hover:bg-[#F4D6C6]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-[#6B2F2F] flex items-center gap-1.5">
                          <Building2 className={`w-4 h-4 ${isSelected ? 'text-[#6B2F2F]' : 'text-[#A44A3F]'}`} />
                          {blockName}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#6B2F2F]" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#3D2222]/80 mt-2">
                        <span>Rooms Active:</span>
                        <strong className={countInBlock > 0 ? 'text-[#6B2F2F]' : 'text-[#3D2222]/60'}>
                          {countInBlock} / {totalInBlock}
                        </strong>
                      </div>

                      <div className="w-full bg-[#FAF4F0] rounded-full h-1.5 overflow-hidden mt-1.5 border border-[#D88C72]/30">
                        <div
                          className="bg-[#6B2F2F] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(countInBlock / totalInBlock) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Room Selection in Selected Block */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#D88C72]/60 bg-[#FAF4F0]/40 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D88C72]/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#6B2F2F]">
                      Step 2: Select Examination Rooms in {selectedBlock}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#6B2F2F] text-white">
                      30 Rooms Total
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3D2222]/70 mt-0.5">
                    Currently selected in this block: <strong className="text-[#6B2F2F]">{activeRoomsInSelectedBlock.length} rooms ({activeRoomsInSelectedBlock.length * 48} seats)</strong>
                  </p>
                </div>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSelectDemo(selectedBlock, 2)}
                    className="px-2.5 py-1 bg-[#F4D6C6] hover:bg-[#D88C72] text-[#6B2F2F] border border-[#D88C72] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Quick Select 2 Rooms
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectAllInBlock(selectedBlock, true)}
                    className="px-2.5 py-1 bg-white hover:bg-[#F4D6C6]/50 text-[#6B2F2F] border border-[#D88C72]/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Select All 30
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectAllInBlock(selectedBlock, false)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#A44A3F] border border-[#D88C72]/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear Block
                  </button>
                </div>
              </div>

              {/* Filter by Floor & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                
                {/* Floor filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <span className="text-[#6B2F2F] font-bold shrink-0 mr-1">Floor:</span>
                  <button
                    type="button"
                    onClick={() => setRoomFilterFloor('All')}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                      roomFilterFloor === 'All'
                        ? 'bg-[#6B2F2F] text-white'
                        : 'bg-white text-[#6B2F2F] border border-[#D88C72]/50 hover:bg-[#F4D6C6]'
                    }`}
                  >
                    All Floors (30)
                  </button>
                  {[1, 2, 3].map(fl => {
                    const floorCount = blockRooms.filter(r => r.floor === fl).length;
                    return (
                      <button
                        key={fl}
                        type="button"
                        onClick={() => setRoomFilterFloor(fl)}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                          roomFilterFloor === fl
                            ? 'bg-[#6B2F2F] text-white'
                            : 'bg-white text-[#6B2F2F] border border-[#D88C72]/50 hover:bg-[#F4D6C6]'
                        }`}
                      >
                        Floor {fl} ({floorCount})
                      </button>
                    );
                  })}
                </div>

                {/* Search room in block */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-[#A44A3F] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={roomSearchQuery}
                    onChange={e => setRoomSearchQuery(e.target.value)}
                    placeholder="Search room (e.g. 101)..."
                    className="w-full pl-8 pr-3 py-1 bg-white border border-[#D88C72]/60 rounded-lg text-xs text-[#3D2222] focus:outline-none focus:border-[#6B2F2F]"
                  />
                </div>
              </div>

              {/* 58 Rooms Grid for Selected Block */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto p-1">
                {displayedBlockRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => handleToggleRoom(room.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      room.isActive
                        ? 'border-[#6B2F2F] bg-[#6B2F2F] text-white shadow-xs'
                        : 'border-[#D88C72]/40 bg-white hover:border-[#A44A3F] text-[#3D2222]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono font-black text-xs ${room.isActive ? 'text-white' : 'text-[#6B2F2F]'}`}>
                        {room.roomNumber}
                      </span>
                      {room.isActive ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#F4D6C6]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#D88C72]" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/20">
                      <span className={room.isActive ? 'text-[#F4D6C6]' : 'text-[#A44A3F]'}>
                        Floor {room.floor}
                      </span>
                      <span className={room.isActive ? 'text-white font-bold' : 'text-[#3D2222]/80 font-semibold'}>
                        48 Seats
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Helper text */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#3D2222]/70 pt-2 border-t border-[#D88C72]/30">
                <span>
                  Showing {displayedBlockRooms.length} of {blockRooms.length} rooms in <strong className="text-[#6B2F2F]">{selectedBlock}</strong>
                </span>
                <span className="font-semibold text-[#6B2F2F]">
                  Each room arranged in 3 columns × 8 benches = 24 benches (48 seats)
                </span>
              </div>

            </div>

            {/* Total college allocation summary banner */}
            <div className="p-3 bg-[#F4D6C6]/60 rounded-xl border border-[#D88C72]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#6B2F2F] font-bold">
                College Capacity Status: {activeRooms.length} Rooms Activated ({totalCapacity} Total Seats)
              </span>
              <span className="text-[#A44A3F] font-bold">
                {totalCapacity >= totalStudents ? '✓ Sufficient Capacity for All Candidates' : '⚠️ Shortage: Select more rooms to accommodate all students'}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SUBMIT BUTTON */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-[#D88C72]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#3D2222]/80">
              <span className="font-bold text-[#6B2F2F]">Candidates:</span> {totalStudents} • <span className="font-bold text-[#6B2F2F]">Active Capacity:</span> {totalCapacity} seats ({activeRooms.length} rooms)
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="px-8 py-3.5 bg-[#6B2F2F] hover:bg-[#A44A3F] active:bg-[#6B2F2F] text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-[#6B2F2F]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#F4D6C6]" />
                  <span>Processing Automatic Allocations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F4D6C6]" />
                  <span>Generate Seating Arrangement</span>
                </>
              )}
            </button>
          </div>

        </form>
          </>
        )}

      </div>
    </section>
  );
};
