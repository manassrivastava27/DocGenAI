# DocGen AI Platform

**DocGen AI** is an intelligent document authoring platform that leverages Google's Gemini AI to generate, refine, and export structured business documents (Microsoft Word) and presentations (PowerPoint).

## 🚀 Features

-   **Dual Format Support**: Create professional Reports (`.docx`) or Slide Decks (`.pptx`).
-   **AI-Powered Wizard**:
    -   **Smart Outlining**: Automatically generates a structured outline based on your topic.
    -   **Context-Aware Generation**: Writes content section-by-section, maintaining context from previous parts of the document.
-   **Refinement Tools**: Use AI to rewrite, shorten, expand, or change the tone of specific sections.
-   **Project Management**: Dashboard to save, track, and manage multiple document projects.
-   **Export**: Instant client-side generation of `.docx` and `.pptx` files.
-   **Secure Authentication**: User accounts managed via Firebase Authentication.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
-   **Backend / DB**: Firebase v10 (Firestore & Authentication)
-   **Document Engines**: `docx` (Word) and `pptxgenjs` (PowerPoint)
-   **Icons**: Lucide React

## ⚙️ Configuration & Setup

### 1. Prerequisites
-   Node.js (v16+)
-   A Google Cloud / AI Studio API Key
-   A Firebase Project

### 2. Environment Variables (IMPORTANT)
**You must create a local environment file for the app to work.**

1. Create a file named `.env` in the root directory (same level as `package.json`).
2. Add your Gemini API key:

```env
VITE_API_KEY=your_actual_google_api_key_here
```

### 3. Firebase Setup
The project uses Firebase for authentication and data storage.
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Authentication**: Enable **Email/Password** and **Anonymous** sign-in providers.
4.  **Firestore**: Create a database.
5.  **Rules**: Update Firestore rules to allow authenticated access:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```
6.  Update `services/firebase.ts` with your project's configuration keys.

### 4. Installation
Install the required dependencies:

```bash
npm install
```

### 5. Running the App
Start the development server:

```bash
npm run dev
```

## ❓ Troubleshooting

**"Error generating content" or "API Key Missing"**
- Ensure you have created the `.env` file.
- Ensure the variable name is exactly `VITE_API_KEY`.
- Restart the development server (`npm run dev`) after creating the .env file.

## 📖 Usage Guide

1.  **Sign Up/Login**: Create an account to access the dashboard.
2.  **Create Project**: Click "New Project" and follow the wizard steps (Select Type -> Define Topic -> Review Outline).
3.  **Editor**:
    -   Select a section from the sidebar.
    -   Click **"Generate Content"** to let AI draft the text.
    -   Use the **Refine** input to tweak specific parts.
    -   Add comments or feedback (Thumbs up/down).
4.  **Export**: Click the "Export" button in the top right to download your file.

## 📄 License
MIT