# Vertreecal

A Chrome extension that displays your browser tabs in a beautiful vertical tree view within a side panel. Tabs are organized hierarchically based on parent-child relationships, making it easy to visualize and manage complex tab structures.

## Features

- **Tree View**: Visualize tabs in a hierarchical tree structure based on parent-child relationships
- **Smart Highlighting**: Active tab is highlighted with a distinctive accent bar
- **Efficient Rendering**: Uses DOM reconciliation to minimize re-renders and prevent visual flashing
- **Intuitive Controls**:
- Click a tab to focus it
- Middle-click to close a tab
- Click the × button to close a tab
- **Beautiful Design**: Modern dark theme with teal accents and smooth animations
- **Real-time Updates**: Automatically updates when tabs are created, closed, moved, or updated

## Installation

### From Source

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd vertreecal
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the extension:

   ```bash
   pnpm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v9.15.0 or higher)

### Build Commands

```bash
# Build for production
pnpm run build

# Dev mode
pnpm run dev
```

### Project Structure

```
vertreecal/
├── src/
│   ├── background/
│   │   └── main.ts          # Service worker - opens side panel on icon click
│   ├── core/
│   │   ├── types.ts         # TypeScript interfaces and types
│   │   ├── ChromeTabService.ts    # Chrome tabs API wrapper
│   │   └── TabTreeBuilder.ts     # Builds tree structure from flat tab list
│   └── ui/
│       ├── TabTreeRenderer.ts     # Renders tree to DOM with reconciliation
│       └── ChromeTabActionHandler.ts  # Handles user actions (focus/close)
├── sidepanel/
│   ├── index.html          # Side panel HTML
│   ├── main.ts            # Side panel entry point
│   └── styles.css         # Styles
├── manifest.json          # Chrome extension manifest
├── vite.config.ts        # Vite build configuration
└── package.json          # Dependencies and scripts
```

## License

GNU Affero General Public License v3.0
