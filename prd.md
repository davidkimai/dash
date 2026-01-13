# Product Requirements Document (PRD)
## Blue Team Analytics Dashboard

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** MVP Planning  
**Owner:** Jason (AI Security Research)

---

## Executive Summary

A privacy-first, client-side analytics dashboard for cybersecurity annotation teams to visualize contributions, track coverage across attack categories, and gamify quality through competitive leaderboards—without storing any sensitive security research data.

### The Problem

**Current Pain Points:**
1. **Manual Aggregation Hell**: Team leads spend hours in spreadsheets tallying contributions
2. **Zero Real-Time Visibility**: No live view of annotation progress or bottlenecks
3. **Motivation Gap**: Lack of competitive/gamification elements for team engagement
4. **Coverage Blind Spots**: Difficult to identify under-tested attack categories
5. **Quality Opacity**: Hard to track deflection success rates across annotators
6. **Privacy Paranoia**: Enterprise security data cannot be uploaded to cloud services

**Impact Metrics:**
- **Time Cost**: ~4 hours/week per team lead in manual reporting
- **Engagement**: Estimated 40% increase in contribution quality with leaderboards
- **Risk**: Current manual processes create GDPR/compliance exposure

### The Solution

**Zero-Trust Analytics Engine**: A Next.js dashboard that processes CSV files entirely client-side, rendering enterprise-grade visualizations without ever transmitting or storing data.

**Core Value Propositions:**
1. **Instant Insights**: Upload CSV → See leaderboard in <3 seconds
2. **Privacy by Design**: All processing happens in browser memory (RAM)
3. **Gamification Layer**: Competitive leaderboards drive quality and velocity
4. **Coverage Heatmaps**: Identify gaps in attack category testing
5. **Quality Metrics**: Track deflection success rates per contributor

---

## User Personas

### Primary: Security Team Lead (Sarah)
**Role**: Senior Red Team Lead at Fortune 500  
**Pain Points**:
- Needs weekly reports for management on annotation velocity
- Struggles to motivate remote team members
- Worried about uploading proprietary jailbreak data anywhere
- Wants to share dashboards with stakeholders without exposing raw data

**Jobs to Be Done**:
- Generate executive summaries in <5 minutes
- Identify which contributors need support/training
- Celebrate top performers to boost morale
- Share sanitized analytics with leadership via URL (no raw data)

### Secondary: Security Annotator (Alex)
**Role**: Junior Security Researcher  
**Pain Points**:
- No visibility into personal performance vs. peers
- Unclear which attack categories need more coverage

**Jobs to Be Done**:
- Track personal contribution metrics
- Identify areas to focus annotation efforts
- Compete for top leaderboard positions

### Tertiary: Compliance Officer (Maya)
**Role**: Data Privacy Officer  
**Pain Points**:
- Must approve all tools that touch security research data
- Concerned about data exfiltration and vendor access

**Jobs to Be Done**:
- Verify no data leaves the organization
- Audit tool for GDPR/SOC2 compliance
- Review security architecture documentation

---

## Success Metrics

### North Star Metric
**Time-to-Insight**: Seconds from CSV upload to actionable dashboard (<3s target)

### Primary KPIs (MVP)
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Adoption Rate** | 80% of team within 2 weeks | Weekly active uploads |
| **Time Saved** | 3.5 hours/week per lead | User survey + time tracking |
| **Engagement Lift** | 25% increase in annotations | Compare 30-day pre/post volumes |
| **Privacy Confidence** | 100% compliance approval | Legal/security team signoff |

### Secondary KPIs
- **Quality Improvement**: +15% deflection success rate (tracked over 60 days)
- **Coverage Balance**: Std deviation of category distribution decreases 20%
- **User Satisfaction**: NPS >50 from team members

---

## MVP Scope

### In-Scope (Phase 1 - 2 Weeks)

#### Core Features
1. **CSV Upload & Processing**
   - Drag-and-drop interface for CSV files
   - Client-side parsing with validation
   - Support for Windows-1252 and UTF-8 encodings
   - File size limit: 50MB (configurable)

