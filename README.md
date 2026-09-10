# Stage Maestro

"Build a mobile-first web application for a music band to manage their internal repertoire and setlists. Use React, Tailwind CSS, and Supabase for the backend and storage.

Core Features:

Song Database: A dashboard to view, search, and add songs.

Song Details: Each song must include:

Title, Musical Key (e.g., Am, G#), Number of Verses, Intro Info, and General Notes.

Song Structure Builder: A dynamic section where users can add components (Intro, Verse, Chorus, Bridge, Outro, Modulation). Users should be able to reorder these components (drag-and-drop or up/down arrows) and add brief notes to each.

PDF Storage: Ability to upload and view PDF sheet music directly in the app.

Reference Links: A field for external URLs (YouTube/Spotify).

Setlist Creator: A feature to create "Programs". Users give it a name and select multiple songs from the database to form an ordered list.

Stage Mode: A simplified, high-contrast view of a Setlist where clicking a song displays its Key, Intro, and Structure in large, readable text for live performance.

Technical Specs:

Database: Use Supabase. Create a songs table and a setlists table. For the Song Structure, use a JSONB column to store the ordered list of components.

UI/UX: Use Shadcn UI components. The design must be Dark Mode by default (for stage use) with large buttons and high-contrast typography.

File Handling: Integrate Supabase Storage for PDF uploads.

Mobile Optimization: Ensure the navigation is bottom-tab based or has a very accessible hamburger menu.

Specific Logic for Structure: When adding a song, provide a 'Add Section' button that opens a menu with: Intro, Verse, Chorus, Bridge, Solo, Outro, Modulation. Once added, each section should have a small text input for specific cues (e.g., 'Drum start', 'Keyboard only')."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://setlist-saga.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e17c6258-4132-4068-94bb-c77b707e49db).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
