---
title: We replaced a branching checkout flow with a state machine at CatalogIt
dek: The Adjust Plan wizard — four steps, three async services, one XState machine — and why the statechart beat boolean soup.
date: 2026-10-13
type: CASE STUDY
readTime: 6 min
---

![Adjust Plan wizard XState statechart](/work/xstate-wizard-diagram.svg)

Changing a subscription plan sounds simple until you enumerate the cases: upgrade or downgrade, monthly or annual, add-ons for users, storage, and API — plus prorated invoice preview before anything is charged, card entry only when there's actually something to pay, first-time purchases for accounts that don't even have a Stripe customer yet, and cancellation with a reason captured on the way out. We built it as a four-step wizard driven by an XState state machine. Here's why.

## The problem with ad-hoc state

The naive implementation is a pile of booleans: `isLoadingPreview`, `hasDefaultCard`, `showPaymentStep`, `isCommitting`, `justCancelled`… Every new branch multiplies the combinations, and most of those combinations are nonsense — but nothing stops the UI from rendering "loading" and "success" at the same time. The flow had real branching: preview the invoice, then either commit directly or take a card first, and the payment step itself had to handle accounts with no Stripe customer at all.

We'd already been bitten by this shape of bug elsewhere. So instead of boolean soup, we drew the flow as a statechart first.

## The machine

`adjustPlanMachine` models the whole wizard as states and events:

`adjust → preview.{loading, loaded, error} → payment.{idle, submitting} → committing → success`

The key decisions:

**Async work is modeled, not scattered.** The three async operations — fetching the invoice preview, confirming the card payment, and committing the purchase — are `invoke`d promise services. The machine declares *when* they run; it doesn't care *how*. That meant we could stand the whole wizard up with stubbed services and click through all four steps end to end before any real backend call existed.

**Services are injected, so the machine stays pure.** The container passes the real implementations (and the `hasDefaultCard` guard) in via `useMachine`. The state graph itself never changed across the entire build — seven PRs, one unchanged machine. Because it's pure, it's trivially mockable and testable.

**Guards encode the branching.** The `CONFIRM` event doesn't go to one place — a guard decides. Card on file or nothing due? Commit directly, skipping payment entirely. Payment due and no card? Route through the payment step. The branching rule lives in one place, in the open, instead of smeared across click handlers.

**Impossible states are unrepresentable.** There is no boolean combination that renders the success screen while a payment is submitting, because that combination doesn't exist in the graph. This is the whole argument for statecharts in one sentence.

## The stack

We built it as a seven-PR stacked series, each one reviewable on its own: a read-only invoice-preview endpoint, a purchase/commit endpoint, the wizard shell with the state machine, the plan editor plus cancel-with-reason flow, the invoice preview step, the payment step reusing the Billing page's card form — including making card entry work for accounts with no Stripe customer yet, so a free user's first purchase could actually start — and finally a consolidation PR that merged the stack into one branch for review.

One detail I'm proud of: the change always commits on a single prorated invoice — one subscription create for a first purchase, one subscription update for a change — so the charged amount always matches the preview. The Stripe customer is created at purchase time, never at card entry, and the entered card becomes the account default. No preview-then-surprise.

## What the statechart bought us

The wizard shipped without a single "how did the UI get into this state" bug, which for a branching payment flow is the whole game. But the deeper win was developmental: because the machine was walkable with stubs from day one, design, product, and engineering could click through the real flow — including the edge cases — weeks before the backend was wired. The statechart became the shared language for the feature. When someone asked "what happens if the preview fails after the user already entered a card?", we pointed at the graph instead of arguing from memory.

If your flow has more than two booleans controlling which step renders, draw the statechart. You'll find the states you forgot — and more importantly, you'll delete the ones that can't happen.
