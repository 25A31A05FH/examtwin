/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SeatingPlan, RoomAllocation, Student } from '../types';

// ==========================================
// EXCEL EXPORT
// ==========================================

export function exportSeatingPlanToExcel(plan: SeatingPlan) {
  const wb = XLSX.utils.book_new();

  // 1. Master Room-wise Seating Sheet
  const masterData: any[] = [];
  masterData.push(['PRAGATI ENGINEERING COLLEGE (AUTONOMOUS)']);
  masterData.push(['EXAMINATION SEATING ARRANGEMENT - MASTER CHART']);
  masterData.push([`Exam: ${plan.examDetails.examName} (${plan.examDetails.examType || 'Semester'})`]);
  masterData.push([
    `Date: ${plan.examDetails.examDate}`,
    `Session: ${plan.examDetails.session}`,
    `Academic Year: ${plan.examDetails.academicYear}`,
    `Year/Sem: ${plan.examDetails.bTechYear} (${plan.examDetails.semester})`
  ]);
  masterData.push([]);
  masterData.push([
    'Block',
    'Room No',
    'Column',
    'Row',
    'Bench No',
    'Seat Position',
    'Register No',
    'Student Name',
    'Branch',
    'Year',
    'Sem',
    'Section'
  ]);

  plan.roomAllocations.forEach(room => {
    room.benches.forEach(bench => {
      const colNum = bench.columnNumber || Math.floor((bench.benchNumber - 1) / (room.benchesPerColumn || 6)) + 1;
      const rowNum = bench.rowInColumn || ((bench.benchNumber - 1) % (room.benchesPerColumn || 6)) + 1;

      if (bench.leftSeat) {
        masterData.push([
          room.block,
          room.roomNumber,
          `Column ${colNum}`,
          `Row ${rowNum}`,
          bench.benchNumber,
          'Seat 1 (Left)',
          bench.leftSeat.regNo,
          bench.leftSeat.name,
          bench.leftSeat.branch,
          bench.leftSeat.year || plan.examDetails.bTechYear,
          bench.leftSeat.semester || plan.examDetails.semester,
          bench.leftSeat.section
        ]);
      } else {
        masterData.push([
          room.block,
          room.roomNumber,
          `Column ${colNum}`,
          `Row ${rowNum}`,
          bench.benchNumber,
          'Seat 1 (Left)',
          'VACANT',
          '-',
          room.branchA,
          '-',
          '-',
          '-'
        ]);
      }

      if (bench.rightSeat) {
        masterData.push([
          room.block,
          room.roomNumber,
          `Column ${colNum}`,
          `Row ${rowNum}`,
          bench.benchNumber,
          'Seat 2 (Right)',
          bench.rightSeat.regNo,
          bench.rightSeat.name,
          bench.rightSeat.branch,
          bench.rightSeat.year || plan.examDetails.bTechYear,
          bench.rightSeat.semester || plan.examDetails.semester,
          bench.rightSeat.section
        ]);
      } else {
        masterData.push([
          room.block,
          room.roomNumber,
          `Column ${colNum}`,
          `Row ${rowNum}`,
          bench.benchNumber,
          'Seat 2 (Right)',
          'VACANT',
          '-',
          room.branchB,
          '-',
          '-',
          '-'
        ]);
      }
    });
  });

  const masterWs = XLSX.utils.aoa_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, masterWs, 'Master_Seating');

  // 2. Room Summary Sheet
  const roomSummaryData: any[] = [
    ['ROOM ALLOCATION SUMMARY'],
    [`Generated: ${new Date(plan.generatedAt).toLocaleString()}`],
    [],
    ['Block', 'Room No', 'Branch 1', 'Branch 1 Count', 'Branch 2', 'Branch 2 Count', 'Total Allocated', 'Capacity', 'Occupancy %']
  ];

  plan.roomAllocations.forEach(room => {
    const occ = Math.round((room.totalAllocated / room.totalCapacity) * 100);
    roomSummaryData.push([
      room.block,
      room.roomNumber,
      room.branchA,
      room.branchACount,
      room.branchB,
      room.branchBCount,
      room.totalAllocated,
      room.totalCapacity,
      `${occ}%`
    ]);
  });

  const roomSummaryWs = XLSX.utils.aoa_to_sheet(roomSummaryData);
  XLSX.utils.book_append_sheet(wb, roomSummaryWs, 'Room_Summary');

  // 3. Alphabetical Student Directory
  const studentDirData: any[] = [
    ['STUDENT SEATING DIRECTORY'],
    ['Register No', 'Student Name', 'Branch', 'Year', 'Sem', 'Section', 'Block', 'Room No', 'Bench No', 'Position']
  ];

  const allAllocated: any[] = [];
  plan.roomAllocations.forEach(r => {
    r.benches.forEach(b => {
      if (b.leftSeat) {
        allAllocated.push({
          regNo: b.leftSeat.regNo,
          name: b.leftSeat.name,
          branch: b.leftSeat.branch,
          year: b.leftSeat.year || plan.examDetails.bTechYear,
          sem: b.leftSeat.semester || plan.examDetails.semester,
          section: b.leftSeat.section,
          block: r.block,
          roomNumber: r.roomNumber,
          benchNumber: b.benchNumber,
          pos: 'Seat 1 (Left)'
        });
      }
      if (b.rightSeat) {
        allAllocated.push({
          regNo: b.rightSeat.regNo,
          name: b.rightSeat.name,
          branch: b.rightSeat.branch,
          year: b.rightSeat.year || plan.examDetails.bTechYear,
          sem: b.rightSeat.semester || plan.examDetails.semester,
          section: b.rightSeat.section,
          block: r.block,
          roomNumber: r.roomNumber,
          benchNumber: b.benchNumber,
          pos: 'Seat 2 (Right)'
        });
      }
    });
  });

  allAllocated.sort((a, b) => a.regNo.localeCompare(b.regNo, undefined, { numeric: true }));

  allAllocated.forEach(item => {
    studentDirData.push([
      item.regNo,
      item.name,
      item.branch,
      item.year,
      item.sem,
      item.section,
      item.block,
      item.roomNumber,
      item.benchNumber,
      item.pos
    ]);
  });

  const studentWs = XLSX.utils.aoa_to_sheet(studentDirData);
  XLSX.utils.book_append_sheet(wb, studentWs, 'Student_Directory');

  const cleanExamName = (plan.examDetails.examName || 'Exam').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  XLSX.writeFile(wb, `ExamSeat_${cleanExamName}_Arrangement.xlsx`);
}

