# ExamSeat Pro – API Reference and Technical Details

## 1. Backend API Endpoints

The inspected Express server (`server.ts`) defines the following routes:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Returns server status, system name, database type, and timestamp |
| POST | `/api/plan` | Validates and inserts or updates a seating plan in SQLite |
| GET | `/api/plan/latest` | Returns the most recently saved seating plan, or `null` |
| GET | `/api/search?q=<query>` | Searches the latest saved plan by student register number or name |

### POST `/api/plan`

**Request body:** Seating plan JSON. The plan must contain an `id`.

**Successful response:**

```json
{
  "success": true,
  "planId": "plan-example"
}
```

The server stores the exam name, date, session, total students, room count, and complete plan JSON. If the same plan ID is submitted again, the row is updated.

### GET `/api/plan/latest`

Returns the parsed JSON for the most recently saved seating plan. If no plan exists, it returns `null`.

### GET `/api/search?q=<query>`

Searches the latest saved seating plan by student register number or name. Matching results include student details, block, room, bench, column, row, and seat position.

### GET `/api/health`

Returns a health response containing:
- `status`
- `system`
- `database`
- `timestamp`

## 2. Data Model

The frontend TypeScript types describe the main entities.

| Entity | Important fields |
|---|---|
| ExamDetails | exam name, type, date, academic year, year, semester, session |
| Student | ID, register number, name, branch, year, semester, section |
| BranchCohort | branch, year, semester, section, student list |
| BranchPairing | Branch A, Branch B, per-room student configuration |
| Room | block, room number, floor, columns, benches, capacity, active status |
| BenchSeat | bench number, column, row, left-seat student, right-seat student |
| RoomAllocation | room details, branch counts, benches, total allocated |
| SeatingPlan | exam details, cohorts, pairings, room allocations, conflicts, unallocated students |

## 3. Persistence

The frontend service (`src/services/api.ts`) stores exam details, rooms, branch cohorts, branch pairings, section rule, current plan, and officer session in browser local storage.

When a plan is saved, the client also attempts to send it to `POST /api/plan`.

The Express server initializes a SQLite database at `data/examseat.sqlite`. It creates `seating_plans` and `student_records` tables. The inspected API routes currently write and read seating plans; the `student_records` table is created but is not used by the listed routes.

## 4. Document Import and Export

### Import

The application uses SheetJS (`xlsx`) to read Excel and CSV-compatible student files. The first worksheet is parsed, and header names are used to identify student fields.

### Export

The application uses:
- **Excel:** SheetJS to create seating and student-directory workbooks.
- **PDF:** jsPDF and jsPDF-AutoTable to create room notices and attendance sheets.
- **Department notice:** PDF output grouped by room, branch, and section, including register-number ranges.

## 5. Complexity Analysis

Let:
- `S` = number of students.
- `R` = number of active rooms.
- `B` = total bench positions processed.
- `C` = number of branch cohorts.

| Operation | Time Complexity |
|---|---:|
| Build branch pools | O(S) |
| Sort student cohorts | O(S log S) upper bound |
| Calculate room capacity | O(R) |
| Fill bench positions | O(B + S) |
| Collect unallocated students | O(S) |
| Search current seating plan | O(B) |

The overall seating-generation process is dominated by sorting and bench allocation, approximately O(S log S + B + R), excluding file parsing and database I/O.

## 6. Advantages

- Reduces manual examination seating work.
- Supports branch-wise student organization.
- Allows room activation and capacity configuration.
- Reports capacity shortages and unallocated students.
- Provides student seat lookup.
- Generates printable room and attendance documents.
- Saves generated plans in browser storage and SQLite.

## 7. Limitations and Future Enhancements

- Add stronger server-side validation and access control for plan-saving endpoints.
- Add database-backed management for student, room, and examination records.
- Add duplicate student/register-number validation across uploaded cohorts.
- Add more configurable seating constraints and allocation strategies.
- Add plan history, backup, and restore features.
- Add administrative audit logs and analytics.
