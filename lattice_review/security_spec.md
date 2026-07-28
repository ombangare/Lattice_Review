# Security Specification for Codebase Consistency Reviewer (CCR)

This document details the security model, invariants, and threat-prevention payload tests for CCR's Firestore database.

## 1. Data Invariants

1. **User Ownership Enforcer**: A user can only read and write data nested under their own `/users/{userId}` parent document.
2. **Repository Integrity**: A repository document must have a valid non-empty string ID, a name, a URL, and a creation date.
3. **Validation on Creation/Updates**: All writes must contain correct types and adhere to size limits to prevent wallet exhaustion.

## 2. The "Dirty Dozen" Threat Payloads (Test Specifications)

1. **Identity Spoofing**: Attempt to create a repository under `userA`'s subcollection using `userB`'s authentication token.
2. **Anonymous Write**: Attempt to create a repository without any authentication.
3. **Repository ID Inject Attack**: Attempt to write a repository with an excessively large ID (>128 chars) containing special shell/sql injection characters.
4. **Negative Analytics**: Attempt to increment a repository's `totalAnalyses` counter to a negative value.
5. **No-Name Repo Creation**: Attempt to create a repository document missing the mandatory `name` field.
6. **Malicious Patterns Overwrite**: Attempt to overwrite another user's learned patterns.
7. **Junk Fields Injection**: Attempt to write undocumented/malicious top-level fields inside a `Patterns` document.
8. **Invalid Status Transition**: Attempt to set a repository's status to a random string (e.g., `hacked`) instead of the valid status values (`ready`, `pattern-learning`, `error`).
9. **Blanket List Read**: Attempt to perform a flat collection-group query or a list query on all repos across all users.
10. **Analysis Report Forgery**: Attempt to inject a fake analysis report containing high severity counts for another user.
11. **Excessive Field Lengths**: Attempt to write a repository name that is 50,000 characters long.
12. **Analysis Time Manipulation**: Attempt to write a negative `analysisTimeMs` inside a report.

## 3. Firestore Security Rules Blueprint

These rules are stored in `firestore.rules`. Let's define the Fortress Rules.
