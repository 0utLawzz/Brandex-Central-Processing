# Brandex Central Processing — Implementation Plan

## Forensic findings

- **Brandex Database CMS** is the richest reference. It uses a `trademarks`-centered model with client code, TM number, stages/sub-stages, workflow history, documents, agents, agent fees, payment flags, and Supabase RLS. Its current audit explicitly identifies weak transition enforcement, flat sub-stage handling, incomplete ledger integration, and the risk of describing local payment flags as Ledger-verified. The new system will keep the useful concepts but use a stable client/case model and explicit transition rules.
- **Brandex Ledger** is a separate Supabase app. Its core ledger shape is date, case/folder reference, TM number, stage, detail, due, received, and total. The central app will expose a read-friendly ledger view while keeping ledger entries separate from workflow and client payments.
- **Brandex MailMerge** is a Google Apps Script/HTML application with trademark application and records screens. Its documented columns include TM/application-oriented values and it assumes a TM-centered workflow. The central app will reserve integration points but use case UUID/business case ID as the stable future reference because TM numbers are optional at case creation.

## First-version decisions

1. Build a Vite + React + TypeScript operations workbench with local dummy data so it runs without production credentials.
2. Make the central identity explicit: immutable client code, sequential case number per client, UUID case ID, and optional TM number.
3. Implement reusable business logic for profile completion, stage transitions, deadline status, checks, and agent/payment separation. A payment is never converted into an agent fee automatically.
4. Provide the operational routes in the brief. Module pages are intentionally focused views over the same demo case store; the case profile is the complete shared context.
5. Add a Supabase migration with normalized tables, constraints, indexes, RLS foundations, and a private storage bucket. No migration is executed against a remote project.
6. Keep authentication and Supabase client configuration optional and environment-driven. The demo uses dummy records until a development Supabase project is supplied.

## Deliberate scope boundaries

- No production data, credentials, Drive/Sheets sync, live MailMerge, statutory deadline claims, or automatic financial side effects.
- The 20-day acknowledgement plus 3-day escalation rule is an internal configurable demo rule.
- Authentication UI, live Supabase reads/writes, and storage upload wiring are prepared as integration points but are not claimed as fully live until a development Supabase project is configured.

## Implementation order

Foundation and routes → typed domain model and deterministic demo data → case profile and operational modules → business-rule tests → Supabase migration and environment docs → typecheck, lint, test, and production build.
