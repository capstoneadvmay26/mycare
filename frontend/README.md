# mycare
A mobile app centered on medication reminders and symptom tracking, with a conversational check-in that follows up on symptoms over several days and nudges users toward professional care when things aren't improving , differentiated locally through dependent-profile support for family/diaspora caregiving.






# MY CARE – Frontend Development

> **Healthcare Technology | React + Vite | Bootstrap | Axios | React Router | PWA-oriented Web Application**

MY CARE is a healthcare technology application designed to help users manage medications, track symptoms, monitor medication adherence, and support dependent-profile care.

This repository contains the **frontend implementation** of the MY CARE application developed as part of the BeTechified Capstone Project.

The frontend was developed collaboratively by:

* **Nurudeen AbdulSalam** – Frontend Developer 1 / Frontend Lead
* **Zavirah** – Frontend Developer 2

The frontend was developed with a strong emphasis on:

* Component-based architecture
* Reusable React components
* Responsive and mobile-first UI
* React state management
* Props-based data flow
* React Context
* Form handling and validation
* Client-side routing
* Axios-based API communication
* Authentication flow integration
* Loading, error and empty states
* Git/GitHub collaboration
* Design-to-code implementation
* Deployment through GitHub Pages

---

## 1. Project Overview

### 1.1 Product Name

**MY CARE**

### 1.2 Product Category

Healthcare Technology

### 1.3 Frontend Technology

The frontend was implemented as a modern React web application using Vite.

### 1.4 Primary Objective

The frontend provides the user interface through which users can:

* Create and manage their account
* Complete onboarding
* Add and manage medications
* View medication information
* Track medication-related activity
* Log symptoms
* Complete symptom check-ins
* View health history
* Manage their profile
* Manage application settings
* Interact with backend services through APIs

The frontend was designed to provide a clean, responsive and accessible experience while maintaining a component structure that can be extended as the application grows.

---

# 2. Frontend Development Team

## 2.1 Nurudeen AbdulSalam

**Role:** Frontend Developer 1 / Frontend Lead

Nurudeen was responsible for the major frontend foundation and core application integration work.

### Primary responsibilities

* Frontend project setup
* React + Vite foundation
* Application architecture
* Routing
* Shared application layout
* Theme implementation
* Authentication frontend flow
* Medication frontend functionality
* Symptoms frontend functionality
* API service configuration
* Axios integration
* Frontend/backend communication
* Common reusable components
* Loading/error/empty states
* Git branch-based development
* Frontend debugging
* Integration support
* GitHub deployment preparation

---

## 2.2 Zavirah

**Role:** Frontend Developer 2

Zavirah contributed to the frontend feature development and application screens, particularly around supporting user-management and secondary application functionality.

### Primary responsibilities

* Profile-related screens
* Profile management
* History-related screens
* Settings
* Notification/reminder-related frontend work
* Reusable UI implementation
* Responsive screen development
* Design alignment
* Component integration
* Frontend testing and review

---

## 2.3 Shared Responsibilities

Although the work was divided by feature ownership, both developers collaborated on:

* UI consistency
* Responsive design
* Reusable components
* Design interpretation
* Code review
* Git/GitHub workflow
* Bug fixing
* Integration testing
* Cross-feature navigation
* Overall application quality

---

# 3. Frontend Development Approach

The frontend development followed a progressive implementation approach rather than attempting to build every screen simultaneously.

The general development flow was:

```text
Product Requirements
        ↓
Figma / UI Design
        ↓
Frontend Planning
        ↓
Project Foundation
        ↓
Application Architecture
        ↓
Reusable Components
        ↓
Routing
        ↓
Feature Development
        ↓
State Management
        ↓
API Integration
        ↓
Backend Communication
        ↓
Testing & Debugging
        ↓
GitHub Integration
        ↓
Production Build
        ↓
GitHub Pages Deployment
```

This approach helped the frontend team separate the application into manageable technical responsibilities.

---

# 4. Step 1 – Understanding the Product Requirements

