# Rubik's Cube Solver

A browser-based solver for the classic **3×3 Rubik's Cube**. Scan the
six faces one at a time, validate the detected cube state, then follow
an animated, move-by-move solution.

> **Project status:** Early development --- the first milestone is the
> cube model and its move notation.

## Goals

-   Support the standard 3×3×3 cube.
-   Offer a guided, one-face-at-a-time scanning flow.
-   Allow manual correction of detected sticker colors.
-   Validate that the entered state represents a physically solvable
    cube.
-   Generate a solution and present it one move at a time.
-   Provide a clear, responsive experience on desktop and mobile.

## Planned features

-   [ ] Cube state model and face-turn notation
-   [ ] Unit tests for move operations and state invariants
-   [ ] Solver integration
-   [ ] 3D cube visualization and move playback
-   [ ] Manual face entry and correction
-   [ ] Guided camera scanning
-   [ ] PWA support

## Tech stack

The initial application is a client-side web app:

-   [React](https://react.dev/) +
    [TypeScript](https://www.typescriptlang.org/)
-   [Vite](https://vite.dev/) for development and production builds
-   [Tailwind CSS](https://tailwindcss.com/) for styling
-   [Vitest](https://vitest.dev/) for tests
-   [cubing.js](https://js.cubing.net/) to evaluate for cube notation
    and 3D visualization

There is intentionally **no backend in the initial scope**. Camera
access, cube validation, solving and visualization can run in the
browser. A server can be introduced later if product requirements
justify accounts, cloud synchronization or shared history.

## Getting started

### Requirements

-   Node.js (use an active LTS release)
-   pnpm
-   Git

### Install

``` bash
pnpm install
pnpm dev
```

Vite prints the local development URL in the terminal (usually
`http://localhost:5173`).

### Quality checks

``` bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

These scripts should be added as the corresponding tooling is
configured.

## Project principles

-   Keep cube rules independent from React and the camera.
-   Treat scanned colors as untrusted input until the cube state has
    been validated.
-   Prefer small, testable domain functions over UI-coupled logic.
-   Add dependencies only when they solve a concrete problem.
-   Document important technical decisions and trade-offs.

## License

To be decided.
