# Contributing to BitDash-Lite

## Lean Code Guidelines
- ≤ 300 LOC per PR
- No new runtime deps
- Max 250 lines/file, 50 lines/function
- TypeScript strict mode
- Prefer functional components with hooks
- Use Tailwind for styling
- Write unit tests for new features
- Keep bundle size minimal

## Development Workflow
1. Create a new branch for your feature/fix
2. Make your changes following the guidelines
3. Write tests for your changes
4. Ensure all tests pass with `pnpm test`
5. Submit a PR with a clear description

## Code Style
- Follow the project's ESLint and Prettier config
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep components small and focused

## Testing
- Write tests for all new features
- Maintain test coverage above 80%
- Use React Testing Library for component tests
- Use Playwright for end-to-end tests
