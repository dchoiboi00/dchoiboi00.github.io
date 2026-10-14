---
title: Enforcing plan limits without breaking trust at CatalogIt
dek: How a 15-day countdown, a reversible freeze, and zero false positives turned 600 unenforced accounts into 15% MRR growth.
date: 2026-10-13
type: CASE STUDY
readTime: 6 min
---

![Account capacity enforcement pipeline](/work/capacity-enforcement-diagram.svg)

Roughly 600 CatalogIt accounts — about 3% of the base — were sitting over their plan limits on records, users, and storage. Nobody was enforcing any of it. I noticed it while migrating our billing infrastructure, and I proposed we fix it: not with a cliff, but with a countdown.

## The problem

Every plan has limits. Free accounts get a small number of entries and a few gigabytes; paid tiers scale up from there. But the limits were decorative — the system never checked them. Over-limit accounts kept consuming storage and support attention while paying for smaller plans, and the longer it went on, the more awkward enforcement would feel. Someone had to be first to turn it on.

## The real challenge: false positives

The technical shape was straightforward — a scheduled job, a usage check, a freeze. The hard part was making sure we never froze the wrong account.

Our sales team carried context on certain accounts that lived in someone's head or was buried three replies deep in an email chain: a museum mid-renewal, an institution with a handshake arrangement, a trial that wasn't really a trial. A false positive here wouldn't be a bug — it would be freezing a paying customer who had every right to be over their limit. So before writing the enforcement logic, I did the unglamorous work: cross-functional detective work, tracking down every edge case with the sales team until the list of accounts we'd touch was one we all trusted.

That took longer than the code. It was the most important part of the project.

## The design: a 15-day countdown

Nobody should wake up frozen. The system runs on a daily scheduler and moves accounts through stages:

**Warn first, in the channel they'll actually see.** A session-start dialog raises the flag at near-capacity and over-capacity, with the account's usage, its plan, and the one action that fits that plan. The Usage row in Settings carries a persistent status chip so the state is visible without waiting for an interruption.

**Segment the outreach.** This was the key product learning. In-app notices only reach people who actually log in — a handful of customers are in the product every day, and for them notices work instantly. But plenty of accounts log in rarely, so the email drip to account owners is the reliable channel: it goes to everyone, with the 15-day countdown tracked per account and every send timestamped so the drip never double-fires.

**Freeze with a mechanism that has a way back.** The original approach flipped every user on an over-capacity account to a read-only role — and recorded nothing about what their role had been. There was no way back: when the customer paid, the account stayed read-only until a staff member fixed it by hand. We replaced it with `frozen_at`, a nullable timestamp on the account. Freezing touches no roles, so unfreezing restores everyone exactly. A frozen account is read-only — a banner names the date it was frozen — but billing stays reachable, because paying is the way out.

**Unfreeze automatically.** Every payment path writes projected entitlements through one helper, and that helper clears `frozen_at` the moment the account lands back inside its limits. The banner lifts live, without a reload. Paying is the only exit a frozen account has (it can't delete its way back under capacity while frozen), so unfreezing next to the entitlements write is exactly right.

## What I'd do differently: move faster

I had real anxiety early on about freezing an account that shouldn't be frozen — I wanted false positives at absolute zero, and that slowed me down. What I eventually internalized is that these are reversible actions. Unfreezing is trivial; the cost of being wrong was low and the cost of delay was high. The two-week timeline could have been shorter. Next time: pick a direction and push, and let reversibility do the worrying.

## The outcome

The whole thing took two weeks, start to finish. On day one, 15–20 accounts upgraded. In the first month, MRR grew 15%.

Looking back, the project was abuse detection at scale: finding accounts using the system beyond what they paid for and enforcing the rules automatically, fairly, and reversibly. The mechanism mattered as much as the policy — a staged 15-day countdown, a timestamp instead of a role flip, and an exit that works the moment the customer pays.
