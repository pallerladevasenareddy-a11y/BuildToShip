# DocuSense AI — Stretch Features & Roadmap (STRETCH.md)

The following capabilities are tracked as post-MVP stretch goals to avoid scope creep while critical invoice auditing workflows are perfected:

1. **Semantic Line-Item Clustering**: Use embedding models to cluster subtly differently named line items across vendors (e.g., "A4 Paper Pack" vs "80 GSM Ream").
2. **Multi-User Organization Workspaces**: Role-based access control (RBAC) with granular roles (Admin, Auditor, Reviewer, Viewer).
3. **Automated ERP Integrations**: One-click webhook export to QuickBooks, Xero, Tally, and Zoho Books upon invoice approval.
4. **Automated Purchase Order (PO) 3-Way Matching**: Matching invoice line items against POs and goods receipt notes (GRNs).
5. **Bulk Batch Uploads**: Parallel queue processing using BullMQ and Redis for hundreds of simultaneous invoice PDFs.
6. **Multi-Currency Dynamic Conversion**: Live ECB or RBI exchange rates caching for multi-currency portfolio conversion to INR.