Before implementation, the frontend team reviewed the product requirements and identified the major application areas.

The core areas identified included:

1. Authentication
2. Onboarding
3. Medication management
4. Medication history
5. Symptom tracking
6. Symptom check-ins
7. User profiles
8. Dependent profiles
9. History
10. Settings
11. Notifications/reminders
12. Dashboard/Home experience

The team then translated these requirements into:

* Pages
* Components
* Routes
* Application state
* API requirements
* Reusable UI elements

---

# 5. Step 2 – Translating Design into Frontend Requirements

The frontend team used the provided product designs as the visual reference for implementation.

The design-to-development process was:

```text
Figma Design
     ↓
Identify Screen
     ↓
Identify UI Elements
     ↓
Identify Reusable Components
     ↓
Determine Required State
     ↓
Determine User Interaction
     ↓
Implement React Component
     ↓
Apply CSS / Bootstrap
     ↓
Test Responsive Behaviour
```

Instead of treating every Figma frame as an independent page, common visual patterns were identified and converted into reusable components.

For example:

```text
Medication Screen
       │
       ├── MedicationList
       │      └── MedicationCard
       │
       ├── MedicationForm
       │
       └── MedicationStatus
```

This reduces duplication and makes future design changes easier to implement.

---

# 6. Step 3 – Establishing the React + Vite Foundation

The frontend application was established using:

* React
* Vite
* JavaScript
* Bootstrap
* Axios
* React Router

Vite provided the development and production build environment.

The development workflow was based around:

```bash
npm install
npm run dev
npm run build
npm run preview
```

The production build generates the static frontend assets required for deployment.

---

# 7. Step 4 – Frontend Project Structure

The project was organized according to application responsibility rather than placing everything inside a single component or page.

## Implemented Frontend Structure

```text
frontend/
└── src/
    │
    ├── assets/
    │   ├── images/
    │   │   └── mycare-logo.png
    │   └── hero.png
    │
    ├── components/
    │   │
    │   ├── common/
    │   │   ├── EmptyState.jsx
    │   │   ├── ErrorMessage.jsx
    │   │   └── Loading.jsx
    │   │
    │   ├── history/
    │   │   ├── HistoryFilter.jsx
    │   │   └── HistoryItem.jsx
    │   │
    │   ├── layout/
    │   │   ├── AppShell.jsx
    │   │   ├── Header.jsx
    │   │   └── Footer.jsx
    │   │
    │   ├── medication/
    │   │   ├── MedicationCard.jsx
    │   │   ├── MedicationForm.jsx
    │   │   ├── MedicationList.jsx
    │   │   ├── MedicationPreview.jsx
    │   │   └── MedicationStatus.jsx
    │   │
    │   ├── profile/
    │   │   ├── ProfileCard.jsx
    │   │   └── ProfileSwitcher.jsx
    │   │
    │   └── symptoms/
    │       ├── CheckInCard.jsx
    │       ├── SymptomCard.jsx
    │       └── SymptomForm.jsx
    │
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── ThemeContext.jsx
    │   ├── useAuth.jsx
    │   └── useTheme.jsx
    │
    ├── pages/
    │   ├── Home.jsx
    │   ├── Dashboard.jsx
    │   ├── Medications.jsx
    │   ├── AddMedication.jsx
    │   ├── EditMedication.jsx
    │   ├── Symptoms.jsx
    │   ├── LogSymptom.jsx
    │   ├── SymptomCheckIn.jsx
    │   ├── SymptomHistory.jsx
    │   ├── History.jsx
    │   ├── Profile.jsx
    │   ├── Profiles.jsx
    │   ├── Reports.jsx
    │   ├── Settings.jsx
    │   │
    │   ├── auth/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── VerifyOTP.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   └── ResetPassword.jsx
    │   │
    │   └── onboarding/
    │       ├── PersonalInfo.jsx
    │       ├── FirstMedication.jsx
    │       └── Trial.jsx
    │
    ├── services/
    │   └── api.js
    │
    ├── styles/
    │   └── mycare.css
    │
    ├── App.jsx
    ├── App.css
    ├── index.css
    └── main.jsx
```

