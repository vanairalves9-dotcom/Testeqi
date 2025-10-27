# AI Rules for this Project

This document outlines the core technologies and best practices for developing this application.

## Tech Stack Overview

*   **Frontend Framework:** React with Vite for a fast development experience.
*   **Language:** TypeScript for type safety and improved code quality.
*   **Styling:** Tailwind CSS for a utility-first approach to styling, ensuring responsive and consistent designs.
*   **UI Components:** shadcn/ui, built on Radix UI primitives, providing accessible and customizable components.
*   **Routing:** React Router DOM for declarative client-side navigation.
*   **Backend & Database:** Supabase, used for authentication, database management, and serverless functions.
*   **Data Fetching:** React Query for efficient server state management and data synchronization.
*   **Form Management:** React Hook Form for robust form handling, integrated with Zod for schema validation.
*   **Icons:** Lucide React for a comprehensive set of SVG icons.
*   **Notifications:** Sonner for elegant toast notifications.

## Library Usage Guidelines

To maintain consistency and leverage the strengths of each library, please adhere to the following rules:

*   **UI Components:** Always prioritize `shadcn/ui` components. If a specific component is not available or requires significant customization, create a new component that wraps or extends `shadcn/ui` functionality, or build a new one using Tailwind CSS. **Do not modify `shadcn/ui` source files directly.**
*   **Styling:** Use **Tailwind CSS exclusively** for all styling. Avoid inline styles or separate CSS files (beyond `src/index.css` for global styles) to ensure a consistent and maintainable codebase.
*   **Routing:** All client-side navigation should be managed using `react-router-dom`. Define routes in `src/App.tsx`.
*   **Data Fetching & Server State:** For fetching, caching, and synchronizing server data, use `@tanstack/react-query`.
*   **Form Handling & Validation:** Use `react-hook-form` for managing form state and submissions. For schema validation, integrate `zod` with `react-hook-form` using `@hookform/resolvers`.
*   **Icons:** All icons used throughout the application should come from the `lucide-react` library.
*   **Notifications:** For displaying temporary, non-blocking messages to the user, use `sonner`. For more persistent or action-oriented notifications, use the `useToast` hook provided by `shadcn/ui`.
*   **Backend Interaction:** All interactions with the backend (authentication, database queries, storage, edge functions) must be done using the `@supabase/supabase-js` client, imported from `src/integrations/supabase/client.ts`.
*   **Date Manipulation:** Use `date-fns` for any date formatting, parsing, or manipulation tasks.