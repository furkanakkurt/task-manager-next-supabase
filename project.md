# Prompt to AI-Agent: Building a Task Manager with Supabase and Next.js

## Goal of the Project
We aim to build a **Task Manager Application** using **Next.js** as the frontend framework and **Supabase** as the backend service. This project will serve as a learning opportunity for Next.js while exploring Supabase's features.

---

## Project Structure
- **Root Directory**: `task-manager/`
  - **pages/**: Contains all the application routes (e.g., `/`, `/tasks`, `/login`).
    - `index.js`: Home page.
    - `login.js`: Login and sign-up page.
    - `tasks.js`: Task management page.
  - **components/**: Reusable UI components.
    - `Navbar.js`, `TaskCard.js`, `CategoryDropdown.js`.
  - **lib/**: Helper utilities and configuration.
    - `supabase.js`: Supabase client initialization.
  - **styles/**: Global and module CSS files.
  - **public/**: Static assets like images/icons.
  - **api/**: Next.js API routes for server-side logic (optional).
  - **README.md**: Project documentation.

---

## Tools to Be Used
1. **Framework**: 
   - Next.js (React-based framework).
2. **Backend as a Service**: 
   - Supabase for database, authentication, real-time updates, and storage.
3. **UI Components**:
   - TailwindCSS or Material-UI for styling (you can choose one).
4. **Database**:
   - PostgreSQL (via Supabase).
5. **Authentication**:
   - Supabase Auth (email/password or social logins).
6. **Real-time Updates**:
   - Supabase Realtime to reflect task changes instantly.
7. **Deployment**:
   - Vercel for deploying the Next.js app.

---

## Functional Requirements
1. **User Authentication**:
   - Sign up, log in, and log out using Supabase Auth.
   - Option to use social login (e.g., Google).
2. **Task Management**:
   - Create, edit, and delete tasks.
   - Categorize tasks.
   - Set task deadlines.
3. **Real-Time Updates**:
   - Reflect task additions or updates instantly using Supabase Realtime.
4. **File Attachments**:
   - Allow users to upload files for tasks using Supabase Storage.
5. **Responsive Design**:
   - Ensure the app works seamlessly on mobile and desktop devices.

---

## Non-Functional Requirements
1. **Performance**:
   - Use server-side rendering (SSR) for better SEO and faster load times on critical pages.
2. **Scalability**:
   - Ensure the app can handle a growing number of users and tasks with efficient database design.
3. **Security**:
   - Implement role-based access control using Supabase's row-level security (RLS).
4. **Code Quality**:
   - Follow best practices with linting and a well-organized file structure.
5. **Documentation**:
   - Provide clear instructions in the `README.md` for setting up and running the project.

---

## Step-by-Step Features
1. **Authentication**:
   - Use Supabase's client library to handle user sessions.
   - Protect routes like `/tasks` to require user login.
2. **Task Management**:
   - Use Supabase's database to store tasks with fields like `title`, `description`, `deadline`, `category_id`, and `user_id`.
   - Fetch tasks on the `/tasks` page using Supabase's API.
3. **Real-Time Updates**:
   - Enable real-time updates for task lists whenever a task is added, edited, or deleted.
4. **File Uploads**:
   - Integrate Supabase Storage to allow users to attach files to tasks.
5. **Category Filters**:
   - Add dropdowns to filter tasks by category.
6. **Responsive Design**:
   - Style the app using TailwindCSS or Material-UI to make it visually appealing and mobile-friendly.

---

## Optional Advanced Features
1. **Server-Side API Routes**:
   - Use Next.js API routes to add custom server-side logic (e.g., sending task reminders).
2. **Notifications**:
   - Integrate a third-party service like Firebase or OneSignal for task deadline reminders.
3. **Analytics**:
   - Track user engagement using tools like Google Analytics or Supabase logs.