> **Note:** `BottomNavigation.jsx` is intentionally not included because Bottom Navigation was removed from the final frontend structure.

---

# 8. Understanding the Project Structure

The structure separates application responsibilities.

## `assets/`

Contains application images and visual assets.

Example:

```text
assets/
└── images/
    └── mycare-logo.png
```

---

## `components/`

Contains reusable UI components.

Components were separated by functional responsibility.

```text
components/
├── common/
├── history/
├── layout/
├── medication/
├── profile/
└── symptoms/
```

This prevents large page components from becoming difficult to maintain.

---

## `components/common/`

Contains components that can be reused across multiple features.

Examples:

```text
Loading.jsx
ErrorMessage.jsx
EmptyState.jsx
```

### Example use

```jsx
{loading && <Loading />}
{error && <ErrorMessage message={error} />}
{items.length === 0 && <EmptyState />}
```

This demonstrates reusable component design and conditional rendering.

React supports conditional rendering through normal JavaScript conditions, logical `&&`, and ternary expressions.

---

# 9. Reusable Component Development

One of the important frontend principles demonstrated in MY CARE was **component reusability**.

Instead of writing the same UI repeatedly, common functionality was extracted into components.

For example:

```text
MedicationList
      ↓
MedicationCard
      ↓
MedicationStatus
```

A medication card can receive medication information through props:

```jsx
<MedicationCard
  medication={medication}
  onEdit={handleEditMedication}
  onDelete={handleDeleteMedication}
/>
```

The component therefore does not need to know where the medication data came from.

It only needs to know:

* What medication data it received
* What action should happen when the user interacts with it

This separation makes components easier to reuse and test.

---

# 10. Props and Parent-to-Child Data Flow

The frontend demonstrated React's parent-to-child data flow using props.

The basic pattern was:

```text
Parent Component
      │
      │ props
      ↓
Child Component
      │
      │ event callback
      ↓
Parent State Update
```

For example:

```jsx
<MedicationForm
  medication={medication}
  onChange={handleMedicationChange}
  onSubmit={handleMedicationSubmit}
/>
```

The parent owns the data and functions while the child focuses on displaying and collecting user input.

This follows a core React pattern in which information is passed down through props and event handlers can be passed down to allow child components to trigger updates in the parent.

---

# 11. State Management

React state was used to manage information that changes during application use.

Examples include:

* Form values
* Loading state
* Error state
* Authentication state
* Theme
* Medication information
* UI interaction state
* API response data

Typical React state follows the pattern:

```jsx
const [medication, setMedication] = useState(initialMedication);
```

Event handlers were given descriptive names.

Examples:

```text
handleMedicationChange
handleMedicationSubmit
handleMedicationReset
handleThemeToggle
handleSymptomSubmit
handleProfileSwitch
```

This makes the code easier to understand than using generic names such as:

```text
handleChange
handleSubmit
handleClick
```

---

# 12. Controlled Forms

The frontend used controlled form patterns for data-entry screens.

For example:

```jsx
<input
  name="name"
  value={medication.name}
  onChange={handleMedicationChange}
/>
```

The React state becomes the source of truth for the form.

The general flow is:

```text
User types
    ↓
onChange
    ↓
handleMedicationChange()
    ↓
setMedication()
    ↓
React re-renders
    ↓
Updated form value
```

This approach allows the frontend to validate and prepare the data before sending it to the backend.

---

# 13. Lifting State Up

Where multiple components needed access to the same information, state could be maintained by their closest appropriate common parent and passed through props.

Example:

```text
MedicationPage
     │
     ├── MedicationForm
     │
     └── MedicationPreview
```

The parent can own the medication form state:

```jsx
const [medication, setMedication] = useState(initialMedication);
```

Then pass it to both components:

```jsx
<MedicationForm
  medication={medication}
  onChange={handleMedicationChange}
/>

<MedicationPreview
  medication={medication}
/>
```