// ==========================================
// PDF EXPORT
// ==========================================

export function exportRoomNoticePDF(plan: SeatingPlan, room: RoomAllocation) {
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(107, 47, 47);
  doc.text('PRAGATI ENGINEERING COLLEGE (AUTONOMOUS)', 105, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(164, 74, 63);
  doc.text('Office of Controller of Examinations • Seating Arrangement', 105, 17, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 30, 30);
  doc.text(`${plan.examDetails.examName} (${plan.examDetails.examType || 'Semester'})`, 105, 23, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 70, 70);
  doc.text(
    `Date: ${plan.examDetails.examDate}   |   Session: ${plan.examDetails.session}   |   ${plan.examDetails.bTechYear} (${plan.examDetails.semester})`,
    105,
    28,
    { align: 'center' }
  );

  doc.setFillColor(107, 47, 47);
  doc.roundedRect(14, 32, 182, 13, 2, 2, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`HALL: ${room.roomNumber} (${room.block})`, 18, 40.5);

  doc.setFontSize(8.5);
  doc.text(
    `Total: ${room.totalAllocated} / ${room.totalCapacity}  |  ${room.branchA}: ${room.branchACount}  |  ${room.branchB}: ${room.branchBCount}`,
    125,
    40.5,
    { align: 'left' }
  );

  const tableRows: any[] = [];
  room.benches.forEach(b => {
    const leftText = b.leftSeat
      ? `${b.leftSeat.regNo} - ${b.leftSeat.name}\n(${b.leftSeat.branch} - Sec ${b.leftSeat.section})`
      : 'VACANT';

    const rightText = b.rightSeat
      ? `${b.rightSeat.regNo} - ${b.rightSeat.name}\n(${b.rightSeat.branch} - Sec ${b.rightSeat.section})`
      : 'VACANT';

    const colNum = b.columnNumber || Math.floor((b.benchNumber - 1) / (room.benchesPerColumn || 6)) + 1;
    const rowNum = b.rowInColumn || ((b.benchNumber - 1) % (room.benchesPerColumn || 6)) + 1;

    tableRows.push([
      `Col ${colNum}, Row ${rowNum}\n(Bench ${b.benchNumber})`,
      leftText,
      rightText
    ]);
  });

  autoTable(doc, {
    startY: 48,
    head: [['Bench #', `Seat 1 - Left (${room.branchA})`, `Seat 2 - Right (${room.branchB})`]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 78 },
      2: { cellWidth: 78 }
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 240;
  if (finalY < 270) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Note: Students must occupy their assigned bench only. Possession of unauthorized materials is strictly prohibited.', 14, finalY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Invigilator Sign: _______________________', 14, finalY + 16);
    doc.text('Chief Superintendent: _______________________', 120, finalY + 16);
  }

  doc.save(`Room_${room.roomNumber}_Notice.pdf`);
}

export function exportAttendanceSheetPDF(plan: SeatingPlan, room: RoomAllocation) {
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(107, 47, 47);
  doc.text('PRAGATI ENGINEERING COLLEGE (AUTONOMOUS)', 105, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(164, 74, 63);
  doc.text('EXAMINATION ATTENDANCE & SIGNATURE SHEET', 105, 17, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 40, 40);
  doc.text(`${plan.examDetails.examName} | Hall ${room.roomNumber} (${room.block}) | ${plan.examDetails.examDate} (${plan.examDetails.session})`, 105, 23, { align: 'center' });

  const studentRows: any[] = [];
  let sNo = 1;

  room.benches.forEach(b => {
    if (b.leftSeat) {
      studentRows.push([
        sNo++,
        b.leftSeat.regNo,
        b.leftSeat.name,
        `${b.leftSeat.branch}-${b.leftSeat.section}`,
        `B-${b.benchNumber} (L)`,
        '',
        ''
      ]);
    }
    if (b.rightSeat) {
      studentRows.push([
        sNo++,
        b.rightSeat.regNo,
        b.rightSeat.name,
        `${b.rightSeat.branch}-${b.rightSeat.section}`,
        `B-${b.benchNumber} (R)`,
        '',
        ''
      ]);
    }
  });

  autoTable(doc, {
    startY: 26,
    head: [['S.No', 'Register No', 'Student Name', 'Branch-Sec', 'Bench', 'Answer Book No', 'Signature']],
    body: studentRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 46 },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 30 },
      6: { cellWidth: 26 }
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 240;
  if (finalY < 270) {
    doc.setFontSize(8);
    doc.text('Total Present: ______   Total Absent: ______', 14, finalY + 8);
    doc.text('Invigilator Signature: _______________________', 14, finalY + 16);
  }

  doc.save(`Attendance_${room.roomNumber}.pdf`);
}

// ==========================================
// DEPARTMENT NOTICE BOARD DOOR CHART (PHOTO FORMAT)
// ==========================================

export interface DepartmentNoticeRow {
  sNo: number;
  roomNumber: string;
  roomDescription: string;
  block: string;
  branch: string;
  branchAndSection: string;
  rollNoRange: string;
  studentCount: number;
}

export function formatRollRanges(students: Student[]): string {
  if (!students || students.length === 0) return 'N/A';

  // Sort students by regNo numerically/alphabetically
  const sorted = [...students].sort((a, b) =>
    a.regNo.localeCompare(b.regNo, undefined, { numeric: true, sensitivity: 'base' })
  );

  const ranges: string[] = [];
  let currentStart = sorted[0].regNo;
  let currentEnd = sorted[0].regNo;

  const parseReg = (reg: string) => {
    const match = reg.match(/^(.*?)(\d+)$/);
    if (match) {
      return { prefix: match[1], num: parseInt(match[2], 10), digits: match[2].length };
    }
    return { prefix: reg, num: -1, digits: 0 };
  };

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].regNo;
    const curr = sorted[i].regNo;
    const pInfo = parseReg(prev);
    const cInfo = parseReg(curr);

    if (
      pInfo.num !== -1 &&
      cInfo.num !== -1 &&
      pInfo.prefix === cInfo.prefix &&
      cInfo.num === pInfo.num + 1
    ) {
      currentEnd = curr;
    } else {
      ranges.push(currentStart === currentEnd ? currentStart : `${currentStart} to ${currentEnd}`);
      currentStart = curr;
      currentEnd = curr;
    }
  }
  ranges.push(currentStart === currentEnd ? currentStart : `${currentStart} to ${currentEnd}`);

  return ranges.join('\n&\n');
}

