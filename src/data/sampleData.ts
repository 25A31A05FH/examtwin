/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExamDetails, Room, Student, BranchCohort, BranchPairing } from '../types';

export const POPULAR_BRANCHES = [
  'CSE',
  'ECE',
  'EEE',
  'IT',
  'DTS',
  'Mechanical',
  'Civil',
  'Cybersecurity'
];

export const COLLEGE_BLOCKS = [
  'Main Block (CSE)',
  'Tech Block',
  'Civil Block',
  'ECE Block'
] as const;

export const INITIAL_EXAM_DETAILS: ExamDetails = {
  id: 'exam-setup',
  examName: '',
  examType: 'Semester',
  examDate: '',
  academicYear: '',
  bTechYear: '',
  semester: '',
  session: '',
  createdAt: ''
};

// Helper to generate 30 rooms for a specific block (10 rooms per floor across 3 floors)
export function generateBlockRooms(blockName: string, prefix: string): Room[] {
  const rooms: Room[] = [];
  // 30 rooms distributed across floors 1 to 3
  // Floor 1: 10 rooms (101 - 110)
  // Floor 2: 10 rooms (201 - 210)
  // Floor 3: 10 rooms (301 - 310)
  // Total: 10 + 10 + 10 = 30 rooms
  let roomCount = 0;
  const floorCounts = [10, 10, 10];

  floorCounts.forEach((countOnFloor, floorIdx) => {
    const floor = floorIdx + 1;
    for (let i = 1; i <= countOnFloor; i++) {
      roomCount++;
      const roomNumStr = `${floor}${i.toString().padStart(2, '0')}`;
      const roomNumber = `${prefix}-${roomNumStr}`;
      
      // Default active: false (no rooms active by default, officer must select)
      const isActiveByDefault = false;

      rooms.push({
        id: `room-${prefix.toLowerCase()}-${roomCount}`,
        block: blockName,
        roomNumber,
        floor,
        columns: 4,
        benchesPerColumn: 6,
        totalBenches: 24,
        studentsPerBench: 2,
        totalCapacity: 48,
        isActive: isActiveByDefault
      });
    }
  });

  return rooms;
}

// Generate full college room inventory: 4 blocks x 30 rooms = 120 rooms
export function generateAllCollegeRooms(): Room[] {
  return [
    ...generateBlockRooms('Main Block (CSE)', 'MB'),
    ...generateBlockRooms('Tech Block', 'TB'),
    ...generateBlockRooms('Civil Block', 'CV'),
    ...generateBlockRooms('ECE Block', 'EC'),
  ];
}

export const INITIAL_ROOMS: Room[] = generateAllCollegeRooms();

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Pooja', 'Karthik', 'Divya',
  'Aditya', 'Meera', 'Sai', 'Kavya', 'Harsh', 'Isha', 'Varun', 'Neha',
  'Gautam', 'Priya', 'Naveen', 'Rhea', 'Manish', 'Shreya', 'Abhishek', 'Swati',
  'Pranav', 'Tanvi', 'Surya', 'Anjali', 'Deepak', 'Bhavana', 'Sanjay', 'Keerthi',
  'Arjun', 'Pavani', 'Mohan', 'Sruthi', 'Tarun', 'Archana', 'Vishal', 'Apoorva'
];

const LAST_NAMES = [
  'Sharma', 'Reddy', 'Patel', 'Iyer', 'Kumar', 'Verma', 'Rao', 'Chowdary',
  'Nair', 'Singh', 'Gupta', 'Menon', 'Joshi', 'Bose', 'Pillai', 'Mishra'
];

const BRANCH_CODES: Record<string, string> = {
  CSE: '05',
  ECE: '04',
  EEE: '02',
  IT: '12',
  Mechanical: '03',
  Civil: '01',
  Cybersecurity: '61',
  DTS: '42'
};

export function generateRealisticStudents(
  branch: string,
  section: string,
  count: number,
  year = '3rd Year',
  semester = '5th Sem',
  startRoll = 1
): Student[] {
  const branchCode = BRANCH_CODES[branch] || '05';
  const students: Student[] = [];

  for (let i = 0; i < count; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3 + 1) % LAST_NAMES.length];
    const rollSuffix = (startRoll + i).toString().padStart(2, '0');
    // Format: 24A31A<branchCode><rollSuffix>, e.g., 24A31A0501 to 24A31A0524
    const regNo = `24A31A${branchCode}${rollSuffix}`;

    students.push({
      id: `${branch}-${section}-${rollSuffix}`,
      regNo,
      name: `${fn} ${ln}`,
      branch,
      year,
      semester,
      section
    });
  }

  return students;
}

// Initial cohorts empty - officer must add cohorts manually or upload students
export const INITIAL_BRANCH_COHORTS: BranchCohort[] = [];

// Initial pairings empty - generated from active cohorts
export const INITIAL_BRANCH_PAIRINGS: BranchPairing[] = [];