This ensures that both components work from the same source of truth.

React describes this approach as "lifting state up" and recommends it when components need to stay synchronized.

---

# 14. Context API

Some application-wide information should not need to be passed manually through many levels of components.

The frontend therefore established React Context for cross-application concerns.

Two important contexts were:

```text
context/
├── AuthContext.jsx
└── ThemeContext.jsx
```

---

## 14.1 Authentication Context

`AuthContext` provides a central location for authentication-related application state.

Conceptually:

```text
AuthProvider
      │
      ├── Login
      ├── Signup
      ├── VerifyOTP
      ├── Dashboard
      ├── Profile
      └── Other authenticated screens
```

This avoids unnecessary prop drilling for authentication information.

---

## 14.2 Theme Context

`ThemeContext` manages application appearance.

The theme flow is:

```text
ThemeProvider
      ↓
theme state
      ↓
handleThemeToggle()
      ↓
HTML data-theme
      ↓
CSS theme variables
```

The theme preference can also be persisted using browser storage.

A separate `useTheme` hook provides a cleaner interface for components consuming the theme context.

---

# 15. Why the Context Hooks Were Separated

The project separates context definitions from custom hooks:

```text
ThemeContext.jsx
useTheme.jsx
```

and similarly for authentication where appropriate.

This separation keeps:

* Context definition
* Provider implementation
* Consumer hook

more organized.

It also helps avoid mixing too many responsibilities into a single context module.

---

# 16. Application Shell

The shared application structure is managed through:

```text
components/layout/
├── AppShell.jsx
├── Header.jsx
└── Footer.jsx
```

The application shell provides the common page structure.

Conceptually:

```text
App
 │
 └── AppShell
      │
      ├── Header
      │
      ├── Main Content
      │
      └── Footer
```

Individual pages are rendered inside the main content area.

This prevents every page from having to recreate the same header/footer structure.

---

# 17. Routing

React Router was used to manage navigation between application screens.

The route structure separates pages logically.

Example:

```text
/
├── /login
├── /signup
├── /verify-otp
├── /forgot-password
├── /reset-password
│
├── /home
├── /dashboard
├── /medications
├── /medications/add
├── /medications/edit
│
├── /symptoms
├── /symptoms/log
├── /symptoms/check-in
├── /symptoms/history
│
├── /history
├── /profile
├── /profiles
└── /settings
```

This gives the application a predictable navigation structure and allows individual pages to remain focused on their specific responsibilities.

---

# 18. Authentication Frontend

The authentication area includes:

```text
auth/
├── Login.jsx
├── Signup.jsx
├── VerifyOTP.jsx
├── ForgotPassword.jsx
└── ResetPassword.jsx
```

The frontend authentication workflow was designed around:

```text
Signup/Login
     ↓
Authentication Request
     ↓
OTP Verification
     ↓
Authentication Result
     ↓
Application Access
```

The frontend is responsible for:

* Rendering authentication forms
* Capturing user input
* Validating required fields
* Sending requests
* Handling loading states
* Handling API errors
* Processing successful responses
* Updating authentication state
* Redirecting users where appropriate

The backend remains responsible for actual authentication/security decisions.

---

# 19. Axios API Integration

Axios was used as the frontend HTTP client for communication with the backend.

The API service is located at:

```text
src/services/api.js
```

The purpose of this file is to provide a centralized API configuration rather than scattering raw Axios configuration throughout every page.

Conceptually:

```text
React Component
      ↓
API Function
      ↓
Axios
      ↓
Backend API
      ↓
Response
      ↓
React State
      ↓
UI
```

---

# 20. API Integration Pattern

A feature such as medications follows this general pattern:

```text
User Interaction
      ↓
React Event Handler
      ↓
API Service
      ↓
Axios Request
      ↓
Backend Endpoint
      ↓
Database / Server Logic
      ↓
API Response
      ↓
Frontend State Update
      ↓
UI Re-render
```

