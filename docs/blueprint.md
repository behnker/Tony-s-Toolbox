# AI Tool Explorer - Application Blueprint

## 1. Project Overview

**AI Tool Explorer** is a web application designed to be a community-driven directory of AI tools. Users can browse a curated list of tools, filter and sort them based on various criteria, and submit new tools to the directory. The application will leverage AI to automatically generate metadata for submitted tools, ensuring high-quality and consistent listings.

## 2. Core Features

### 2.1. Tool Directory
- **Display Tools:** The main page will display all submitted AI tools in a card-based layout.
- **Tool Card:** Each card will display the tool's name, a short description, categories, pricing, an image, and its upvote/downvote count.
- **Filtering:** Users can filter the displayed tools by category, price, and ease of use.
- **Sorting:** Users can sort the tools by submission date, upvotes, or name.

### 2.2. Tool Submission
- **Submission Dialog:** A user-friendly dialog will allow users to submit a new tool by providing its URL and a brief justification for its inclusion.
- **AI-Powered Metadata Generation:** Upon submission, the system will trigger an AI-powered workflow:
    1.  Fetch the content from the provided URL.
    2.  Use a large language model (LLM) to analyze the content and extract/generate the tool's name, description, categories, and other relevant metadata.
    3.  The generated data will be used to create a new tool entry in the database.
- **Image Upload:** Users can upload a custom image for the tool. This image will be stored in a dedicated cloud storage bucket.

### 2.3. Community Interaction
- **Voting:** Users can upvote or downvote each tool. The total counts will be publicly visible.

## 3. Technology Stack

This stack is chosen for its focus on stability, modern features, and seamless integration.

- **Framework:** [Next.js](https://nextjs.org/) (v14 - Latest Stable)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for pre-built, accessible components.
- **Backend & Database:** [Firebase](https://firebase.google.com/)
    - **Firestore:** NoSQL database for storing tool information.
    - **Cloud Storage:** For hosting user-uploaded tool images.
- **AI & Generative Workflows:** [Google AI - Genkit](https://firebase.google.com/docs/genkit)
    - **Model:** Google's Gemini model for metadata generation.
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) for a managed, serverless Next.js environment.

## 4. Data Models

### 4.1. Tool (`firestore` collection: `tools`)

This model defines the structure for each AI tool stored in Firestore.

| Field         | Type              | Description                                                    | Example                                    |
|---------------|-------------------|----------------------------------------------------------------|--------------------------------------------|
| `id`          | `string`          | Unique identifier (document ID).                               | `pY8b...`                                  |
| `name`        | `string`          | The official name of the tool.                                 | "Notion AI"                                |
| `description` | `string`          | A concise, AI-generated summary of the tool's function.        | "An AI assistant integrated into Notion..."|
| `url`         | `string`          | The official URL of the tool's website.                        | "https://www.notion.so/product/ai"         |
| `categories`  | `array` of `string` | A list of categories the tool belongs to.                      | `["productivity", "note-taking"]`          |
| `price`       | `string`          | The pricing model (e.g., "Free", "Paid", "Freemium").          | "Paid"                                     |
| `easeOfUse`   | `string`          | The user-friendliness (e.g., "Beginner", "Intermediate").      | "Beginner"                                 |
| `submittedBy` | `string`          | An identifier for the user who submitted the tool.             | "ProductivityHackr"                        |
| `justification`| `string`          | The user's reason for recommending the tool.                   | "Seamlessly blends into my workflow..."    |
| `upvotes`     | `number`          | The total number of upvotes. Initialized to `0`.               | `98`                                       |
| `downvotes`   | `number`          | The total number of downvotes. Initialized to `0`.             | `7`                                        |
| `imageUrl`    | `string` (URL)    | A URL pointing to the tool's image in Cloud Storage.           | "https://storage.googleapis.com/..."       |
| `submittedAt` | `Timestamp`       | The date and time the tool was submitted.                      | `February 20, 2024 at 2:30:00 PM UTC`      |
| `lastUpdatedAt`| `Timestamp` (optional) | The date and time the tool's metadata was last updated. | `March 1, 2024 at 10:00:00 AM UTC`       |

## 5. High-Level Architecture

1.  **Frontend (Next.js):** The user interface is built with server and client components. It handles displaying the tool directory and the submission dialog.
2.  **Backend (Firebase/Next.js API Routes):**
    - Firestore is the single source of truth for all tool data.
    - Server Actions in Next.js are used to handle form submissions and voting actions securely.
3.  **AI Workflow (Genkit):**
    - A Genkit flow is defined and exposed via a Next.js API route (`/api/genkit`).
    - When a user submits a tool URL, the frontend calls a Server Action, which in turn invokes the Genkit flow.
    - The flow fetches website content and uses the Gemini model to generate the required metadata, then writes the new `Tool` object to Firestore.
4.  **File Storage (Firebase Cloud Storage):**
    - The client-side application directly uploads images to a designated Firebase Storage bucket.
    - Security rules ensure that only authenticated users can upload approved file types and sizes.
    - The resulting public URL is then attached to the corresponding `Tool` document in Firestore.

This blueprint provides a clear and stable path forward. I am confident that by following this specification, you will be able to build your application successfully.
