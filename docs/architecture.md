# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep route components focused on presentation and use the shared API client for all `/api` requests. Each data page should expose accessible loading, empty, and error states, then render the API response.
- Logic tier decision: Implement the HTTP contract in Express routes and services, keeping request validation and response mapping out of the React presentation tier and persistence details in the data tier.
- Data tier decision: Use Mongoose models to enforce required fields and relationships, and keep the seed script representative and idempotent.
- Activity tracking approach: Validate that submitted user and team IDs are well-formed and refer to existing records. Persist the submitted activity fields and compute points and `occurredAt` on the server; return a deliberate 4xx for invalid input.
- Team management approach: Require a name, preserve the submitted name and mascot, and validate member references before creating a team. Support listing and creation through the API.
- Leaderboard approach: Sum activity points by team, include teams with no activity at zero points, sort highest total first, and assign ranks starting at 1.
- Workout suggestions approach: Find the user by email, use their fitness goal and recent activity to choose relevant suggestions, and include a reason for the first suggestion. Return a deliberate 4xx when no user matches.

## Test plan

Commands run and current results; test failures identify contract behavior that still needs implementation, while build failures indicate type-checking or production-compilation problems.

- Data tier — `npm run test:data --prefix octofit-tracker/backend`: **Fails, 4 of 5 tests.** User, team, activity, and workout required-field validations are missing or incomplete; the seed idempotency test passes.
- API — `npm run test:api --prefix octofit-tracker/backend`: **Fails, 4 of 4 tests.** Invalid activity/team requests return `501` instead of `400`, leaderboard totals/ranks are missing, and workout suggestions do not match the user's activity pattern.
- Presentation — `npm test --prefix octofit-tracker/frontend`: **Fails, 15 of 15 tests.** Expected activity/team content and user-specific workout requests are missing; all four pages also fail loading, empty-state, and accessible API-error expectations.
- Backend build — `npm run build --prefix octofit-tracker/backend`: **Passes.** TypeScript type-check succeeds.
- Frontend build — `npm run build --prefix octofit-tracker/frontend`: **Passes.** TypeScript type-check and Vite production build succeed.
