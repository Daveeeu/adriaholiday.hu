# Adria Admin

React 19 admin starter built with Vite, TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS, shadcn/ui, React Hook Form, and Zod.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run format`

## Architecture

- Feature-based routing under `src/features`
- Shared UI primitives in `src/components/ui`
- Mock data in `src/data`
- Mock service layer in `src/services`
- Future API swap handled through the `HttpClient` abstraction in `src/services/http-client.ts`
