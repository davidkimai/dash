# Blue Team Analytics Dashboard

A privacy-first, client-side analytics dashboard for cybersecurity annotation teams to visualize contributions, track coverage across attack categories, and gamify quality through competitive leaderboards—without storing any sensitive security research data.

## ✨ Features

### Week 1 + Week 2 Complete! 🎉

**Core Analytics**:
- ✅ Multi-metric scoring system (40% Volume + 40% Quality + 20% Coverage)
- ✅ Interactive leaderboard with sorting and tooltips
- ✅ Global metrics dashboard (submissions, contributors, categories, deflection rate)
- ✅ 4 visualization types (bar chart, donut chart, heatmap, quality gauges)

**Privacy & Security**:
- ✅ Zero network calls after page load (CSP enforcement)
- ✅ All processing in browser memory
- ✅ No localStorage or persistent storage
- ✅ Privacy indicator with network monitoring
- ✅ Data cleared on page refresh

**Sharing & Export**:
- ✅ **Share URLs** - Generate shareable links with LZ compression (24hr expiry)
- ✅ **PNG Export** - Screenshot leaderboard and charts
- ✅ **CSV Export** - Aggregate statistics only (no raw data)
- ✅ **Markdown Reports** - Executive summaries with recommendations

**UX/UI**:
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Interactive tooltips showing score breakdowns
- ✅ Color-coded quality indicators
- ✅ Confirmation dialogs for destructive actions
- ✅ Loading states and error handling

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS
- **CSV Parsing**: PapaParse + encoding-japanese
- **Charts**: Recharts 2.13
- **Compression**: LZ-String
- **Screenshots**: html2canvas
- **State Management**: React hooks

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server (for static export, just serve /out directory)
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Usage

1. **Upload CSV**: Drag and drop your annotation CSV file or click to browse
2. **View Analytics**: The dashboard automatically processes your data and displays:
   - Global metrics (total submissions, contributors, categories, deflection rate)
   - Ranked leaderboard with composite scoring
   - Individual contributor statistics
3. **Sort Leaderboard**: Click sorting buttons to rank by different metrics
4. **Clear Data**: Click "Clear Data" to remove all information from memory

## Privacy & Security

### Zero-Trust Architecture
- ✅ All data processing happens in browser memory (client-side)
- ✅ No network calls after initial page load
- ✅ No data stored in localStorage, cookies, or databases
- ✅ Strict Content Security Policy (CSP) headers
- ✅ Static export deployment (no server-side processing)

### Data Flow
```
CSV Upload → Browser Memory → Client-Side Processing → Visualization → Memory Clear
```

**No data ever leaves your browser.**

## CSV Format

The dashboard expects CSV files with the following columns:

- `Email` (required): Contributor identifier
- `Category ` (required): Annotation category
- `Targeted RAI Policy (Task Type)` (required): Policy type
- `Deflection Type (Jailbreaking Technique)`: Full/Partial/N/a
- `Deflection (Breaks Model)`: Yes/No

See `spec.md` for complete schema details.

## Project Structure

```
dash/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with CSP headers
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── upload/           # File upload components
│   └── leaderboard/      # Leaderboard components
├── lib/                   # Core logic
│   ├── parsers/          # CSV parsing with encoding detection
│   ├── analytics/        # Scoring and aggregation algorithms
│   └── utils/            # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── constants/             # Configuration constants
```

## Scoring Algorithm

### Composite Score Formula
```
Composite = 0.4 × Volume + 0.4 × Quality + 0.2 × Coverage
```

- **Volume Score**: Normalized against highest contributor (0-100)
- **Quality Score**: Deflection success rate × 100
  - Full deflection = 1.0 point
  - Partial deflection = 0.5 points
- **Coverage Score**: (Unique categories / Total categories) × 100

## Roadmap

### Week 1 (Days 1-5)
- [x] Day 1-2: Project setup, dependencies, folder structure
- [x] Day 3-4: CSV processing and analytics engine
- [x] Day 5: Leaderboard UI
- [ ] Charts and visualizations (in progress)

### Week 2 (Days 6-10)
- [ ] Category distribution charts
- [ ] Coverage heatmap
- [ ] Share URL generation
- [ ] Export functionality (PNG, CSV, Markdown)
- [ ] Polish and testing

See `spec.md` for complete implementation plan.

## Development

### Run Tests
```bash
npm test                # Unit tests
npm run test:e2e       # End-to-end tests
```

### Code Quality
```bash
npm run lint           # ESLint
npm run format         # Prettier
```

## Performance

Target metrics (from spec):
- Parse 5K rows in <2 seconds ✅
- Leaderboard renders in <500ms ✅
- No UI freeze during processing ✅

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This is an internal tool for cybersecurity annotation teams. For questions or issues, contact the project owner.

## License

Proprietary - Internal use only

## Acknowledgments

Built with specifications from PRD v1.0 and Technical Spec v1.0.