For example:

```jsx
async function fetchMedications() {
  try {
    setLoading(true);

    const response = await api.get("/medications");

    setMedications(response.data);
  } catch (error) {
    setError("Unable to load medications.");
  } finally {
    setLoading(false);
  }
}
```

The important separation is that the page should focus on application behaviour while API configuration is centralized in the service layer.

---

# 21. API Loading, Error and Empty States

A real application cannot assume that API requests will always succeed.

The frontend therefore accounts for three important states:

```text
Loading
   ↓
Success
   ↓
Data / Empty

OR

Loading
   ↓
Error
```

Reusable components were created for this purpose:

```text
Loading.jsx
ErrorMessage.jsx
EmptyState.jsx
```

Example:

```jsx
if (loading) {
  return <Loading />;
}

if (error) {
  return <ErrorMessage message={error} />;
}

if (!medications.length) {
  return <EmptyState message="No medications found." />;
}
```

This makes the user experience more predictable and prevents blank screens when an API request is slow or unsuccessful.

---

# 22. Medication Feature

Medication management was one of the major frontend feature areas.

The feature was divided into smaller components:

```text
Medication
│
├── MedicationList
│
├── MedicationCard
│
├── MedicationForm
│
├── MedicationPreview
│
└── MedicationStatus
```

This separation makes it possible to develop and maintain each responsibility independently.

### Medication workflow

```text
Medication List
      ↓
Add Medication
      ↓
Medication Form
      ↓
Validation
      ↓
Submit
      ↓
Axios API Request
      ↓
Backend
      ↓
Response
      ↓
Update UI
```

The same architecture can support:

* Creating medication
* Reading medication
* Editing medication
* Deleting medication
* Displaying medication status

---

# 23. Symptoms Feature

Symptoms were similarly divided into smaller reusable pieces.

```text
Symptoms
│
├── SymptomCard
│
├── SymptomForm
│
├── CheckInCard
│
└── SymptomHistory
```

The general flow is:

```text
Symptoms
    ↓
Log Symptom
    ↓
Select Symptom
    ↓
Select Severity
    ↓
Review
    ↓
Submit
    ↓
API
    ↓
History
```

The frontend focuses on collecting and presenting the user's information.

The application does not attempt to replace professional medical diagnosis.

---

# 24. Profile Feature

Profile-related screens were separated into pages and reusable components.

Examples include:

```text
Profile.jsx
Profiles.jsx
ProfileCard.jsx
ProfileSwitcher.jsx
```

A profile card can receive profile data as props:

```jsx
<ProfileCard
  profile={profile}
  onSelect={handleProfileSwitch}
/>
```

This allows the same component to display different profiles without duplicating the UI code.

---

# 25. History Feature

History functionality was separated into reusable pieces:

```text
History.jsx
HistoryFilter.jsx
HistoryItem.jsx
```

This allows historical information to be:

* Displayed consistently
* Filtered
* Reused
* Updated independently from the main page

The filtering interface can receive the current filter and callback through props.

---

# 26. Responsive and Mobile-First Development

The frontend was developed with a mobile-first mindset because MY CARE is intended to provide a convenient healthcare experience on smaller screens.

The implementation considered:

* Small-screen layouts
* Touch-friendly controls
* Flexible containers
* Responsive typography
* Responsive cards
* Responsive forms
* Desktop adaptation
* Consistent spacing
* Readable content hierarchy

Bootstrap utilities and custom CSS were used together.

Bootstrap handled common responsive layout requirements while custom CSS handled MY CARE-specific styling.

---

# 27. Custom Styling

Project-specific styling was organized in:

```text
src/styles/mycare.css
```

Additional global styles were maintained through:

```text
src/index.css
src/App.css
```

The purpose was to avoid placing large amounts of styling directly inside JSX.

The design system was progressively translated into:

* Typography
* Spacing
* Buttons
* Cards
* Form controls
* Backgrounds
* Theme variables
* Responsive behaviour

---

# 28. Git and GitHub Collaboration

