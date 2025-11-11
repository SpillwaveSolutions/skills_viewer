# Skill Debugger Setup Scripts

This directory contains automation scripts for setting up and managing the Skill Debugger project.

## Scripts

### `setup-phase1.sh`

**Purpose**: Automates Phase 1 (Setup) of the implementation plan - initializes the complete Tauri + React + TypeScript project structure.

**What it does**:
1. Creates all configuration files (TypeScript, Vite, Tailwind, ESLint, Prettier)
2. Sets up Tauri configuration with proper permissions
3. Creates basic project structure and placeholder files
4. Installs all npm dependencies
5. Generates initial Rust source files with proper module structure
6. Creates package.json scripts for development and building

**Usage**:
```bash
cd /path/to/skill-debugger
chmod +x scripts/setup-phase1.sh
./scripts/setup-phase1.sh
```

**After running**:
- Project is ready for development
- Run `npm run tauri dev` to start the development server
- The application will launch with a basic Tauri window

**Prerequisites**:
- Node.js 20+ installed
- npm installed
- Rust/Cargo installed
- macOS, Linux, or Windows

**Time to complete**: ~2-3 minutes (depending on internet speed for dependencies)

### `setup-mvp.sh`

**Purpose**: Automates Phases 1-4 of the implementation plan - creates a fully working MVP with skill discovery and viewing capabilities.

**What it does**:
1. Runs Phase 1 setup (if not already done)
2. Creates all Rust backend models and commands (Phase 2)
3. Implements skill scanning functionality (Phase 3)
4. Implements skill viewing with markdown rendering (Phase 4)
5. Creates all React components for the MVP

**Usage**:
```bash
cd /path/to/skill-debugger
chmod +x scripts/setup-mvp.sh
./scripts/setup-mvp.sh
```

**After running**:
- Fully functional skill browser and viewer
- Can discover skills from `~/.claude/skills` and `~/.config/opencode/skills`
- Can view skill markdown content with syntax highlighting
- Can see references and scripts for each skill

**Time to complete**: ~5-10 minutes

## Development Workflow

After running setup scripts:

1. **Start development server**:
   ```bash
   npm run tauri dev
   ```

2. **Build for production**:
   ```bash
   npm run tauri build
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

## Troubleshooting

### Script fails with permission error
```bash
chmod +x scripts/*.sh
```

### Dependencies fail to install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tauri build fails
- Ensure Rust is installed: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Update Rust: `rustup update`
- Check system dependencies: Visit https://tauri.app/v1/guides/getting-started/prerequisites

## Architecture

The scripts follow the implementation plan defined in `specs/001-core-skill-explorer/`:
- **spec.md**: Feature requirements and user stories
- **plan.md**: Technical architecture and design decisions
- **tasks.md**: Detailed task breakdown (113 tasks total)

Scripts automate the manual task execution while maintaining the same structure and quality standards.
