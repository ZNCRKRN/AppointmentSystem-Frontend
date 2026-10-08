# Appointment System Frontend

React 19 + TypeScript + Vite single-page app for the appointment system API. It shows a different navigation and set of actions for each role (Student, Advisor, Admin).

## Requirements

- Node.js 20 or newer
- The API running on `http://localhost:5249` (see `AppointmentSystem-API/README.md`)

## Setup

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. The API must allow this origin (it is in the API's CORS policy).

## Scripts

| Command           | What it does                              |
|-------------------|-------------------------------------------|
| `npm run dev`     | Starts the Vite dev server                |
| `npm run build`   | Type-checks and builds for production     |
| `npm run lint`    | Runs ESLint                               |
| `npm run preview` | Serves the production build locally       |

## Features by role

- **Student:** book appointments from an advisor's free slots, view and cancel own appointments, export them as CSV, see a calendar on the dashboard.
- **Advisor:** confirm or reject requested appointments, mark confirmed ones as completed, manage weekly or one-time availability.
- **Admin:** view all advisors and students.
- **Everyone:** log in, "forgot password" flow (the reset link arrives by email).

## Project layout

```
src/
  components/   Layout, route guard, appointment form, floating "new appointment" button
  contexts/     Auth state (user, token in localStorage)
  hooks/        React Query hooks for appointments, availability, advisors
  pages/        Login, forgot/reset password, dashboard, appointments, availability, admin users
  services/     Axios client and API functions (base URL in api.ts)
  types/        Types that mirror the API DTOs
```

The API base URL defaults to the local API (`http://localhost:5249/api`) and can be overridden at
build time with the `VITE_API_BASE_URL` environment variable (see `src/services/api.ts`) — used for
a deployed build, e.g. on Netlify.

## Deployment

For a live deployment (Netlify for this app, Render + a Postgres database for the API), see
[DEPLOYMENT.md](https://github.com/ZNCRKRN/AppointmentSystem-API/blob/main/DEPLOYMENT.md) in the API
repo — it covers both parts end to end.