export function getDepartmentNoticeBoardRows(
  plan: SeatingPlan,
  branchFilter?: string
): DepartmentNoticeRow[] {
  const rows: DepartmentNoticeRow[] = [];
  let sNo = 1;

  const toRomanYear = (yearStr: string) => {
    if (yearStr.includes('1')) return 'I';
    if (yearStr.includes('2')) return 'II';
    if (yearStr.includes('3')) return 'III';
    if (yearStr.includes('4')) return 'IV';
    return yearStr;
  };

  const romanYear = toRomanYear(plan.examDetails.bTechYear || '3rd Year');

  plan.roomAllocations.forEach(room => {
    const groupMap = new Map<string, { branch: string; section: string; students: Student[] }>();

    room.benches.forEach(bench => {
      [bench.leftSeat, bench.rightSeat].forEach(seat => {
        if (!seat) return;
        if (branchFilter && branchFilter !== 'ALL' && seat.branch !== branchFilter) return;

        const key = `${seat.branch}-${seat.section}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, { branch: seat.branch, section: seat.section, students: [] });
        }
        groupMap.get(key)!.students.push(seat);
      });
    });

    const sortedGroups = Array.from(groupMap.values()).sort((a, b) => {
      if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
      return a.section.localeCompare(b.section);
    });

    sortedGroups.forEach(group => {
      const rollRange = formatRollRanges(group.students);
      const floorNum = room.floor ?? (parseInt(room.roomNumber.match(/\d/)?.[0] || '1', 10));
      const floorStr = floorNum === 1 ? 'Ground Floor' : `Floor ${floorNum}`;
      const roomDesc = `${room.roomNumber}\n(${room.block} ${floorStr})`;

      rows.push({
        sNo: sNo++,
        roomNumber: room.roomNumber,
        roomDescription: roomDesc,
        block: room.block,
        branch: group.branch,
        branchAndSection: `${romanYear} ${group.branch} - ${group.section}`,
        rollNoRange: rollRange,
        studentCount: group.students.length
      });
    });
  });

  return rows;
}

export function exportDepartmentNoticeBoardPDF(plan: SeatingPlan, branchFilter = 'ALL') {
  const doc = new jsPDF('p', 'mm', 'a4');
  const rows = getDepartmentNoticeBoardRows(plan, branchFilter);

  const toRomanYear = (yearStr: string) => {
    if (yearStr.includes('1')) return 'I';
    if (yearStr.includes('2')) return 'II';
    if (yearStr.includes('3')) return 'III';
    if (yearStr.includes('4')) return 'IV';
    return yearStr;
  };

  const romanYear = toRomanYear(plan.examDetails.bTechYear || '3rd Year');
  const semUpper = (plan.examDetails.semester || '5th Sem').toUpperCase();
  const branchHeader =
    branchFilter && branchFilter !== 'ALL'
      ? `DEPARTMENT OF ${branchFilter === 'CSE' ? 'COMPUTER SCIENCE & ENGINEERING' : branchFilter === 'ECE' ? 'ELECTRONICS & COMMUNICATION ENGINEERING' : branchFilter.toUpperCase()}`
      : 'EXAMINATION CELL • ALL DEPARTMENTS';

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.');

  // Header matching the uploaded photo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text('PRAGATI ENGINEERING COLLEGE', 105, 14, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('(Autonomous)', 105, 19, { align: 'center' });

  doc.setFontSize(10.5);
  doc.text(branchHeader, 105, 24, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  const seatingHeading = `SEATING ARRANGEMENT FOR ${romanYear} B.TECH ${semUpper} (R23) ${plan.examDetails.examName.toUpperCase()}`;
  doc.text(seatingHeading, 14, 30);
  doc.text(`A.Y ${plan.examDetails.academicYear || '2026-27'}`, 196, 30, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text(`Examination Dates: ${plan.examDetails.examDate} (${plan.examDetails.session})`, 14, 35);
  doc.text(`Date: ${todayStr}`, 196, 35, { align: 'right' });

  // Thin separator line
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.3);
  doc.line(14, 37, 196, 37);

  // Table Body formatted exactly like the photo
  const tableData = rows.map(r => [
    r.sNo,
    r.roomDescription,
    r.branchAndSection,
    r.rollNoRange,
    r.studentCount
  ]);

  autoTable(doc, {
    startY: 39,
    head: [['S. No.', 'Room No.', 'Branch\n&\nSection', 'Roll No.', 'No. of Students']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle',
      lineColor: [40, 40, 40],
      lineWidth: 0.3
    },
    bodyStyles: {
      textColor: [10, 10, 10],
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [40, 40, 40],
      lineWidth: 0.25,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 34, halign: 'center' },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 84, halign: 'center', font: 'courier', fontStyle: 'bold' },
      4: { cellWidth: 24, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 240;
  const pageHeight = doc.internal.pageSize.getHeight();

  // If not enough room for signatures, add a page
  if (finalY + 30 > pageHeight) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Dept. Examination In-Charge', 14, 30);
    doc.text(
      branchFilter && branchFilter !== 'ALL'
        ? `HoD-${branchFilter}`
        : 'Controller of Examinations',
      196,
      30,
      { align: 'right' }
    );
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Dept. Examination In-Charge', 14, finalY + 22);
    doc.text(
      branchFilter && branchFilter !== 'ALL'
        ? `HoD-${branchFilter}`
        : 'Controller of Examinations',
      196,
      finalY + 22,
      { align: 'right' }
    );
  }

  const filename = `Pragati_Seating_Notice_${branchFilter}_${plan.examDetails.examDate}.pdf`;
  doc.save(filename);
}

export function downloadSampleStudentTemplate(branch = 'CSE') {
  const wb = XLSX.utils.book_new();
  const sampleRows = [
    { 'Student Name': 'Aarav Sharma', 'Register Number': '24CS101', Branch: branch, Year: '3rd Year', Semester: '5th Sem', Section: 'A' },
    { 'Student Name': 'Ananya Reddy', 'Register Number': '24CS102', Branch: branch, Year: '3rd Year', Semester: '5th Sem', Section: 'A' },
    { 'Student Name': 'Rohan Patel', 'Register Number': '24CS103', Branch: branch, Year: '3rd Year', Semester: '5th Sem', Section: 'A' },
    { 'Student Name': 'Sneha Iyer', 'Register Number': '24CS104', Branch: branch, Year: '3rd Year', Semester: '5th Sem', Section: 'A' },
    { 'Student Name': 'Vikram Kumar', 'Register Number': '24CS201', Branch: branch, Year: '3rd Year', Semester: '5th Sem', Section: 'B' },
    { 'Student Name': 'Pooja Verma', 'Register Number': '24CS202', Branch: branch, Year: '3rd Year', Semester: '5th Sem', Section: 'B' },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Student_List');
  XLSX.writeFile(wb, `Student_Upload_Template_${branch}.xlsx`);
}

export async function parseStudentFile(
  file: File,
  defaultBranch = 'CSE',
  defaultYear = '3rd Year',
  defaultSem = '5th Sem',
  defaultSection = 'A'
): Promise<Student[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const worksheet = wb.Sheets[firstSheetName];
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rawData.length < 2) {
    throw new Error('The uploaded file contains no student records or is empty.');
  }

  const headerRow: string[] = (rawData[0] || []).map((h: any) => String(h).trim().toLowerCase());

  let nameIdx = headerRow.findIndex(h => h.includes('name') || h.includes('student'));
  let regNoIdx = headerRow.findIndex(h => h.includes('reg') || h.includes('roll') || h.includes('htno') || h.includes('id') || h.includes('number'));
  let branchIdx = headerRow.findIndex(h => h.includes('branch') || h.includes('dept'));
  let yearIdx = headerRow.findIndex(h => h.includes('year'));
  let semIdx = headerRow.findIndex(h => h.includes('sem'));
  let secIdx = headerRow.findIndex(h => h.includes('sec'));

  // Sensible fallback index assignments if headers differ
  if (nameIdx === -1 && regNoIdx !== 0) nameIdx = 0;
  if (regNoIdx === -1) regNoIdx = 1;

  const students: Student[] = [];

  for (let r = 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.length === 0) continue;

    const regNo = String(row[regNoIdx] || '').trim();
    if (!regNo) continue;

    const name = String(row[nameIdx] || `Student ${regNo}`).trim();
    const branch = branchIdx >= 0 && row[branchIdx] ? String(row[branchIdx]).trim() : defaultBranch;
    const year = yearIdx >= 0 && row[yearIdx] ? String(row[yearIdx]).trim() : defaultYear;
    const semester = semIdx >= 0 && row[semIdx] ? String(row[semIdx]).trim() : defaultSem;
    const section = secIdx >= 0 && row[secIdx] ? String(row[secIdx]).trim() : defaultSection;

    students.push({
      id: `${branch}-${section}-${regNo}-${r}`,
      regNo,
      name,
      branch,
      year,
      semester,
      section
    });
  }

  return students;
}
