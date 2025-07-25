# PersonaPost AI

PersonaPost AI is a full-stack web application designed to empower users in creating highly personalized social media content. By leveraging AI, it allows users to define their professional persona and interests, then generates tailored text variations and compelling images for their social media posts.

## Features

* **User Profile Management**: Users can create and update a detailed persona profile including interests, profession, hobbies, and preferred content themes. This data is stored securely using Supabase.
* **AI-Powered Text Generation**:
    * Generate multiple variations of social media post text based on user input and their defined persona.
    * The AI assistant uses a `personaInstruction` to guide content creation, ensuring professional and engaging language, appropriate formatting, and relevant hashtags.
    * Users can choose their preferred text variation from the generated options.
* **AI-Powered Image Generation**: Generate captivating images directly from text prompts, seamlessly integrated with the generated post content.
* **Interactive Chat Interface**: A user-friendly chat interface is provided for interacting with the AI, displaying user messages, AI responses, and generated posts.
* **Responsive Design**: The application is built with Tailwind CSS for a modern and adaptive user experience across various devices.
* **Client-Side User ID Management**: The application utilizes `localStorage` and `uuid` for persistent, anonymous user identification.
* **Toast Notifications**: Contextual feedback is provided to the user for actions like profile loading and updates.

## Technologies Used

### Frontend

* **React**: A JavaScript library for building user interfaces.
* **Vite**: A fast build tool for modern web projects.
* **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
* **Zod**: TypeScript-first schema declaration and validation library.
* **React Hook Form**: A performant, flexible, and extensible forms library for React.
* **Lucide React**: A collection of beautiful and customizable open-source icons.
* **UUID**: Used for generating unique user IDs.

### Backend

* **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
* **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
* **Supabase**: An open-source Firebase alternative providing a PostgreSQL database and authentication.
* **Google Gemini API**: Used for AI-powered text and image generation.
* **`node-fetch`**: A light-weight module that brings `window.fetch` to Node.js.
* **`dotenv`**: For loading environment variables from a `.env` file.
* **CORS**: A Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

## Getting Started

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn
* A Supabase account
* A Google Cloud Project with access to the Gemini API

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/your-username/PersonaPost-AI.git](https://github.com/your-username/PersonaPost-AI.git)
    cd PersonaPost-AI
    ```

2.  **Backend Setup:**

    Navigate to the directory containing `app.js` and the backend's `package.json`.

    ```bash
    cd backend # Adjust if your backend is not in a 'backend' folder
    npm install
    ```

    Create a `.env` file in the backend directory and add your Supabase and Gemini API keys:

    ```
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

    **Supabase Setup:**
    * In your Supabase project, create a table named `user_profiles` with the following schema:
        * `user_id`: `TEXT` (Primary Key)
        * `interests`: `TEXT[]` (Array of text)
        * `profession`: `TEXT`
        * `hobbies`: `TEXT[]`
        * `preferred_content_themes`: `TEXT[]`
        * `updated_at`: `TIMESTAMP WITH TIME ZONE` (Default to `now()`, `on update now()`)
    * Ensure you have a `users` table (Supabase usually creates this for authentication) with an `id` column. The `user_profiles.user_id` should have a foreign key relationship to `users.id`.

3.  **Frontend Setup:**

    Navigate to the directory containing `main.jsx` and the frontend's `package.json`.

    ```bash
    cd frontend # Adjust if your frontend is not in a 'frontend' folder
    npm install
    ```

    Create a `.env` file in the frontend directory:

    ```
    VITE_REACT_APP_BACKEND_URL="http://localhost:3001" # Or your deployed backend URL
    ```

### Running the Application

1.  **Start the Backend:**

    In the backend directory:

    ```bash
    npm start
    ```

    The backend server will start on `http://localhost:3001` (or your specified PORT).

2.  **Start the Frontend:**

    In the frontend directory:

    ```bash
    npm run dev
    ```

    The frontend development server will start, usually on `http://localhost:5173`. Open this URL in your browser.