The frontend team used Git for version control and GitHub for collaborative development.

The team followed a branch-based workflow.

Typical workflow:

```text
main
 │
 ├── feature/frontend-foundation
 │
 ├── feature/auth
 │
 ├── feature/medications
 │
 ├── feature/symptoms
 │
 ├── feature/profile
 │
 └── feature/history
```

Developers avoided working directly on `main`.

The general workflow was:

```bash
git switch main
git pull origin main

git switch -c feature/<feature-name>
```

After implementation:

```bash
git add .
git commit -m "feat: implement medication form"

git push origin feature/<feature-name>
```

The branch could then be reviewed and merged into the main project.

---

# 29. Commit Convention

Meaningful commit messages were encouraged.

Examples:

```text
feat: add medication form
feat: implement symptom logging
feat: add authentication screens
fix: resolve medication form validation
fix: correct routing configuration
style: improve medication card layout
refactor: extract reusable loading component
chore: update frontend dependencies
docs: update frontend documentation
```

This makes the project history easier to understand.

---

# 30. Debugging and Problem Solving

During development, several common frontend integration issues were addressed.

Examples of issues included:

* Routing configuration problems
* Duplicate Router configuration
* CSS import problems
* Theme context organisation
* Component communication
* Form state handling
* API communication
* Loading and error states
* Responsive layout issues
* Component integration problems

One important routing issue occurred when multiple Router providers were introduced.

The problem was caused by having `BrowserRouter` in more than one location.

The architecture was corrected so that the main application entry point owns the router:

```text
main.jsx
   ↓
BrowserRouter
   ↓
ThemeProvider
   ↓
AuthProvider
   ↓
App
```

This established a cleaner application provider hierarchy.

---

# 31. Provider Architecture

The application provider structure follows this general pattern:

```text
main.jsx
│
└── BrowserRouter
     │
     └── ThemeProvider
          │
          └── AuthProvider
               │
               └── App
```

This makes application-wide concerns available to the components that need them.

---

# 32. React Skills Demonstrated

The MY CARE frontend demonstrates a broad range of React development skills.

## Core React

* Functional components
* JSX
* Component composition
* Props
* State
* Event handling
* Conditional rendering
* List rendering
* Form handling

## React Hooks

* `useState`
* `useEffect`
* `useContext`
* Custom hooks

## State Management

* Local component state
* Shared state
* Lifting state
* Context API
* Derived UI state
* Loading state
* Error state

## Component Architecture

* Reusable components
* Feature-based components
* Layout components
* Common UI components
* Controlled forms
* Parent-child communication

## Routing

* React Router
* Route organisation
* Nested application areas
* Authentication routes
* Feature routes

## API Integration

* Axios
* HTTP requests
* API service layer
* Async/await
* Request loading states
* Error handling
* Response handling
* Backend integration

## Frontend Engineering

* Responsive UI
* Mobile-first development
* CSS organisation
* Bootstrap
* Theme support
* Git
* GitHub
* Production builds
* Deployment

---

# 33. Frontend Architecture Summary

The overall architecture can be represented as:

```text
                    MY CARE FRONTEND
                           │
                           ▼
                      main.jsx
                           │
             ┌─────────────┴─────────────┐
             │                           │
       BrowserRouter               Providers
             │                 ┌─────────┴─────────┐
             │                 │                   │
             │          ThemeProvider         AuthProvider
             │                 │                   │
             └─────────────────┴───────────────────┘
                           │
                           ▼
                          App
                           │
                           ▼
                       AppShell
                           │
                ┌──────────┴──────────┐
                │                     │
             Header              Page Content
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
           Medication             Symptoms              Profile
                │                     │                     │
        ┌───────┴───────┐      ┌──────┴──────┐       ┌─────┴─────┐
        │               │      │             │       │           │
       Form           Card    Form        CheckIn   Card      Switcher
        │               │      │             │
        └───────────────┴──────┴─────────────┘
                           │
                           ▼
                      API Service
                         api.js
                           │
                           ▼
                         Axios
                           │
                           ▼
                      Backend API
```

