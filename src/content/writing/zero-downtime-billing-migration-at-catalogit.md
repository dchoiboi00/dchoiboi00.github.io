---
title: Migrating 3,000 accounts to flexible billing with zero downtime at CatalogIt
dek: Phased webhook versioning, a dry-run-first backfill with a verifier, and a staged rollout — moving $800K ARR without losing a cent.
date: 2026-10-13
type: CASE STUDY
readTime: 7 min
---

![Zero-downtime billing migration phases](/work/billing-migration-diagram.svg)

CatalogIt billed per-user. We needed to bill per-account — one subscription per institution covering all its staff — and do it across 3,000 accounts representing $800K in ARR without a minute of downtime or a single revenue discrepancy. This is how we sequenced it.

## The problem

The old model tied Stripe customers to individual users. When staff turned over at a client institution (and at museums, they do), plan access broke in confusing ways. The new model needed one canonical Stripe customer per account, flexible billing (annual and monthly line items in a single subscription), and a data migration to match — while every existing webhook, invoice, and dunning flow kept working.

The scariest part wasn't the new code. It was the cutover: at some point, Stripe events had to start arriving in a new API version, and if the new handler had a bug, we'd silently mis-bill people.

## Phase A: run both, trust neither yet

We upgraded the Stripe SDK and pinned a new dated API version, then upgraded the webhook endpoint in phases, following Stripe's own versioning playbook. In Phase A, the old-version endpoint kept processing events exactly as before, while the new-version endpoint returned 200 and ignored everything — live traffic flowing through it, monitored, with zero behavioral change.

This gave us something invaluable: production-shaped traffic against the new code path with no blast radius.

## Phase B: the cutover with a parachute

Once monitoring looked clean, we advanced to Phase B: the old endpoint started returning 400, and the new endpoint began processing for real. The 400 wasn't just a rejection — Stripe queues events for retry for up to three days when an endpoint errors. So if the new handler had melted down, the events would have been preserved and replayable, and a rollback would have recovered cleanly. We wrote the whole version-upgrade playbook down as a doc for the team, because we'd want it again.

## The backfill: 1,536 accounts, zero improvisation

With the code in place, 1,536 pre-migration production accounts still pointed at the old customer model. This is where migrations die — in the long tail of weird accounts. So we triaged the entire population first:

- **1,468** single-payer accounts → scripted migration
- **56** same-customer multi-subscription accounts → scripted consolidation
- **4** multi-payer accounts and **7** multi-account users → manual runbook, handled in the Stripe Dashboard by an operator

The scripts were dry-run by default, idempotent, and scoped to explicit account lists. Each account went through a two-phase write: mutate Stripe, verify the resulting Stripe shape, then derive the database writes from the verified Stripe state — never the other way around. A shared verifier library encoded the end-state assertions and was imported by the integration tests, so the tests couldn't drift from what the scripts actually enforced. We ran every script three ways in test mode — dry-run, live, idempotency — before touching production.

## The rollout: pilot, 10%, GA

Code and data done, we still didn't flip a global switch. The migration rolled out in stages behind feature flags — pilot accounts first, then 10%, then GA — with a migration design doc and rollback runbooks backing each stage. Phase 3 cleaned up behind us: the dead `user.stripe_customer_id` column dropped, deprecated routes deleted, the new canonical lookup inlined everywhere.

## The safety net that never sleeps

Underneath all of it runs the reconciliation layer: idempotent webhook handlers with Stripe as the source of truth, self-healing subscription state on every event. Even after the migration, if our database and Stripe ever disagree, the system converges back to Stripe. The migration was a project; the reconciliation is forever.

## The outcome

Zero downtime. No revenue discrepancies. 3,000 accounts on account-centric subscriptions, and a billing platform the company can build on for years.

The lesson I'd pull out for anyone facing a similar migration: sequence the risk, don't just manage it. Version the webhooks in phases so production traffic validates the new path for free. Triage the data population before writing a single migration script — the buckets tell you what tooling to build. Make every script dry-run-first and idempotent, verify against the external system of record, and roll out in stages even when you're confident. Confidence is not a deployment strategy.
