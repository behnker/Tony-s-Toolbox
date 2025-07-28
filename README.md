# Tony's Toolbox: AI Tool Explorer

This is a Next.js web application that serves as a curated directory of AI tools. It allows users to discover, submit, and vote on various AI tools and workflows. The project is built on the Firebase platform and utilizes Genkit for its AI-powered features.

## Technology Stack

This project is built with a modern, full-stack TypeScript architecture:

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components.
- **Backend & Database**: [Firebase](https://firebase.google.com/)
  - **App Hosting**: For deploying and hosting the Next.js application.
  - **Firestore**: As the NoSQL database for storing tool information.
  - **Cloud Storage**: For storing user-uploaded tool images.
- **AI Integration**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
  - **Gemini API**: Used via Genkit to power AI flows for metadata generation.
- **Deployment**: [Google Cloud Build](https://cloud.google.com/build) for continuous integration and deployment, triggered by pushes to the `master` branch.

## Getting Started: A Step-by-Step Guide

Follow these instructions to get a complete local development environment running.

### 1. Clone the Repository

First, clone the project to your local machine:

```bash
git clone https://github.com/behnker/Tony-s-Toolbox.git
cd Tony-s-Toolbox
```

### 2. Install Dependencies

Install the necessary Node.js packages using npm:

```bash
npm install
```

### 3. Initialize Firebase

To connect the project to your Firebase account and run the local emulators, you need to have the Firebase CLI installed and configured.

**A. Install the Firebase CLI:**
If you don't have it, install it globally:
```bash
npm install -g firebase-tools
```

**B. Log in to Firebase:**
```bash
firebase login
```

**C. Set up the Project:**
Run the `init` command. It will ask you a series of questions.
```bash
firebase init
```
When prompted, select the following options:
- **Project Setup**: Use an existing project (`ai-tool-explorer-txijl`).
- **Features to set up**:
  - `Firestore`
  - `App Hosting`
  - `Storage`
- **Emulators**:
  - `Authentication Emulator`
  - `Firestore Emulator`
  - `Storage Emulator`
  - `App Hosting Emulator`

Accept the default options for all other prompts (file names, port numbers, etc.). Do **not** overwrite any existing files (`firestore.rules`, `storage.rules`, etc.).

### 4. Run the Local Development Environment

This project uses the Firebase Emulators to simulate the entire backend locally.

To start both the Next.js application and all the Firebase emulators, run the following command:

```bash
firebase emulators:start
```

This will:
- Start the Next.js development server.
- Start the Firestore, Storage, and Auth emulators.
- Provide you with a link to the **Emulator UI**, a powerful dashboard for viewing and managing your local database and storage.
- Your application will be running at **`http://localhost:9005`**.

## Development Workflow

### Running Quality Checks

Before committing and pushing any code, it is essential to run the local quality checks. The automated deployment will **not** block a deployment for linting errors, so this responsibility is on the developer.

**A. Run the Linter:**
Checks for code style issues and potential bugs.
```bash
npm run lint
```

**B. Run the Type Checker:**
Checks for any TypeScript errors.
```bash
npm run typecheck
```

### Pushing and Deploying

The project is configured for **Continuous Deployment**. Every push to the `master` branch will automatically trigger a new build and deployment via Google Cloud Build.

1.  **Commit your changes:**
    ```bash
    git add .
    git commit -m "feat: Describe your new feature or fix"
    ```

2.  **Push to the repository:**
    ```bash
    git push origin master
    ```

3.  **Monitor the deployment:** You can watch the build's progress in the [Google Cloud Build Console](https://console.cloud.google.com/cloud-build/builds?project=ai-tool-explorer-txijl). Once the build succeeds, the changes will be live.

## Important Project Notes

### Genkit API Route Syntax

The Genkit API route at `src/app/api/genkit/route.ts` has been updated to use the latest syntax for the `@genkit-ai/next` library. The key takeaways are:
- The `nextJsHandler` function is a **default export**.
- The new API only supports **one flow per API route**.
- The handler expects the flow to be passed **directly as an argument**.

Correct implementation:
```typescript
import nextJsHandler from '@genkit-ai/next';
import { generateToolMetadataFlow } from '@/ai/flows/generate-tool-metadata';

const handler = nextJsHandler(generateToolMetadataFlow);

export const GET = handler;
export const POST = handler;
```

### CORS Configuration for File Uploads

If you encounter CORS errors when uploading files to Firebase Storage in a new environment, you will need to apply the CORS configuration.

1.  **Authenticate with the Google Cloud CLI:**
    ```bash
    gcloud auth login
    ```

2.  **Apply the configuration:**
    ```bash
    gcloud storage buckets update gs://[YOUR_BUCKET_ID] --cors-file=./cors.json
    ```
    (Replace `[YOUR_BUCKET_ID]` with your project's storage bucket ID, e.g., `ai-tool-explorer-txijl.appspot.com`).
