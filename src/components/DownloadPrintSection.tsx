/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  FileText,
  Download,
  Building2,
  CheckCircle2,
  Layers,
  Award,
  Filter,
  Eye,
  FileCheck
} from 'lucide-react';
import { SeatingPlan } from '../types';
import {
  exportSeatingPlanToExcel,
  exportRoomNoticePDF,
  exportAttendanceSheetPDF,
  exportDepartmentNoticeBoardPDF,
  getDepartmentNoticeBoardRows
} from '../utils/exportUtils';

interface DownloadPrintSectionProps {
  currentPlan: SeatingPlan | null;
  onNavigateToGenerator?: () => void;
}

export const DownloadPrintSection: React.FC<DownloadPrintSectionProps> = ({
  currentPlan,
  onNavigateToGenerator
}) => {
  if (!currentPlan) {
    return (
      <div className="py-20 px-4 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#FAF4F0] border-2 border-[#D88C72] mx-auto flex items-center justify-center text-[#6B2F2F] shadow-sm">
          <Printer className="w-8 h-8 text-[#A44A3F]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-[#6B2F2F] uppercase">
            Official Documents Awaiting Generation
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Department Notice Board door charts, Invigilator Attendance Sheets, and Master Excel charts are generated after the Examination Officer executes the seating allotment.
          </p>
        </div>
        {onNavigateToGenerator && (
          <button
            type="button"
            onClick={onNavigateToGenerator}
            className="px-6 py-3 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white font-bold text-xs rounded-xl shadow-md shadow-[#6B2F2F]/20 cursor-pointer transition-all inline-flex items-center gap-2"
          >
            <span>Go to Exam Setup & Generator &rarr;</span>
          </button>
        )}
      </div>
    );
  }

  const { examDetails, roomAllocations } = currentPlan;
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'noticeBoard' | 'roomList'>('noticeBoard');

  const selectedRoom = roomAllocations[selectedRoomIndex] || roomAllocations[0];

  const handleBrowserPrint = () => {
    window.print();
  };

  const handlePrintNoticeBoard = () => {
    const printArea = document.getElementById('pragati-notice-board-document');
    if (!printArea) {
      window.print();
      return;
    }
    const existingIframe = document.getElementById('print-iframe');
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pragati Engineering College - Seating Notice</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111; margin: 0; padding: 10px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            .logo-cell { width: 85px; text-align: left; vertical-align: middle; }
            .logo-cell img { width: 75px; height: 75px; object-fit: contain; }
            .title-cell { text-align: center; vertical-align: middle; }
            .college-title { font-size: 20px; font-weight: 900; letter-spacing: 0.5px; margin: 0; text-transform: uppercase; }
            .autonomous { font-size: 13px; font-weight: bold; margin: 2px 0; }
            .dept-title { font-size: 13px; font-weight: bold; margin: 4px 0; text-transform: uppercase; }
            .meta-bar { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-top: 6px; padding-top: 4px; border-top: 1.5px solid #000; }
            .seating-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
            .seating-table th, .seating-table td { border: 1px solid #000; padding: 6px 8px; text-align: center; }
            .seating-table th { background-color: #f2f2f2; font-weight: bold; }
            .roll-cell { font-family: "Courier New", Courier, monospace; font-weight: bold; white-space: pre-line; text-align: center; font-size: 11.5px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 45px; padding: 0 20px; font-weight: bold; font-size: 12px; }
            .sign-line { border-top: 1px solid #000; width: 220px; padding-top: 6px; text-align: center; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        window.print();
      }
    }, 250);
  };

  // Distinct branches present in current plan
  const availableBranches = Array.from(
    new Set(
      roomAllocations.flatMap(r => [r.branchA, r.branchB]).filter(Boolean)
    )
  );

  const noticeRows = getDepartmentNoticeBoardRows(currentPlan, selectedDeptFilter);

  const toRomanYear = (yearStr: string) => {
    if (yearStr.includes('1')) return 'I';
    if (yearStr.includes('2')) return 'II';
    if (yearStr.includes('3')) return 'III';
    if (yearStr.includes('4')) return 'IV';
    return yearStr;
  };

  const romanYear = toRomanYear(examDetails.bTechYear || '3rd Year');
  const semUpper = (examDetails.semester || '5th Sem').toUpperCase();
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.');

  const deptHeadingText =
    selectedDeptFilter === 'ALL'
      ? 'EXAMINATION CELL • ALL DEPARTMENTS'
      : selectedDeptFilter === 'CSE'
      ? 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING'
      : selectedDeptFilter === 'ECE'
      ? 'DEPARTMENT OF ELECTRONICS & COMMUNICATION ENGINEERING'
      : `DEPARTMENT OF ${selectedDeptFilter.toUpperCase()}`;

  return (
    <section id="download-reports" className="py-8 scroll-mt-20 border-t border-[#D88C72]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4D6C6] border border-[#D88C72]/60 text-[#6B2F2F] text-xs font-bold">
            <Download className="w-3.5 h-3.5 text-[#A44A3F]" />
            <span>Official Examination Records</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#6B2F2F] tracking-tight">
            Download & Print Seating Charts
          </h2>
          <p className="text-xs sm:text-sm text-[#3D2222]/80">
            Official Pragati Engineering College Notice Board door charts with Roll Number ranges, master Excel workbooks, and invigilator sheets.
          </p>
        </div>

        {/* 4 Core Download Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Official Department Notice Board Chart (PHOTO FORMAT) */}
          <div className="bg-gradient-to-br from-white to-[#FAF4F0] p-5 rounded-2xl border-2 border-[#6B2F2F] shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#6B2F2F] text-[#F4D6C6] text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Photo Format
            </div>
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F4D6C6] text-[#6B2F2F] flex items-center justify-center border border-[#D88C72]">
                <Award className="w-5 h-5 text-[#6B2F2F]" />
              </div>
              <h3 className="font-extrabold text-[#6B2F2F] text-sm">
                Dept. Notice Board Chart
              </h3>
              <p className="text-[11px] text-[#3D2222]/80 leading-relaxed">
                Official JNTUK college notice format with Roll No. ranges (e.g. 24A31A0501 to 24A31A0524), room details, and HOD signatures.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => exportDepartmentNoticeBoardPDF(currentPlan, selectedDeptFilter)}
                className="w-full py-2 px-3 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#F4D6C6]" />
                <span>Download Notice (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('noticeBoard');
                  const el = document.getElementById('pragati-notice-board-document');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-1.5 px-3 bg-white hover:bg-[#F4D6C6]/40 text-[#6B2F2F] border border-[#D88C72] text-[11px] font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3 text-[#A44A3F]" />
                <span>View Live Notice Chart</span>
              </button>
            </div>
          </div>

          {/* Card 2: Master Excel */}
          <div className="bg-white p-5 rounded-2xl border border-[#D88C72]/60 shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F4D6C6] text-[#6B2F2F] flex items-center justify-center border border-[#D88C72]/50">
                <FileSpreadsheet className="w-5 h-5 text-[#6B2F2F]" />
              </div>
              <h3 className="font-bold text-[#6B2F2F] text-sm">
                Master Excel Chart
              </h3>
              <p className="text-[11px] text-[#3D2222]/70 leading-relaxed">
                Full workbook containing Master Seating Chart, Room Allocation Summary, and Student Directory with Column, Row, and Bench numbers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => exportSeatingPlanToExcel(currentPlan)}
              className="w-full py-2 px-3 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#F4D6C6]" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>

          {/* Card 3: Room Door Notices PDF */}
          <div className="bg-white p-5 rounded-2xl border border-[#D88C72]/60 shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F4D6C6] text-[#A44A3F] flex items-center justify-center border border-[#D88C72]/50">
                <FileText className="w-5 h-5 text-[#A44A3F]" />
              </div>
              <h3 className="font-bold text-[#6B2F2F] text-sm">
                Room Door Notice (PDF)
              </h3>
              <p className="text-[11px] text-[#3D2222]/70 leading-relaxed">
                Individual hall door chart with 4 columns × 6 benches layout and candidate seat coordinates.
              </p>
            </div>

            <div className="space-y-1.5">
              {roomAllocations.length > 1 && (
                <select
                  value={selectedRoomIndex}
                  onChange={e => setSelectedRoomIndex(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1 text-[11px] bg-[#FAF4F0] border border-[#D88C72]/60 rounded-lg text-[#6B2F2F] font-semibold"
                >
                  {roomAllocations.map((r, i) => (
                    <option key={r.roomId} value={i}>
                      Room {r.roomNumber} ({r.block})
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => {
                  if (selectedRoom) exportRoomNoticePDF(currentPlan, selectedRoom);
                }}
                className="w-full py-2 px-3 bg-[#A44A3F] hover:bg-[#6B2F2F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#F4D6C6]" />
                <span>Download Door Notice</span>
              </button>
            </div>
          </div>

          {/* Card 4: Print Seating Arrangement */}
          <div className="bg-white p-5 rounded-2xl border border-[#D88C72]/60 shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F4D6C6] text-[#6B2F2F] flex items-center justify-center border border-[#D88C72]/50">
                <Printer className="w-5 h-5 text-[#6B2F2F]" />
              </div>
              <h3 className="font-bold text-[#6B2F2F] text-sm">
                Print Whole Portal
              </h3>
              <p className="text-[11px] text-[#3D2222]/70 leading-relaxed">
                Standard print view for examination file records with auto-formatted paper styles.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBrowserPrint}
              className="w-full py-2 px-3 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#F4D6C6]" />
              <span>Print Portal View</span>
            </button>
          </div>

        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#D88C72]/40 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('noticeBoard')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'noticeBoard'
                  ? 'bg-[#6B2F2F] text-[#FAF4F0] shadow-sm'
                  : 'bg-white text-[#6B2F2F] border border-[#D88C72]/50 hover:bg-[#F4D6C6]/40'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Official Department Notice Board Document (Photo Format)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roomList')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'roomList'
                  ? 'bg-[#6B2F2F] text-[#FAF4F0] shadow-sm'
                  : 'bg-white text-[#6B2F2F] border border-[#D88C72]/50 hover:bg-[#F4D6C6]/40'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Room-by-Room PDF Downloads ({roomAllocations.length} Halls)</span>
            </button>
          </div>

          {activeTab === 'noticeBoard' && (
            <div className="flex items-center gap-2">
              <label htmlFor="dept-filter-select" className="text-xs font-bold text-[#6B2F2F] flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#A44A3F]" />
                Filter Dept:
              </label>
              <select
                id="dept-filter-select"
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-[#D88C72] rounded-lg text-[#6B2F2F] font-bold"
              >
                <option value="ALL">All Departments</option>
                {availableBranches.map(b => (
                  <option key={b} value={b}>
                    {b} Department
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: AUTHENTIC NOTICE BOARD DOCUMENT (MATCHING THE USER PHOTO) */}
        {activeTab === 'noticeBoard' && (
          <div className="space-y-4">
            
            {/* Action Bar for the Notice Board View */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#D88C72]/60 shadow-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#6B2F2F]" />
                <span className="text-xs font-bold text-[#6B2F2F]">
                  Document Preview ({noticeRows.length} Rows Generated)
                </span>
                <span className="text-[10px] text-[#A44A3F] font-medium bg-[#F4D6C6] px-2 py-0.5 rounded-full">
                  Pragati Engineering College (Autonomous)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintNoticeBoard}
                  className="px-3 py-1.5 bg-[#FAF4F0] hover:bg-[#F4D6C6] text-[#6B2F2F] border border-[#D88C72] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#A44A3F]" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportDepartmentNoticeBoardPDF(currentPlan, selectedDeptFilter)}
                  className="px-3.5 py-1.5 bg-[#6B2F2F] hover:bg-[#A44A3F] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#F4D6C6]" />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>

            {/* Rendered Document Container (Paper Style) */}
            <div
              id="pragati-notice-board-document"
              className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-stone-800 shadow-md max-w-4xl mx-auto text-black font-sans print:border-none print:shadow-none print:p-0"
            >
              {/* College Header Block with Logo & Text */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/pragati_e6e0ac40.jpg"
                    alt="Pragati Engineering College Logo"
                    className="w-18 h-18 object-contain"
                  />
                </div>
                <div className="flex-1 text-center px-2">
                  <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wide font-serif leading-none">
                    PRAGATI ENGINEERING COLLEGE
                  </h1>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider mt-1">
                    (Autonomous)
                  </p>
                  <p className="text-xs sm:text-sm font-black uppercase tracking-wide mt-1 text-stone-900">
                    {deptHeadingText}
                  </p>
                </div>
                <div className="w-20 shrink-0 hidden sm:block"></div>
              </div>

              {/* Seating Banner & Dates matching photo */}
              <div className="pt-3 pb-2 text-xs sm:text-sm font-bold">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-center sm:text-left">
                  <span className="uppercase font-black text-[12px] sm:text-[13px]">
                    SEATING ARRANGEMENT FOR {romanYear} B.TECH {semUpper} (R23) {examDetails.examName}
                  </span>
                  <span className="font-bold sm:text-right shrink-0">
                    A.Y {examDetails.academicYear || '2026-27'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1 text-[11px] sm:text-xs">
                  <span>
                    Examination Dates: <span className="font-normal">{examDetails.examDate} ({examDetails.session})</span>
                  </span>
                  <span className="sm:text-right">
                    Date: <span className="font-normal">{todayFormatted}</span>
                  </span>
                </div>
              </div>

              {/* The Official Grid Table matching the photo */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-stone-100 border-b border-black text-center font-black">
                      <th className="border border-black py-2 px-2.5 w-12 text-center">S. No.</th>
                      <th className="border border-black py-2 px-3 w-40 text-center">Room No.</th>
                      <th className="border border-black py-2 px-3 w-28 text-center">Branch & Section</th>
                      <th className="border border-black py-2 px-4 text-center">Roll No.</th>
                      <th className="border border-black py-2 px-3 w-28 text-center">No. of Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noticeRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-black py-8 text-center text-stone-500 font-medium">
                          No seating records for selected department filter.
                        </td>
                      </tr>
                    ) : (
                      noticeRows.map((row) => (
                        <tr key={`${row.sNo}-${row.roomNumber}-${row.branchAndSection}`} className="border-b border-black">
                          <td className="border border-black py-2.5 px-2 text-center font-bold">
                            {row.sNo}
                          </td>
                          <td className="border border-black py-2.5 px-3 text-center font-bold">
                            <div>{row.roomNumber}</div>
                            <div className="text-[10px] font-normal text-stone-700">
                              ({row.block})
                            </div>
                          </td>
                          <td className="border border-black py-2.5 px-3 text-center font-bold whitespace-nowrap">
                            {row.branchAndSection}
                          </td>
                          <td className="border border-black py-2.5 px-4 text-center font-mono font-bold text-stone-900 whitespace-pre-line text-xs sm:text-sm">
                            {row.rollNoRange}
                          </td>
                          <td className="border border-black py-2.5 px-3 text-center font-black text-xs sm:text-sm">
                            {row.studentCount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures Footer matching the photo */}
              <div className="flex items-center justify-between pt-12 sm:pt-16 pb-2 px-4">
                <div className="text-center">
                  <div className="w-44 h-8 border-b border-black mb-1 flex items-end justify-center font-serif italic text-xs text-stone-600">
                    Dept. Exam In-Charge
                  </div>
                  <p className="text-xs font-black uppercase text-stone-900">
                    Dept. Examination In-Charge
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-44 h-8 border-b border-black mb-1 flex items-end justify-center font-serif italic text-xs text-stone-600">
                    {selectedDeptFilter !== 'ALL' ? `HoD - ${selectedDeptFilter}` : 'Controller of Exams'}
                  </div>
                  <p className="text-xs font-black uppercase text-stone-900">
                    {selectedDeptFilter !== 'ALL' ? `HoD-${selectedDeptFilter}` : 'Controller of Examinations'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ROOM BY ROOM DOCUMENT TABLE */}
        {activeTab === 'roomList' && (
          <div className="bg-white rounded-2xl border border-[#D88C72]/60 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#6B2F2F] text-sm">
                  Individual Room Documentation
                </h3>
                <p className="text-xs text-[#3D2222]/70">
                  Generate separate PDF charts and attendance sheets for each active examination hall
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#FAF4F0] border-b border-[#D88C72]/40 text-[#6B2F2F] font-bold">
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">College Block</th>
                    <th className="py-2.5 px-3">Paired Branches</th>
                    <th className="py-2.5 px-3">Allocated Students</th>
                    <th className="py-2.5 px-3 text-right">PDF Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D88C72]/20">
                  {roomAllocations.map(room => (
                    <tr key={room.roomId} className="hover:bg-[#FAF4F0]/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#6B2F2F]">
                        Room {room.roomNumber}
                      </td>
                      <td className="py-3 px-3 text-[#3D2222]/80 font-medium">
                        {room.block}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#6B2F2F]">
                        {room.branchA} ({room.branchACount}) + {room.branchB} ({room.branchBCount})
                      </td>
                      <td className="py-3 px-3 font-bold text-[#A44A3F]">
                        {room.totalAllocated} / {room.totalCapacity} ({room.totalBenches} Benches)
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => exportRoomNoticePDF(currentPlan, room)}
                          className="px-2.5 py-1 bg-[#FAF4F0] hover:bg-[#F4D6C6] text-[#6B2F2F] border border-[#D88C72]/60 rounded font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Door Notice (PDF)
                        </button>
                        <button
                          type="button"
                          onClick={() => exportAttendanceSheetPDF(currentPlan, room)}
                          className="px-2.5 py-1 bg-[#F4D6C6] hover:bg-[#D88C72] text-[#6B2F2F] border border-[#D88C72] rounded font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Attendance (PDF)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