---

# 34. Frontend-to-Backend Integration Architecture

The frontend does not directly communicate with the database.

The intended architecture is:

```text
React Frontend
      │
      │ HTTP / Axios
      ▼
Node.js / Express API
      │
      ▼
Backend Services
      │
      ▼
Database
```

This separation is important because the frontend should consume API endpoints rather than directly accessing the application's database.

---

# 35. Example Data Flow

A medication creation request demonstrates the overall architecture:

```text
User
 │
 │ enters medication
 ▼
MedicationForm
 │
 │ onChange
 ▼
React State
 │
 │ submit
 ▼
handleMedicationSubmit()
 │
 ▼
API Service
 │
 ▼
Axios POST
 │
 ▼
Backend API
 │
 ▼
Database
 │
 ▼
Response
 │
 ▼
setMedications()
 │
 ▼
MedicationList
 │
 ▼
MedicationCard
```

This represents the full frontend-to-backend data lifecycle.

---

# 36. Quality and Maintainability Principles

The frontend team followed several maintainability principles.

### 1. Avoid unnecessary duplication

Common UI was extracted into reusable components.

### 2. Keep components focused

Components should have a clear responsibility.

### 3. Use descriptive function names

Examples:

```text
handleMedicationChange
handleMedicationSubmit
handleMedicationDelete
handleThemeToggle
handleProfileSwitch
handleSymptomSubmit
```

### 4. Separate API communication

Axios/API logic belongs in the service layer rather than being duplicated throughout the UI.

### 5. Provide user feedback

Users should receive appropriate:

* Loading indicators
* Error messages
* Empty states
* Success feedback where applicable

### 6. Keep application state intentional

State should be placed at the appropriate component or context level rather than duplicating the same state across unrelated components.

React's documentation similarly recommends intentionally structuring state and maintaining a single source of truth for shared state.

---

# 37. Production Build

Before deployment, the frontend was prepared for production using:

```bash
npm run build
```

This creates the production build output.

The production build should be tested locally before deployment:

```bash
npm run preview
```

The Vite documentation recommends the production build process for static deployment and distinguishes `vite preview` as a local preview tool rather than a production server.

---

# 38. GitHub Pages Deployment

The MY CARE frontend was deployed through GitHub Pages.

### Repository

```text
capstoneadvmay26/mycare
```

### Deployment

**GitHub Pages**

The live frontend deployment is available at:

