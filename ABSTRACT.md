# ExamSeat Pro – Project Abstract

## Abstract

ExamSeat Pro is a web-based Smart Examination Seating Arrangement System developed to simplify and automate the allocation of students to examination rooms and seats. Manual seating preparation can be time-consuming and may result in duplicate allocations, uneven room utilization, and difficulty locating students. The system provides a digital workflow for entering examination details, organizing students by branch and section, configuring rooms, generating seating plans, searching for student seat details, and preparing printable examination documents.

The application is built with React and TypeScript using Vite. Its seating-generation logic is implemented in TypeScript. The application supports importing student lists from Excel and CSV files, configuring active rooms and room capacities, and pairing branches for left-seat and right-seat allocation. Generated plans include room-wise bench assignments, allocated and unallocated student counts, and conflict or capacity warnings. The application uses browser local storage for working configuration and current-plan state, and an Express server with SQLite for saving and retrieving seating plans.

The system can generate room seating views, student directories, attendance sheets, room notices, and department notice-board PDFs. By reducing repetitive manual work and providing structured outputs, ExamSeat Pro aims to improve the efficiency and clarity of examination seating administration.

## Problem Statement

Preparing examination seating arrangements manually requires administrators to collect student lists, group students by branch or section, calculate room capacity, assign seats, verify allocations, and prepare printed notices. These tasks become difficult when several branches and rooms are involved. Manual work can lead to errors, vacant seats, duplicate assignments, or students being difficult to locate.

## Objectives

- Automate the generation of examination seating plans.
- Organize students by branch, year, semester, and section.
- Configure rooms, benches, columns, and seat capacity.
- Support Excel and CSV student-list uploads.
- Allocate paired branches to opposite seats on benches.
- Identify insufficient room capacity and unallocated students.
- Allow searching by student register number or name.
- Generate printable room charts, attendance sheets, and notices.
- Save and retrieve generated seating plans.

## Proposed System

1. **Frontend:** React and TypeScript provide the interface for officer registration/login, exam setup, student upload, room configuration, seating generation, result viewing, and document exports.
2. **Seating engine:** A TypeScript algorithm groups students by branch, applies the selected section sorting rule, processes configured branch pairings, and fills active-room bench positions.
3. **Persistence:** Browser local storage stores the current configuration and plan. An Express server uses SQLite to save seating-plan JSON and provide plan retrieval and search endpoints.
4. **Document generation:** SheetJS (xlsx) and jsPDF with AutoTable generate Excel and PDF outputs.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19, TypeScript |
| Build tool | Vite |
| Styling | CSS, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | SQLite using better-sqlite3 |
| Browser persistence | localStorage |
| Spreadsheet import/export | SheetJS (xlsx) |
| PDF generation | jsPDF, jsPDF-AutoTable |
| Icons | Lucide React |
| Animation | Motion |
| Deployment | GitHub Pages (frontend), Render (backend) |

## Conclusion

ExamSeat Pro demonstrates how a web application can automate important examination-office tasks. It combines student-list processing, room-capacity checks, branch-based seating allocation, plan persistence, student search, and printable reports. The system provides a foundation for more advanced allocation rules, administrative controls, and examination analytics.