2. **Multi-Metric Contributor Leaderboard**
   - **Composite Scoring System**:
     - Volume Score (40%): Total prompts submitted
     - Quality Score (40%): Deflection success rate (Full=1.0, Partial=0.5, None=0)
     - Coverage Score (20%): Unique categories/types annotated
   - **Display Components**:
     - Overall rank with badges (🥇🥈🥉)
     - Email/identifier with anonymization toggle
     - Total submissions count
     - Quality rating (% successful deflections)
     - Coverage breadth (# unique categories)
     - Composite score with breakdown tooltip
   - **Interactive Features**:
     - Sort by any metric (volume/quality/coverage/composite)
     - Filter by contributor
     - Drill-down to contributor detail view

3. **Attack Category Analytics**
   - **Category Distribution**:
     - Horizontal bar chart: Top 10 categories by volume
     - Stacked bars showing deflection success rates per category
   - **RAI Policy Coverage**:
     - Donut chart: Distribution across Targeted RAI Policy types
     - Highlight under-tested policy areas
   - **Coverage Heatmap**:
     - 2D matrix: Contributors (rows) × Categories (columns)
     - Color intensity = submission count
     - Identify coverage gaps instantly

4. **Quality & Risk Indicators**
   - **Global Metrics**:
     - Overall deflection success rate: Full/Partial/None breakdown
     - Average prompts per contributor
     - Category balance score (Shannon entropy)
   - **Per-Contributor Quality**:
     - Individual deflection rate
     - Category specialization indicators
     - Quality consistency score

5. **Dual-Mode Architecture**
   - **Private Mode** (default):
     - All processing in browser memory
     - No network calls post-page-load
     - Data cleared on session end
   - **Share Mode**:
     - Generate shareable URL with encoded aggregate statistics
     - URL contains only: contributor counts, category distributions, quality metrics
     - NO raw prompts, model responses, or PII
     - Hash-based routing (data in URL fragment, never sent to server)
     - Expiry mechanism (24-hour time-bound URLs)

6. **Data Privacy Controls**
   - **Privacy Indicators**:
     - Green shield icon: "All data processed locally"
     - Network activity monitor (should show zero requests)
   - **Security Features**:
     - "Clear All Data" button (immediate memory flush)
     - Auto-clear on browser close/refresh
     - CSP headers preventing external requests
   - **Anonymization Toggle**:
     - Mask email addresses (show only first 3 chars + domain)
     - Useful for screenshot sharing

7. **Export Capabilities**
   - **Sanitized Exports**:
     - PNG: Leaderboard screenshot (with anonymization option)
     - PNG: Category distribution charts
     - CSV: Aggregate statistics only (no raw prompts/responses)
   - **Summary Reports**:
     - Markdown: Executive summary with key metrics
     - JSON: Statistical summary for downstream tools
   - **Share Links**:
     - Generate shareable dashboard URL (aggregate data only)
     - Copy-to-clipboard functionality

#### User Experience
- **Modern Enterprise Aesthetic**: Clean, professional, data-dense but readable
- **Responsive Design**: Works on desktop (primary), tablet, mobile
- **Performance**: <2s load time, <500ms CSV parsing for 10K rows
- **Accessibility**: WCAG 2.1 AA compliance (keyboard nav, screen readers)

### Out-of-Scope (Future Phases)

**Phase 2 (Weeks 3-4)**:
- Historical trend analysis (requires timestamp data)
- Automated email reports/notifications
- Advanced filtering (by date range, category, quality threshold)
- Collaborative annotations/comments
- Integration with annotation tools (Linear, Jira)

**Explicitly NOT Building**:
- ❌ Backend database or API (violates privacy requirements)
- ❌ User authentication (adds complexity without MVP value)
- ❌ Real-time collaboration (no WebSocket/server dependency)
- ❌ AI-powered insights (premature optimization)
- ❌ Mobile-first design (desktop is primary use case)

---

## Technical Requirements

### Functional Requirements

| ID | Requirement | Priority | Success Criteria |
|----|-------------|----------|------------------|
| FR-1 | Accept CSV upload (drag-drop & file picker) | P0 | 100% success rate for valid CSVs |
| FR-2 | Parse CSV with Windows-1252 encoding | P0 | Zero encoding errors on test dataset |
| FR-3 | Calculate composite leaderboard scores | P0 | Formula accuracy verified by test cases |
| FR-4 | Render leaderboard in <3s for 5K rows | P0 | Performance benchmarks pass |
| FR-5 | Generate shareable URLs with aggregate data | P0 | URL loads dashboard without original CSV |
| FR-6 | Export leaderboard as PNG | P1 | Image renders correctly across browsers |
| FR-7 | Toggle email anonymization | P1 | Masks work for all email formats |
| FR-8 | Display coverage heatmap | P1 | Matrix renders for 8 contributors × 15 categories |

### Non-Functional Requirements

| ID | Requirement | Priority | Validation Method |
|----|-------------|----------|-------------------|
| NFR-1 | **Privacy**: Zero network calls post-load | P0 | Browser DevTools audit |
| NFR-2 | **Security**: CSP prevents external requests | P0 | Security scan with strict CSP |
| NFR-3 | **Performance**: Parse 10K rows in <2s | P0 | Benchmark with large datasets |
| NFR-4 | **Compatibility**: Works on Chrome/Firefox/Safari | P0 | Manual testing on all browsers |
| NFR-5 | **Accessibility**: WCAG 2.1 AA | P1 | Axe DevTools audit |
| NFR-6 | **Responsiveness**: Mobile-friendly layout | P1 | Visual regression testing |

### Data Model Requirements

**Input Schema** (CSV columns):
- `Email` (string, required): Contributor identifier
- `Category` (string, required): Annotation category
- `Targeted RAI Policy (Task Type)` (string, required): Policy type
- `Deflection Type (Jailbreaking Technique)` (enum: Full/Partial/N/a)
- `Deflection (Breaks Model)` (enum: Yes/No)

**Derived Metrics**:
- Volume Score: Count of prompts per contributor
- Quality Score: `(Full deflections × 1.0 + Partial × 0.5) / Total prompts`
- Coverage Score: Count of unique categories per contributor
- Composite Score: `0.4×Volume + 0.4×Quality + 0.2×Coverage` (normalized 0-100)

---

## Risk Analysis & Mitigation

### High-Risk Areas

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Privacy Breach**: Shareable URLs leak sensitive data | Medium | Critical | Hash-based encoding with statistical aggregates only; audit URL contents |
| **Browser Compatibility**: CSV parsing fails in Safari | Medium | High | Polyfills for FileReader API; test suite across browsers |
| **Performance Degradation**: Large files (50MB+) freeze UI | High | Medium | Web Workers for CSV parsing; streaming/chunked processing |
| **Compliance Rejection**: Legal team blocks tool | Low | Critical | Early security review; transparent architecture docs |

### Medium-Risk Areas

| Risk | Mitigation |
|------|------------|
| **Encoding Issues**: Non-UTF8 CSVs fail to parse | Auto-detect encoding (chardet.js); fallback to UTF-8 with error handling |
| **User Confusion**: Complex composite scoring unclear | Tooltips explaining score breakdown; "How scoring works" modal |
| **Export Quality**: PNG exports render poorly | Use html2canvas with 2x DPI; provide SVG alternative |

---

## Dependencies & Constraints

### Technical Dependencies
- **Next.js 15+**: App Router for modern React patterns
- **Recharts**: For enterprise-grade charts (MIT license)
- **Papaparse**: CSV parsing with encoding detection
- **Framer Motion**: Smooth animations (optional, enhances UX)
- **html2canvas**: Screenshot generation for exports

### Resource Constraints
- **Development Time**: 2 weeks for MVP (1 engineer)
- **Budget**: $0 (open-source dependencies only)
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+

### Business Constraints
- **Compliance**: Must pass enterprise security review
- **Adoption**: Requires buy-in from 1 team lead + 5 annotators for pilot
- **Maintenance**: Must be low-touch (no backend to maintain)

---

## User Stories

### Epic 1: CSV Upload & Processing
```gherkin
As a team lead
I want to upload my annotation CSV
So that I can see team metrics instantly

Acceptance Criteria:
- Given a CSV file with 2,500 rows
- When I drag-and-drop onto the dashboard
- Then leaderboard renders in <3 seconds
- And no network calls are made (verified in DevTools)
```

### Epic 2: Multi-Metric Leaderboard
```gherkin
As a team lead
I want to see contributors ranked by composite score
So that I can identify top performers holistically

Acceptance Criteria:
- Given 8 contributors with varied metrics
- When leaderboard renders
- Then contributors are ranked by composite score (volume + quality + coverage)
- And I can sort by individual metrics (volume/quality/coverage)
- And tooltips explain score calculation
```

### Epic 3: Shareable Team Dashboard
```gherkin
As a team lead
I want to share dashboard with leadership
So that they can see team performance without accessing raw data

Acceptance Criteria:
- Given a processed CSV with 8 contributors
- When I click "Share Dashboard"
- Then a URL is generated and copied to clipboard
- And the URL loads an identical dashboard view
- And the URL contains only aggregate statistics (no PII/prompts)
- And the URL expires after 24 hours (visual indicator)
```

### Epic 4: Coverage Gap Analysis
```gherkin
As a team lead
I want to see category coverage heatmap
So that I can assign work to balance testing

Acceptance Criteria:
- Given annotations across 15 categories by 8 contributors
- When I view the coverage heatmap
- Then I see a Contributors × Categories matrix
- And cells are color-coded by submission count
- And I can identify which categories need more attention
```

---

## Design Philosophy

### Privacy-First Architecture
**Zero Trust = Zero Storage**: The app operates on a "data never leaves the browser" principle. All CSV processing, aggregation, and visualization happens in client-side JavaScript. Even shareable URLs only contain pre-computed statistics, never raw data.

### Gamification for Engagement
**Competition Drives Quality**: By making metrics public (within the team) and competitive, we tap into intrinsic motivation. The multi-metric scoring system prevents gaming the system (e.g., can't just spam low-quality annotations).

### Enterprise Ergonomics
**Data-Dense but Digestible**: Security teams are technical users who value information density. We optimize for "insight per pixel" while maintaining clean visual hierarchy. Think Bloomberg Terminal, not Consumer SaaS.

---

## Open Questions

1. **Scoring Weights**: Is 40/40/20 split (volume/quality/coverage) appropriate? Should we make weights configurable?
2. **Anonymization Default**: Should email masking be ON or OFF by default for shared URLs?
3. **URL Expiry**: 24-hour expiry too aggressive? Consider 7-day option?
4. **Quality Definition**: Should "Partial" deflections count as 0.5 or different weight (0.6, 0.7)?
5. **Coverage Metric**: Should we count unique Categories only, or also unique RAI Policy types?

---

## Appendix: Data Insights from Sample

**Dataset**: 2,498 annotations across 8 contributors  
**Top Contributors**: JTang@innodata.com (high volume inferred from dataset structure)  
**Category Distribution**:
- Code-Generation: 366 (14.6%)
- Code Summarization: 308 (12.3%)
- Reduce Technical Debt: 252 (10.1%)

**Quality Baseline**:
- Full Deflections: 242 (9.7%)
- Partial Deflections: 164 (6.6%)
- Success Rate: ~16% (needs validation)

**Key Insight**: Low overall success rate suggests either (a) difficult jailbreak attempts or (b) model robustness. Dashboard will help identify if certain contributors consistently achieve higher deflection rates, indicating skill/technique differences.

---

## Next Steps

1. **Week 1**: Core dashboard development (CSV parsing, leaderboard, basic charts)
2. **Week 1.5**: Share URL architecture + exports
3. **Week 2**: Polish, testing, security audit
4. **Week 2.5**: Pilot with 1 team (5-8 users)
5. **Week 3**: Iterate based on feedback, prepare for broader rollout

**Success Criteria for MVP**: 3 team leads adopt tool and reduce reporting time by 50% within 2 weeks of launch.