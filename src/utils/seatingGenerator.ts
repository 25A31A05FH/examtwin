/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExamDetails,
  Room,
  Student,
  BranchCohort,
  BranchPairing,
  SeatingPlan,
  RoomAllocation,
  BenchSeat
} from '../types';

export interface GenerationParams {
  examDetails: ExamDetails;
  branchCohorts: BranchCohort[];
  branchPairings: BranchPairing[];
  rooms: Room[];
  sectionRule: 'mix' | 'separate';
}

export function generateSeatingPlan(params: GenerationParams): SeatingPlan {
  const { examDetails, branchCohorts, branchPairings, rooms, sectionRule } = params;

  // Filter available active rooms
  const activeRooms = rooms.filter(r => r.isActive);
  const conflicts: string[] = [];
  const allocatedStudentIds = new Set<string>();

  // Prepare student pools by branch
  const branchStudentPools: Record<string, Student[]> = {};

  branchCohorts.forEach(cohort => {
    if (!branchStudentPools[cohort.branch]) {
      branchStudentPools[cohort.branch] = [];
    }
    // Clone students
    const students = [...cohort.students];

    if (sectionRule === 'separate') {
      // Sort primarily by section then roll number
      students.sort((a, b) => {
        if (a.section !== b.section) return a.section.localeCompare(b.section);
        return a.regNo.localeCompare(b.regNo, undefined, { numeric: true });
      });
    } else {
      // Mixed: sort by roll number or interleaved
      students.sort((a, b) => a.regNo.localeCompare(b.regNo, undefined, { numeric: true }));
    }

    branchStudentPools[cohort.branch].push(...students);
  });

  const totalStudentsExpected = Object.values(branchStudentPools).reduce(
    (acc, list) => acc + list.length,
    0
  );

  const totalAvailableSeats = activeRooms.reduce((acc, r) => acc + r.totalCapacity, 0);

  if (totalAvailableSeats < totalStudentsExpected) {
    conflicts.push(
      `Insufficient Room Capacity: ${totalStudentsExpected} students need seating, but only ${totalAvailableSeats} seats are available in the selected ${activeRooms.length} active room(s).`
    );
  }

  const roomAllocations: RoomAllocation[] = [];
  let currentRoomIdx = 0;

  // Track remaining students per branch for consumption
  const remainingStudents: Record<string, Student[]> = {};
  Object.keys(branchStudentPools).forEach(br => {
    remainingStudents[br] = [...branchStudentPools[br]];
  });

  // 1. Process configured branch pairings
  for (const pair of branchPairings) {
    const { branchA, branchB } = pair;
    const poolA = remainingStudents[branchA] || [];
    const poolB = remainingStudents[branchB] || [];

    // Keep allocating rooms as long as either branch has students AND we have rooms
    while ((poolA.length > 0 || poolB.length > 0) && currentRoomIdx < activeRooms.length) {
      const room = activeRooms[currentRoomIdx];
      const columns = room.columns || 4;
      const benchesPerColumn = room.benchesPerColumn || 6;
      const benchesCount = room.totalBenches || (columns * benchesPerColumn);
      const benches: BenchSeat[] = [];

      let branchACount = 0;
      let branchBCount = 0;

      // Fill benches for this room (3 columns, 6 benches per column)
      for (let benchNum = 1; benchNum <= benchesCount; benchNum++) {
        let leftStudent: Student | null = null;
        let rightStudent: Student | null = null;

        const columnNumber = Math.floor((benchNum - 1) / benchesPerColumn) + 1;
        const rowInColumn = ((benchNum - 1) % benchesPerColumn) + 1;

        // Allocate Left Seat (Branch A)
        if (poolA.length > 0) {
          leftStudent = poolA.shift()!;
          allocatedStudentIds.add(leftStudent.id);
          branchACount++;
        }

        // Allocate Right Seat (Branch B)
        if (poolB.length > 0) {
          rightStudent = poolB.shift()!;
          allocatedStudentIds.add(rightStudent.id);
          branchBCount++;
        }

        benches.push({
          benchNumber: benchNum,
          columnNumber,
          rowInColumn,
          leftSeat: leftStudent,
          rightSeat: rightStudent
        });
      }

      roomAllocations.push({
        roomId: room.id,
        roomNumber: room.roomNumber,
        block: room.block,
        floor: room.floor,
        columns,
        benchesPerColumn,
        totalBenches: benchesCount,
        totalCapacity: room.totalCapacity,
        branchA,
        branchB,
        branchACount,
        branchBCount,
        totalAllocated: branchACount + branchBCount,
        benches
      });

      currentRoomIdx++;
    }
  }

  // 2. Process any unpaired branches with remaining students
  const remainingBranches = Object.keys(remainingStudents).filter(
    br => remainingStudents[br].length > 0
  );

  while (remainingBranches.length > 0 && currentRoomIdx < activeRooms.length) {
    const branchA = remainingBranches[0];
    const branchB = remainingBranches[1] || branchA;

    const poolA = remainingStudents[branchA];
    const poolB = remainingStudents[branchB];
    const room = activeRooms[currentRoomIdx];
    const columns = room.columns || 4;
    const benchesPerColumn = room.benchesPerColumn || 6;
    const benchesCount = room.totalBenches || (columns * benchesPerColumn);
    const benches: BenchSeat[] = [];

    let branchACount = 0;
    let branchBCount = 0;

    for (let benchNum = 1; benchNum <= benchesCount; benchNum++) {
      let leftStudent: Student | null = null;
      let rightStudent: Student | null = null;

      const columnNumber = Math.floor((benchNum - 1) / benchesPerColumn) + 1;
      const rowInColumn = ((benchNum - 1) % benchesPerColumn) + 1;

      if (poolA && poolA.length > 0) {
        leftStudent = poolA.shift()!;
        allocatedStudentIds.add(leftStudent.id);
        branchACount++;
      }

      if (poolB && poolB.length > 0) {
        rightStudent = poolB.shift()!;
        allocatedStudentIds.add(rightStudent.id);
        branchBCount++;
      }

      benches.push({
        benchNumber: benchNum,
        columnNumber,
        rowInColumn,
        leftSeat: leftStudent,
        rightSeat: rightStudent
      });
    }

    roomAllocations.push({
      roomId: room.id,
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      columns,
      benchesPerColumn,
      totalBenches: benchesCount,
      totalCapacity: room.totalCapacity,
      branchA,
      branchB: branchB !== branchA ? branchB : 'Single Branch',
      branchACount,
      branchBCount,
      totalAllocated: branchACount + branchBCount,
      benches
    });

    currentRoomIdx++;

    for (let i = remainingBranches.length - 1; i >= 0; i--) {
      if (remainingStudents[remainingBranches[i]].length === 0) {
        remainingBranches.splice(i, 1);
      }
    }
  }

  // Check for any unallocated students
  const unallocatedStudents: Student[] = [];
  Object.values(remainingStudents).forEach(list => {
    unallocatedStudents.push(...list);
  });

  if (unallocatedStudents.length > 0) {
    const branchBreakdown: Record<string, number> = {};
    unallocatedStudents.forEach(s => {
      branchBreakdown[s.branch] = (branchBreakdown[s.branch] || 0) + 1;
    });

    const breakdownText = Object.entries(branchBreakdown)
      .map(([br, cnt]) => `${br}: ${cnt}`)
      .join(', ');

    conflicts.push(
      `${unallocatedStudents.length} student(s) could not be accommodated due to shortage of rooms (${breakdownText}). Add more rooms or blocks to allocate everyone.`
    );
  }

  // Check pairing imbalance warnings
  branchPairings.forEach(pair => {
    const countA = (branchStudentPools[pair.branchA] || []).length;
    const countB = (branchStudentPools[pair.branchB] || []).length;
    if (Math.abs(countA - countB) > 10) {
      conflicts.push(
        `Pair Imbalance: ${pair.branchA} has ${countA} students while ${pair.branchB} has ${countB} students. Some benches will have vacant seats beside students.`
      );
    }
  });

  const totalStudentsAllocated = allocatedStudentIds.size;

  return {
    id: `plan-${Date.now()}`,
    examDetails,
    branchCohorts,
    branchPairings,
    sectionRule,
    roomAllocations,
    totalStudentsExpected,
    totalStudentsAllocated,
    unallocatedStudents,
    conflicts,
    generatedAt: new Date().toISOString()
  };
}
