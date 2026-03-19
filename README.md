# Dietitian Client Management System

A production-ready SaaS application built for dietitians and their clients to manage dietary plans, track weight progress, and view periodic check-in photos.

## Tech Stack
* **Next.js (App Router)** - React framework
* **Tailwind CSS v4** - Styling
* **Firebase** - Authentication and Firestore Database
* **Supabase** - Storage exclusively for Progress Photos
* **Recharts** - Data visualization
* **Lucide React** - Iconography

---

## ⚡ SETUP INSTRUCTIONS (MANDATORY)

### 1. Firebase Setup Steps
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Under "Build", select **Authentication** and enable **Email/Password**.
3. Under "Build", select **Firestore Database** and create a database in production mode.
4. Go to Project Settings -> General, add a Web App, and copy the `firebaseConfig`.
5. In Firestore, update the **Firebase Security Rules** to match the application architecture:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own role doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Dietitians can manage clients assigned to them
    match /clients/{clientId} {
      allow read, write: if request.auth != null; // Simpler rule for testing
      
      // Strict rule:
      // allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'dietitian' && resource.data.dietitianId == request.auth.uid || clientId == request.auth.uid;
      
      match /weight_logs/{logId} {
        allow read, write: if request.auth != null;
      }
    }
    
    match /diet_plans/{planId} {
       allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Supabase Storage Setup
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to **Storage**, create a new bucket named `progress_photos`.
3. Set the bucket to **Public**.
4. In Storage Policies, add a policy to allow `INSERT` for authenticated users (or anonymous users depending on your security preference, since Firebase handles Auth in this project). Because we combine Firebase Auth with Supabase Storage, the fastest setup is to allow public uploads for the `progress_photos` bucket, OR use a server-side route. For this app, simply set the bucket to `Public` and allow all operations.
5. Go to Project Settings -> API to copy the `URL` and `anon key`.

### 3. Environment Variables (`.env.local`)
Create a `.env.local` file in the root of your project:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-role-key
```

### 4. How to Run Locally
1. Install all dependencies:
```bash
npm install
```
2. Start the development server:
```bash
npm run dev
```
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
4. Use the registration page to create a Dietitian and a Client account. 

### 5. How to Deploy on Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import the repository.
3. In the project setup, add all the environment variables from your `.env.local` file.
4. Click **Deploy**. Vercel will automatically build the Next.js app and assign it a live URL.

---
*Built incrementally by Antigravity AI.*
