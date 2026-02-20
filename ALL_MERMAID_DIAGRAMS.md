# Health Compass AI - All Mermaid Diagrams

Copy any diagram below and paste it into [Mermaid Live Editor](https://mermaid.live) or any Mermaid-compatible platform.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
  AUTH_USERS {
    uuid id PK
    string email
    timestamptz created_at
  }

  PROFILES {
    uuid id PK
    uuid user_id FK
    text full_name
    text avatar_url
    timestamptz created_at
    timestamptz updated_at
  }

  PREDICTIONS {
    uuid id PK
    uuid user_id FK
    text prediction_type
    text input_data
    jsonb predicted_diseases
    text summary
    timestamptz created_at
  }

  CHAT_HISTORY {
    uuid id PK
    uuid user_id FK
    jsonb messages
    timestamptz created_at
    timestamptz updated_at
  }

  HEALTH_METRICS {
    uuid id PK
    uuid user_id
    date metric_date
    decimal weight
    int blood_pressure_systolic
    int blood_pressure_diastolic
    int heart_rate
    decimal blood_sugar
    decimal sleep_hours
    int water_intake
    int steps
    text mood
    text notes
    timestamptz created_at
    timestamptz updated_at
  }

  MEDICATION_REMINDERS {
    uuid id PK
    uuid user_id
    text medication_name
    text dosage
    text frequency
    text reminder_times
    date start_date
    date end_date
    bool is_active
    text notes
    timestamptz created_at
    timestamptz updated_at
  }

  MEDICATION_LOGS {
    uuid id PK
    uuid user_id
    uuid reminder_id FK
    timestamptz taken_at
    bool skipped
    text notes
    timestamptz created_at
  }

  AUTH_USERS ||--|| PROFILES : has_one
  AUTH_USERS ||--o{ PREDICTIONS : creates
  AUTH_USERS ||--o{ CHAT_HISTORY : owns
  AUTH_USERS ||--o{ HEALTH_METRICS : tracks_app_level
  AUTH_USERS ||--o{ MEDICATION_REMINDERS : sets_app_level
  AUTH_USERS ||--o{ MEDICATION_LOGS : records_app_level
  MEDICATION_REMINDERS ||--o{ MEDICATION_LOGS : has_logs
```

---

## 2. DFD Level 0 - Context Diagram

```mermaid
flowchart LR
  U[User]
  D[Doctor]
  SYS((Health Compass AI Platform))

  U -->|Symptoms, report text, chat, tracking data| SYS
  SYS -->|Predictions, summaries, chatbot guidance, reminders| U
  U -->|Share report request| SYS
  SYS -->|Shared medical report email| D
  D -->|Clinical follow-up| U
```

---

## 3. DFD Level 1 - Detailed Process Flow

```mermaid
flowchart LR
  U[User]
  DOC[Doctor]
  AI[(Lovable AI Gateway)]
  MAIL[(Resend Email API)]

  P1((1.0 Auth and Profile))
  P2((2.0 Symptom Analysis))
  P3((3.0 Report Analysis))
  P4((4.0 Medical Chat))
  P5((5.0 Health Tracking))
  P6((6.0 History and Dashboard))
  P7((7.0 Report Sharing))

  D1[(D1 Auth Users)]
  D2[(D2 Profiles)]
  D3[(D3 Predictions)]
  D4[(D4 Chat History)]
  D5[(D5 Health Metrics)]
  D6[(D6 Medication Reminders)]
  D7[(D7 Medication Logs)]

  U -->|Sign up, sign in| P1
  P1 --> D1
  P1 --> D2
  P1 -->|Session status| U

  U -->|Symptoms| P2
  P2 -->|Prompt| AI
  AI -->|Conditions JSON| P2
  P2 --> D3
  P2 -->|Analysis result| U

  U -->|Report text| P3
  P3 -->|Prompt| AI
  AI -->|Report JSON| P3
  P3 --> D3
  P3 -->|Report insights| U

  U -->|Chat messages| P4
  P4 -->|Prompt stream| AI
  AI -->|Response stream| P4
  P4 --> D4
  P4 -->|Chat reply| U

  U -->|Daily metrics and medication actions| P5
  P5 --> D5
  P5 --> D6
  P5 --> D7
  P5 -->|Tracking status| U

  U -->|View history and dashboard| P6
  P6 --> D3
  P6 --> D5
  P6 --> D6
  P6 --> D7
  P6 -->|Insights and trends| U

  U -->|Email report request| P7
  P7 --> D3
  P7 -->|Email payload| MAIL
  MAIL -->|Report email| DOC
```

---

## 4. Class Diagram - Conceptual Model

```mermaid
classDiagram
  class User {
    +uuid id
    +string email
  }

  class Profile {
    +uuid id
    +uuid user_id
    +string full_name
    +string avatar_url
    +datetime created_at
    +datetime updated_at
  }

  class Prediction {
    +uuid id
    +uuid user_id
    +string prediction_type
    +string input_data
    +json predicted_diseases
    +string summary
    +datetime created_at
  }

  class ChatMessage {
    +string role
    +string content
  }

  class ChatSession {
    +uuid id
    +uuid user_id
    +json messages
    +datetime created_at
    +datetime updated_at
  }

  class HealthMetric {
    +uuid id
    +uuid user_id
    +date metric_date
    +decimal weight
    +int systolic
    +int diastolic
    +int heart_rate
    +decimal blood_sugar
    +decimal sleep_hours
    +int water_intake
    +int steps
    +string mood
    +string notes
  }

  class MedicationReminder {
    +uuid id
    +uuid user_id
    +string medication_name
    +string dosage
    +string frequency
    +string reminder_times
    +date start_date
    +date end_date
    +bool is_active
    +string notes
  }

  class MedicationLog {
    +uuid id
    +uuid user_id
    +uuid reminder_id
    +datetime taken_at
    +bool skipped
    +string notes
  }

  class AuthService {
    +signUp(email, password, fullName)
    +signIn(email, password)
    +signInWithGoogle()
    +signOut()
  }

  class SymptomAnalysisService {
    +analyzeSymptoms(symptoms)
    +savePrediction(userId, result)
  }

  class ReportAnalysisService {
    +analyzeReport(reportText)
    +savePrediction(userId, result)
  }

  class ChatService {
    +streamChat(messages)
    +saveChat(userId, messages)
  }

  class HealthTrackingService {
    +saveMetrics(userId, metrics)
    +addMedicationReminder(userId, reminder)
    +logMedication(userId, reminderId, skipped)
  }

  class ReportEmailService {
    +sendReportEmail(to, doctorName, note, report)
  }

  User "1" --> "1" Profile
  User "1" --> "0..*" Prediction
  User "1" --> "0..*" ChatSession
  User "1" --> "0..*" HealthMetric
  User "1" --> "0..*" MedicationReminder
  User "1" --> "0..*" MedicationLog
  MedicationReminder "1" --> "0..*" MedicationLog
  ChatSession "1" --> "0..*" ChatMessage

  AuthService ..> User
  SymptomAnalysisService ..> Prediction
  ReportAnalysisService ..> Prediction
  ChatService ..> ChatSession
  HealthTrackingService ..> HealthMetric
  HealthTrackingService ..> MedicationReminder
  HealthTrackingService ..> MedicationLog
  ReportEmailService ..> Prediction
```

---

## 5. Use Case Diagram

```mermaid
flowchart LR
  USER[Actor: User]
  DOC[Actor: Doctor]

  UC1([Sign up / Sign in])
  UC2([Analyze symptoms])
  UC3([Analyze medical report])
  UC4([Chat with medical assistant])
  UC5([Track daily health metrics])
  UC6([Manage medication reminders])
  UC7([View dashboard and history])
  UC8([Share report by email])

  USER --> UC1
  USER --> UC2
  USER --> UC3
  USER --> UC4
  USER --> UC5
  USER --> UC6
  USER --> UC7
  USER --> UC8
  DOC --> UC8

  UC2 -. includes .-> UC7
  UC3 -. includes .-> UC7
  UC5 -. supports .-> UC7
  UC6 -. supports .-> UC7
```

---

## 6. Activity Diagram - Symptom Analysis Flow

```mermaid
flowchart TD
  A([Start]) --> B[User enters symptoms]
  B --> C[Click Analyze]
  C --> D[Validate input]
  D --> E{Input valid?}
  E -- No --> F[Show validation error]
  F --> B
  E -- Yes --> G[Call Supabase Edge Function]
  G --> H[Verify auth token]
  H --> I{Token valid?}
  I -- No --> J[Return unauthorized error]
  J --> K([End])
  I -- Yes --> L[Build AI prompt]
  L --> M[Call Lovable AI Gateway]
  M --> N[Parse and normalize JSON result]
  N --> O{User logged in?}
  O -- Yes --> P[Save prediction in DB]
  O -- No --> Q[Skip save]
  P --> R[Render analysis result]
  Q --> R
  R --> K([End])
```

---

## 7. Sequence Diagram - Analyze Symptoms

```mermaid
sequenceDiagram
  actor User
  participant FE as React Frontend
  participant SF as Supabase Function<br/>analyze-symptoms
  participant SA as Supabase Auth
  participant AI as Lovable AI Gateway
  participant DB as Supabase Postgres

  User->>FE: Enter symptoms and submit
  FE->>SF: invoke function with symptoms + JWT
  SF->>SA: Validate JWT claims
  SA-->>SF: Claims valid
  SF->>AI: Request medical analysis
  AI-->>SF: Structured JSON response
  SF-->>FE: Return analysis payload

  alt Logged-in user
    FE->>DB: Insert prediction record
    DB-->>FE: Insert success
  end

  FE-->>User: Show conditions, urgency, advice
```

---

## 8. Collaboration Diagram - Communication Flow

```mermaid
flowchart LR
  U[User]
  FE[Frontend UI]
  EF[Edge Function]
  AUTH[Supabase Auth]
  AI[Lovable AI Gateway]
  DB[(Supabase DB)]

  U -->|"1. Submit symptoms"| FE
  FE -->|"2. Invoke analyze-symptoms"| EF
  EF -->|"3. Verify JWT"| AUTH
  AUTH -->|"4. Claims response"| EF
  EF -->|"5. Request AI analysis"| AI
  AI -->|"6. Conditions JSON"| EF
  EF -->|"7. Return analysis"| FE
  FE -->|"8. Save prediction (optional)"| DB
  FE -->|"9. Display result"| U
```

---

## 9. State Chart Diagram - Analysis Request States

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> InputReady: User enters data
  InputReady --> Validating: Click Analyze
  Validating --> ValidationError: Invalid input
  ValidationError --> InputReady: User corrects input
  Validating --> CallingFunction: Valid input
  CallingFunction --> CallingAI: Auth passed
  CallingFunction --> Failed: Auth or network error
  CallingAI --> ParsingResult: AI response received
  CallingAI --> Failed: AI error or timeout
  ParsingResult --> SaveHistory: User logged in
  ParsingResult --> Completed: Guest user
  SaveHistory --> Completed: Save success
  SaveHistory --> Failed: DB save error
  Failed --> InputReady: Retry
  Completed --> Idle: New request
```

---

## 10. Package Diagram - System Architecture

```mermaid
flowchart LR
  subgraph P1["Frontend Package - src"]
    PAGES[pages]
    UI[components and ui]
    CTX[contexts]
    LIB[lib]
    INTEG[integrations]
  end

  subgraph P2["Backend Package - supabase/functions"]
    F1[analyze-symptoms]
    F2[analyze-report]
    F3[chat]
    F4[send-report-email]
  end

  subgraph P3["Data Package - supabase/migrations"]
    DBSCHEMA[PostgreSQL schema and RLS]
  end

  subgraph P4["External Package"]
    AIEXT[Lovable AI Gateway]
    EMAILEXT[Resend API]
  end

  PAGES --> UI
  PAGES --> CTX
  PAGES --> LIB
  PAGES --> INTEG
  INTEG --> F1
  INTEG --> F2
  INTEG --> F3
  INTEG --> F4

  F1 --> DBSCHEMA
  F2 --> DBSCHEMA
  F3 --> DBSCHEMA
  F4 --> DBSCHEMA

  F1 --> AIEXT
  F2 --> AIEXT
  F3 --> AIEXT
  F4 --> EMAILEXT
```

---

## 11. Deployment Diagram - System Infrastructure

```mermaid
flowchart LR
  subgraph CLIENT["Client Node"]
    BROWSER[Web Browser]
  end

  subgraph WEB["Web App Node"]
    SPA[React SPA Vite build]
  end

  subgraph SUPABASE["Supabase Cloud Node"]
    AUTH[Supabase Auth]
    DB[(Supabase PostgreSQL)]
    FN1[Edge Function<br/>analyze-symptoms]
    FN2[Edge Function<br/>analyze-report]
    FN3[Edge Function<br/>chat]
    FN4[Edge Function<br/>send-report-email]
  end

  subgraph EXTERNAL["External Service Nodes"]
    AI[Lovable AI Gateway]
    RESEND[Resend Email API]
    DOC[Doctor Inbox]
  end

  BROWSER --> SPA
  SPA --> AUTH
  SPA --> DB
  SPA --> FN1
  SPA --> FN2
  SPA --> FN3
  SPA --> FN4

  FN1 --> AUTH
  FN2 --> AUTH
  FN3 --> AUTH
  FN4 --> AUTH

  FN1 --> AI
  FN2 --> AI
  FN3 --> AI
  FN4 --> RESEND
  RESEND --> DOC
```

---

## How to Use

1. Copy any diagram code above
2. Visit [Mermaid Live Editor](https://mermaid.live)
3. Paste the code in the editor
4. The diagram will render automatically
5. Download or share as needed

All 11 diagrams are complete and ready to use!
