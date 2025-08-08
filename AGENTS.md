# AGENTS.md - Freecell Solver

## Run Commands
- `npm run new` - Solve new games (specify count with --new flag)
- `npm run single` - Solve a single game 
- `npm run game` - Solve specific game by ID with step-by-step display
- `npm run unsolved` - Attempt to solve previously unsolved games
- `npm run stats` - Display solver statistics
- No build/lint/test commands defined - this is a pure Node.js CLI tool

## Code Style Guidelines
- **Module type**: ES modules (type: "module" in package.json)
- **Imports**: Named imports from relative paths with .js extension
- **Formatting**: 4-space indentation, trailing commas in objects/arrays
- **Functions**: camelCase naming, prefer function declarations for top-level functions
- **Variables**: camelCase, use `let` for mutable, destructuring for objects
- **Arrays**: Use Array.from() for initialization, .at(-1) for last element access
- **Error handling**: Try-catch with specific error code checks, process.exit() for CLI errors
- **Comments**: JSDoc for function documentation, ASCII art welcome in headers
- **File structure**: Keep related functionality in separate modules (deck.js, solve.js, etc.)