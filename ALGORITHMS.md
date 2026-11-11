# ExamSeat Pro – Algorithms and Pseudocode

This document describes the main application workflows and the seating-generation logic found in `src/utils/seatingGenerator.ts`. The pseudocode is a simplified representation of the inspected implementation.

## 1. Overall Application Workflow

**Input:** Examination details, student cohorts, branch pairings, room configuration, and section rule.  
**Output:** A generated seating plan and related reports.

### Steps

1. Open the application.
2. Load saved settings and the current plan from browser local storage.
3. Enter examination details.
4. Upload student files or use the available student data.
5. Configure branch cohorts and branch pairings.
6. Configure rooms and activate the rooms to be used.
7. Validate the input and calculate available capacity.
8. Generate the seating plan.
9. Display allocations, conflicts, and unallocated students.
10. Save the plan locally and send it to the Express API for SQLite persistence.
11. Search for students or export required documents.

### Pseudocode

```text
START
LOAD saved exam, cohort, pairing, room and plan data

INPUT examination details
INPUT student cohorts
INPUT branch pairings
INPUT room configuration
INPUT section sorting rule

VALIDATE input
IF input is valid THEN
    GENERATE seating plan
    DISPLAY room allocations and warnings
    SAVE plan in browser local storage
    SEND plan to backend for database storage
    ALLOW student search and document export
ELSE
    DISPLAY validation message
END IF

STOP
```

## 2. Student File Import Algorithm

The application reads the first worksheet from an uploaded Excel or CSV-compatible file using SheetJS. It identifies columns from header names and uses fallback positions for name and register number when needed.

**Input:** `.xlsx`, `.xls`, or `.csv` student file and default cohort details.  
**Output:** Array of student records.

### Pseudocode

```text
START
READ uploaded file as an array buffer
LOAD workbook
SELECT first worksheet
CONVERT worksheet rows to arrays

IF fewer than two rows THEN
    DISPLAY "No student records"
    STOP
END IF

READ header row
FIND columns for name, register number, branch,
year, semester and section

IF name column is not identified THEN
    USE fallback name column
END IF

IF register number column is not identified THEN
    USE fallback register-number column
END IF

FOR EACH data row
    READ register number
    IF register number is empty THEN
        SKIP row
    ELSE
        READ name and optional cohort fields
        USE default values for missing cohort fields
        CREATE student record
        ADD student to result
    END IF
END FOR

RETURN student records
STOP
```

## 3. Seating Generation Algorithm

The seating engine is implemented in `src/utils/seatingGenerator.ts`.

### Main logic

1. Select only rooms marked as active.
2. Create a student pool for each branch.
3. Sort students within each cohort:
   - `separate`: sort by section, then register number.
   - `mix`: sort by register number.
4. Calculate the expected student count and total capacity of active rooms.
5. Add a conflict warning if the available capacity is insufficient.
6. Process configured branch pairings in order.
7. For each room used by a pairing, take one student from Branch A for the left seat and one from Branch B for the right seat of each bench.
8. Continue until the room's bench positions are processed or both paired pools are empty.
9. Process any branches that still have students and were not fully handled by the configured pairings.
10. Collect students who remain unallocated because no more active rooms are available.
11. Add a warning when paired branch student counts differ by more than 10.
12. Return the complete seating plan.

### Pseudocode

```text
START

activeRooms = rooms where isActive is true
CREATE empty conflicts list
CREATE empty allocatedStudentIds set
CREATE one student pool for each branch

FOR EACH cohort
    COPY cohort students
    IF sectionRule is "separate" THEN
        SORT by section, then register number
    ELSE
        SORT by register number
    END IF
    ADD students to the branch pool
END FOR

totalExpected = total students in all branch pools
totalCapacity = sum of active room capacities

IF totalCapacity < totalExpected THEN
    ADD insufficient-capacity warning
END IF

roomIndex = 0

FOR EACH configured branch pair
    GET remaining pool for Branch A and Branch B

    WHILE either pool has students AND a room is available
        SELECT next active room
        CREATE empty bench list

        FOR EACH bench in the room
            IF Branch A has students THEN
                TAKE next Branch A student for left seat
            END IF

            IF Branch B has students THEN
                TAKE next Branch B student for right seat
            END IF

            STORE bench and its seat assignments
        END FOR

        STORE room allocation
        INCREMENT roomIndex
    END WHILE
END FOR

FIND branches with students still remaining

WHILE remaining branches exist AND a room is available
    SELECT first remaining branch as Branch A
    SELECT second remaining branch as Branch B
    IF no second branch exists THEN
        USE Branch A as the only branch
    END IF

    FILL room benches from the selected pools
    STORE room allocation
    REMOVE empty branches from remaining list
END WHILE

COLLECT all remaining students as unallocated
ADD unallocated-student warning if required
ADD pairing-imbalance warnings where count difference > 10

RETURN seating plan
STOP
```

### Important implementation note

The current algorithm assigns Branch A to the left seat and Branch B to the right seat for each bench. It does not implement a general all-neighbor adjacency optimizer. The actual result depends on the configured branch pairings, active rooms, and available student pools.

## 4. Student Search Algorithm

The application searches the generated seating plan by matching a query against a student's register number or name. The client-side search scans every room and bench.

**Input:** Search text and current seating plan.  
**Output:** Matching students with block, room, bench, and seat position.

### Pseudocode

```text
START
INPUT search query
CONVERT query to lowercase and remove extra spaces

IF query is empty OR plan is unavailable THEN
    RETURN empty result
END IF

CREATE empty result list

FOR EACH room in seating plan
    FOR EACH bench in room
        CHECK left seat
        IF left-seat register number or name contains query THEN
            ADD left-seat location to results
        END IF

        CHECK right seat
        IF right-seat register number or name contains query THEN
            ADD right-seat location to results
        END IF
    END FOR
END FOR

RETURN results
STOP
```

## 5. Seating Plan Persistence Algorithm

The client saves the current plan in local storage and then attempts to send it to the Express backend using `POST /api/plan`.

### Pseudocode

```text
START
INPUT generated seating plan
SAVE plan JSON in browser local storage

SEND POST request to /api/plan
WITH plan as JSON body

IF backend request succeeds THEN
    RECEIVE success response and plan ID
ELSE
    LOG backend persistence notice
END IF

STOP
```

## 6. Complexity Analysis

Let:
- `S` = number of students.
- `R` = number of active rooms.
- `B` = total number of bench positions processed across rooms.
- `C` = number of branch cohorts.
- `P` = number of configured branch pairings.

| Operation | Expected Time Complexity | Explanation |
|---|---:|---|
| Build branch pools | O(S) | Each student is copied into a branch pool |
| Sort cohort students | O(S log S) overall upper bound | Sorting student lists |
| Calculate capacity | O(R) | Visit each active room |
| Fill bench positions | O(B + S) | Visit bench positions and consume students |
| Collect unallocated students | O(S) | Visit remaining branch pools |
| Client-side student search | O(B) | Scan seats in all benches |
| File parsing | Depends on file size | Read and process worksheet rows |

The sorting stage is generally the dominant part of seating generation, giving an overall upper bound of approximately O(S log S + B + R), excluding spreadsheet parsing and database I/O.
