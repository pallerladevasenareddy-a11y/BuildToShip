# DocuSense AI — UI Design Specification (UI_SPEC.md)

## 1. Visual Theme & Color System
DocuSense AI adheres to a professional midnight navy and muted teal design system:
- **Background (Main Canvas)**: `#101820`
- **Sidebar**: `#141F29`
- **Card Background**: `#1B2935`
- **Raised Surface / Inputs**: `#22323F`
- **Border / Dividers**: `#30404C`
- **Primary Accent / Brand**: `#75D9C3` (Muted Teal)
- **Primary Text**: `#F1F5F9`
- **Secondary Text / Muted**: `#A0AFBD`
- **Success Badge / Alert**: `#45C49A`
- **Warning Badge / Alert**: `#E9B85D`
- **Error Badge / Alert**: `#F17C7C`

## 2. Typography & Spatial Rhythm
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Base Metrics**: Consistent 4px/8px grid system.
- **Contrast**: WCAG AA accessible contrast for all text against dark surfaces.
- **Focus Rings**: `focus:ring-2 focus:ring-[#75D9C3] focus:outline-none`.

## 3. Navigation & Views
1. **Overview**: 4 KPI cards (Total Invoices, Total Spend, Needs Review, Possible Duplicates), monthly spend chart, category breakdown, recent activity.
2. **Upload Invoices**: Drag-and-drop file dropzone, upload progress stages, live extraction view, direct preview, demo test cases.
3. **All Invoices**: Searchable and filterable data table with status badges, date ranges, supplier filter, and document drilldown.
4. **Review Queue**: Actionable flagged invoices with mismatch details, side-by-side field editor, approval/rejection modal, and live re-validation.
5. **Insights**: Database-backed supplier spend, category distributions, price volatility alerts, and potential duplicate exposure.
