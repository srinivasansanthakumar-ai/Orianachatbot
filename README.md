# Oriana Assistant RAG Bot

A client-side RAG (Retrieval-Augmented Generation) chatbot for GRT Jewels Oriana brand, built with React, Vite, and Google Gemini API.

## 🚨 Vercel Deployment Troubleshooting 🚨

**If you see `npm error code ETARGET` or `No matching version found for @google/genai`:**

This is caused by an old `package-lock.json` file in your repository.
1. Go to your GitHub Repository.
2. Find the file named `package-lock.json`.
3. **Delete it.**
4. Commit the change.
5. Redeploy on Vercel.

## Features
- **Multilingual Support**: Supports English, Tamil, Telugu, and Kannada.
- **RAG Capability**: Upload text/PDF documents to train the bot instantly.
- **Vector Search**: Uses Gemini Embeddings for context-aware answers.
- **Admin Panel**: Secure area to manage API keys and Knowledge Base documents.
- **Brand Customization**: Upload custom logos.

## Step-by-Step Deployment Procedure

### 1. Prerequisites
- A GitHub account.
- A [Vercel](https://vercel.com) account.
- A Google Cloud API Key with Gemini API access.

### 2. Local Setup (Optional)
If you downloaded these files:
1. Open a terminal in the folder.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to test locally.

### 3. Deploying to Vercel (Recommended)

1.  **Create a GitHub Repository**:
    *   Go to GitHub and create a new repository (e.g., `oriana-assistant`).
    *   Upload all the project files (`package.json`, `index.tsx`, `App.tsx`, etc.) to this repository.

2.  **Import to Vercel**:
    *   Log in to Vercel.
    *   Click **"Add New..."** -> **"Project"**.
    *   Select the `oriana-assistant` repository you just created.

3.  **Configure Project**:
    *   **Framework Preset**: Select **Vite** (Vercel usually detects this automatically).
    *   **Root Directory**: Leave as `./`.
    *   **Environment Variables**:
        *   Click the toggle to open Environment Variables.
        *   Add Key: `API_KEY`
        *   Add Value: `AIzaSy...` (Your Google Gemini API Key).
        *   *Note: While the app allows entering the key in the Admin Panel, setting it here ensures it's available by default.*

4.  **Deploy**:
    *   Click **"Deploy"**.
    *   Wait for the build to finish (approx. 1 minute).

5.  **Use the App**:
    *   Once deployed, click the domain link provided by Vercel.
    *   Go to Admin Panel (Top Right).
    *   Login (User: `Admin`, Pass: `Admin@1234`).
    *   Upload your training documents.

## Admin Credentials
- **Username**: `Admin`
- **Password**: `Admin@1234`

## Tech Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **AI/LLM**: Google Gemini (`gemini-2.5-flash` for chat, `text-embedding-004` for vectors)
- **Icons**: FontAwesome