/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  regNo: string;
  name: string;
  branch: string;
  year?: string;
  semester?: string;
  section: string;
}

export interface BranchCohort {
  id: string;
  branch: string;
  year: string;
  semester: string;
  section: string;
  studentCount: number;
  students: Student[];
  uploadedFileName?: string;
}

export interface BranchPairing {
  id: string;
  branchA: string;
  branchB: string;
  studentsPerRoomA: number; // default 24 (for 3 columns x 8 benches)
  studentsPerRoomB: number; // default 24 (for 3 columns x 8 benches)
}

export interface ExamDetails {
  id: string;
  examName: string;
  examType: 'Internal/Mid' | 'Semester' | 'Supplementary';
  examDate: string;
  academicYear: string;
  bTechYear: string; // '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
  semester: string;  // '1st Sem' | '2nd Sem' ... '8th Sem'
  session: 'Morning (09:30 AM – 12:30 PM)' | 'Afternoon (01:30 PM – 04:30 PM)' | '';
  createdAt: string;
}

export interface Room {
  id: string;
  block: string;
  roomNumber: string;
  floor: number;
  columns?: number; // default 4 columns
  benchesPerColumn?: number; // default 6 benches per column
  totalBenches: number; // default 24 (4 cols x 6 benches)
  studentsPerBench: number; // default 2
  totalCapacity: number; // default 48
  isActive: boolean;
}

export interface BenchSeat {
  benchNumber: number;
  columnNumber?: number; // 1, 2, 3, or 4
  rowInColumn?: number;  // 1 to 6
  leftSeat: Student | null;  // Branch A
  rightSeat: Student | null; // Branch B
}

export interface RoomAllocation {
  roomId: string;
  roomNumber: string;
  block: string;
  floor?: number;
  columns: number; // 4 columns
  benchesPerColumn: number; // 6 benches per column
  totalBenches: number;
  totalCapacity: number;
  branchA: string;
  branchB: string;
  branchACount: number;
  branchBCount: number;
  totalAllocated: number;
  benches: BenchSeat[];
}

export interface SeatingPlan {
  id: string;
  examDetails: ExamDetails;
  branchCohorts: BranchCohort[];
  branchPairings: BranchPairing[];
  sectionRule: 'mix' | 'separate';
  roomAllocations: RoomAllocation[];
  totalStudentsExpected: number;
  totalStudentsAllocated: number;
  unallocatedStudents: Student[];
  conflicts: string[];
  generatedAt: string;
}

export interface StudentSearchResult {
  student: Student;
  block: string;
  roomNumber: string;
  benchNumber: number;
  columnNumber?: number;
  rowInColumn?: number;
  position: 'Seat 1 (Left)' | 'Seat 2 (Right)';
}
