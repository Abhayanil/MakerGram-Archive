# MakerGram Archive

A web application to track and manage MakerGram initiatives, projects, programs, and collaborations. It provides a centralized view of all activities with filtering, searching, and status tracking capabilities.

## Features

*   **Project Tracking:** Categorize initiatives by status (Active, Hibernation, Graveyard) and type (Project, Program, Initiative, Collab).
*   **Search and Filter:** Easily find projects using a search bar and filter by status and type.
*   **Kanban-style View:** Visualize projects organized by their status in a Kanban-like board.
*   **Add/Edit Projects:** Create new project entries and update existing ones through a user-friendly modal form.
*   **Maker Management:** Associate multiple makers with each project using a multi-select dropdown.
*   **Dark/Light Mode:** Toggle between dark and light themes for improved readability and user preference.
*   **Supabase Integration:** Data is persisted and managed using Supabase as the backend.

## Technologies Used

*   **Frontend:**
    *   **React:** A JavaScript library for building user interfaces.
    *   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
    *   **Vite:** A fast build tool that provides a lightning-fast development experience.
    *   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
    *   **Lucide React:** A collection of beautiful, customizable SVG icons for React.
*   **Backend:**
    *   **Supabase:** An open-source Firebase alternative providing a PostgreSQL database, authentication, APIs, and more.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Abhayanil/MakerGram-Archive.git
    cd MakerGram-Archive
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Create a new project in Supabase.
    *   Set up the following tables and their schemas as described in the project requirements:
        *   `project_status`
        *   `project_type`
        *   `makers`
        *   `projects`
        *   `project_makers` (join table)
    *   Get your Supabase Project URL and `anon` public key from your Supabase project settings (`Settings > API`).

4.  **Configure environment variables:**
    *   Create a `.env` file in the root of the project.
    *   Add your Supabase credentials:
        ```
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
        (Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual keys.)

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:5173`.

## Project Structure

```
.
├── public/
├── src/
│   ├── components/
│   │   └── MultiSelectMakers.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── supabaseClient.ts
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests.

## License

[Specify your license here, e.g., MIT License]