[MY CARE – Live GitHub Pages Application](https://capstoneadvmay26.github.io/mycare/?utm_source=chatgpt.com)

For a Vite application deployed under a repository path such as `/mycare/`, the Vite configuration needs to account for the repository base path. Vite's official deployment documentation specifically describes this requirement for GitHub Pages deployments.

---

# 39. Deployment Workflow

The deployment lifecycle is:

```text
Developer Code
      ↓
Git Commit
      ↓
Push to GitHub
      ↓
Production Build
      ↓
GitHub Pages
      ↓
Live Application
```

The deployment process ensures that the version stored in the GitHub repository can be converted into a publicly accessible frontend application.

---

# 40. Frontend Development Responsibilities Summary

| Area                    | Nurudeen | Zavirah | Shared |
| ----------------------- | -------- | ------- | ------ |
| Frontend foundation     | Lead     | Support | ✓      |
| React/Vite setup        | Lead     | Support | ✓      |
| Routing                 | Lead     | Support | ✓      |
| AppShell/Layout         | Lead     | Support | ✓      |
| Authentication UI       | Lead     | Support | ✓      |
| Axios/API foundation    | Lead     | Support | ✓      |
| Medication              | Lead     | Support | ✓      |
| Symptoms                | Lead     | Support | ✓      |
| Profile                 | Support  | Lead    | ✓      |
| History                 | Support  | Lead    | ✓      |
| Settings                | Support  | Lead    | ✓      |
| Notifications/Reminders | Support  | Lead    | ✓      |
| Reusable components     | ✓        | ✓       | ✓      |
| Responsive design       | ✓        | ✓       | ✓      |
| Git/GitHub              | ✓        | ✓       | ✓      |
| Debugging               | ✓        | ✓       | ✓      |
| Design alignment        | ✓        | ✓       | ✓      |
| Integration testing     | ✓        | ✓       | ✓      |
| Deployment              | Lead     | Support | ✓      |

---

# 41. What the Frontend Team Delivered

The frontend development established a React-based application foundation capable of supporting the MY CARE healthcare product.

Key deliverables include:

* React + Vite application
* Feature-based project structure
* Reusable React components
* Shared application layout
* React Router navigation
* Authentication screens
* Onboarding screens
* Medication screens/components
* Symptom screens/components
* Profile screens/components
* History screens/components
* Settings
* Theme management
* Authentication context
* API service layer
* Axios integration
* Loading states
* Error states
* Empty states
* Responsive styling
* Bootstrap integration
* Git/GitHub workflow
* Production build
* GitHub Pages deployment

---

# 42. Lessons and Technical Growth

The MY CARE project provided practical experience beyond writing individual React components.

The frontend team learned how to move from:

```text
Learning React
      ↓
Building Small Components
      ↓
Building Pages
      ↓
Connecting Pages
      ↓
Managing Shared State
      ↓
Working With APIs
      ↓
Collaborating Through Git
      ↓
Integrating With Backend
      ↓
Building a Production Application
```

For Nurudeen in particular, the project provided practical experience in connecting previously learned React concepts such as:

* `useState`
* Props
* Parent-child communication
* Controlled forms
* Event handlers
* Reusable components

with more advanced application-level concepts such as:

* Context API
* Routing
* Axios
* API services
* Authentication flows
* Backend integration
* Production builds
* GitHub deployment

The project therefore represents a transition from isolated React exercises toward real-world frontend application development.

---

# 43. Current Frontend Architecture at a Glance

```text
MY CARE
│
├── React + Vite
│
├── Bootstrap + Custom CSS
│
├── React Router
│
├── Context API
│   ├── Authentication
│   └── Theme
│
├── Reusable Components
│   ├── Common
│   ├── Layout
│   ├── Medication
│   ├── Symptoms
│   ├── Profile
│   └── History
│
├── Pages
│   ├── Authentication
│   ├── Onboarding
│   ├── Dashboard
│   ├── Medication
│   ├── Symptoms
│   ├── History
│   ├── Profile
│   └── Settings
│
├── API Layer
│   └── Axios
│
├── Backend
│   └── REST API
│
└── Deployment
    └── GitHub Pages
```

---

# 44. Conclusion

The MY CARE frontend was developed collaboratively by **Nurudeen AbdulSalam** and **Zavirah** using a structured React development approach.

The implementation demonstrates the ability to move from product requirements and visual designs to a functional frontend architecture.

The project demonstrates practical knowledge of:

* React
* JavaScript
* JSX
* Components
* Props
* State management
* Hooks
* Context API
* Custom hooks
* Forms
* Conditional rendering
* Routing
* Reusable components
* Axios
* REST API integration
* Authentication flows
* Responsive design
* Bootstrap
* CSS
* Git
* GitHub
* Production builds
* GitHub Pages deployment

Most importantly, the frontend was not treated simply as a collection of screens. It was structured as a maintainable application in which **pages, reusable components, application state, API communication and backend integration work together as a single frontend system**.

---

## Live Application

[Open the MY CARE Live Application](https://capstoneadvmay26.github.io/mycare/?utm_source=chatgpt.com)

## Source Repository

[MY CARE GitHub Repository](https://github.com/capstoneadvmay26/mycare?utm_source=chatgpt.com)

---

## Frontend Developers

**Nurudeen AbdulSalam**
Frontend Developer 1 / Frontend Lead

**Zavirah**
Frontend Developer 2

**MY CARE – Healthcare Technology Capstone Project**s
