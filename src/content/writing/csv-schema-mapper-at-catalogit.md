---
title: Building a CSV-to-schema mapper with LLMs at CatalogIt
dek: How we turned a fragile prompt into a reliable ingest pipeline serving real customers.
date: 2026-04-27
type: CASE STUDY
readTime: 8 min
---

Most CatalogIt customers arrive with a spreadsheet.
Sometimes well-formatted, often not.
Our job is to land that data into the right places in the system — and we wanted to do it without a 30-minute onboarding call.

## The problem

[Describe the customer pain: messy CSVs, inconsistent column names, manual mapping was a bottleneck.]

## The naive approach

[Describe the first prompt: hand the model the schema + CSV header, ask for a mapping. Worked ~70% of the time. Show a simplified code snippet of the initial approach.]

## What broke it

[Edge cases: columns with ambiguous names, multi-language headers, columns that match multiple fields. The model didn't know what it didn't know.]

## Adding confidence scores and explanations

[How you modified the output schema to include `confidence` (0–1) and `explanation` (string). Show the Zod/JSON schema.]

## The eval loop

[How you built a test set of known-good mappings and measured accuracy. What the pass rate looked like before/after.]

## What's in production today

[Current state: accuracy, customer impact, edge cases still handled manually. What you'd do differently.]

## Open-sourcing the core

[Segue to schema-mapper: the production experience led to an open-source library — link when available.]
