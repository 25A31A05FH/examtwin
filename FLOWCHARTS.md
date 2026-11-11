# ExamSeat Pro – Flowcharts

These diagrams represent the workflows of the ExamSeat Pro application. GitHub renders Mermaid diagrams when this Markdown file is viewed in the repository.

## 1. Overall System Workflow

```mermaid
flowchart TD
    A([Start]) --> B[Open ExamSeat Pro]
    B --> C[Load Saved Configuration]
    C --> D[Enter Exam Details]
    D --> E[Upload Student Lists]
    E --> F[Configure Branch Cohorts and Pairings]
    F --> G[Configure and Activate Rooms]
    G --> H[Validate Inputs and Capacity]
    H --> I{Inputs Valid?}
    I -- No --> J[Display Validation Error]
    J --> D
    I -- Yes --> K[Generate Seating Plan]
    K --> L[Display Room-wise Allocation]
    L --> M[Save Plan Locally]
    M --> N[Send Plan to SQLite Backend]
    N --> O[Search Students or Export Documents]
    O --> P([Stop])
```

## 2. Student File Upload Flowchart

```mermaid
flowchart TD
    A([Start]) --> B[Select Excel or CSV File]
    B --> C[Read File]
    C --> D[Load First Worksheet]
    D --> E[Read Header Row]
    E --> F[Identify Student Columns]
    F --> G{Valid Student Rows?}
    G -- No --> H[Display Empty or Invalid File Error]
    G -- Yes --> I[Read Each Student Row]
    I --> J{Register Number Present?}
    J -- No --> K[Skip Row]
    J -- Yes --> L[Read Student Details]
    L --> M[Apply Default Cohort Values if Missing]
    M --> N[Create Student Record]
    K --> O{More Rows?}
    N --> O
    O -- Yes --> I
    O -- No --> P[Return Student List]
    P --> Q([Stop])
    H --> Q
```

## 3. Seating Generation Flowchart

```mermaid
flowchart TD
    A([Start]) --> B[Read Exam, Cohorts, Pairings and Rooms]
    B --> C[Select Active Rooms]
    C --> D[Create Student Pools by Branch]
    D --> E[Sort Students by Section or Register Number]
    E --> F[Calculate Total Students and Room Capacity]
    F --> G{Capacity Sufficient?}
    G -- No --> H[Add Capacity Warning]
    G -- Yes --> I[Process Branch Pairings]
    H --> I
    I --> J{Paired Students and Room Available?}
    J -- Yes --> K[Select Next Room]
    K --> L[Fill Left Seat from Branch A]
    L --> M[Fill Right Seat from Branch B]
    M --> N[Store Bench Allocation]
    N --> O{More Benches in Room?}
    O -- Yes --> L
    O -- No --> P[Store Room Allocation]
    P --> J
    J -- No --> Q[Find Remaining Branch Students]
    Q --> R{Students and Rooms Remaining?}
    R -- Yes --> S[Allocate Remaining Branches]
    S --> T[Store Room Allocation]
    T --> R
    R -- No --> U[Collect Unallocated Students]
    U --> V[Check Pairing Imbalance Warnings]
    V --> W[Return Seating Plan]
    W --> X([Stop])
```

## 4. Branch Pairing and Bench Allocation Flowchart

```mermaid
flowchart TD
    A([Start]) --> B[Select Branch Pair]
    B --> C[Get Remaining Student Pools]
    C --> D[Select Active Room]
    D --> E[Select Next Bench]
    E --> F{Branch A Has Students?}
    F -- Yes --> G[Assign Student to Left Seat]
    F -- No --> H[Leave Left Seat Vacant]
    G --> I{Branch B Has Students?}
    H --> I
    I -- Yes --> J[Assign Student to Right Seat]
    I -- No --> K[Leave Right Seat Vacant]
    J --> L[Store Bench]
    K --> L
    L --> M{More Benches?}
    M -- Yes --> E
    M -- No --> N[Store Room Allocation]
    N --> O{Paired Students and More Rooms?}
    O -- Yes --> D
    O -- No --> P([Continue to Next Pair or Remaining Branches])
```

## 5. Student Search Flowchart

```mermaid
flowchart TD
    A([Start]) --> B[/Enter Name or Register Number/]
    B --> C[Normalize Search Query]
    C --> D{Query Empty or Plan Missing?}
    D -- Yes --> E[Return Empty Results]
    D -- No --> F[Scan Each Room]
    F --> G[Scan Each Bench]
    G --> H[Check Left Seat]
    H --> I{Left Seat Matches?}
    I -- Yes --> J[Add Left Seat Location]
    I -- No --> K[Check Right Seat]
    J --> K
    K --> L{Right Seat Matches?}
    L -- Yes --> M[Add Right Seat Location]
    L -- No --> N{More Benches or Rooms?}
    M --> N
    N -- Yes --> G
    N -- No --> O[Display Matching Locations]
    E --> P([Stop])
    O --> P
```

## 6. Seating Plan Save and Retrieval Flowchart

```mermaid
flowchart TD
    A([Start]) --> B[Generate Seating Plan]
    B --> C[Save Plan in Browser Local Storage]
    C --> D[POST Plan to /api/plan]
    D --> E[Express Server Receives JSON]
    E --> F{Plan Object and ID Valid?}
    F -- No --> G[Return HTTP 400 Error]
    F -- Yes --> H[Insert or Update SQLite Record]
    H --> I{Database Operation Successful?}
    I -- No --> J[Return HTTP 500 Error]
    I -- Yes --> K[Return Success and Plan ID]
    G --> L([End])
    J --> L
    K --> L
```

## 7. Flowchart Symbol Reference

| Symbol | Meaning |
|---|---|
| Oval | Start or Stop |
| Rectangle | Processing step |
| Parallelogram | Input or Output |
| Diamond | Decision |
| Arrow | Direction of control flow |
