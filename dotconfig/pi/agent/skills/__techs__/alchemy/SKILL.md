---
name: alchemy
description: Always load this skill when working directly with any of the following - Cloudflare Workers, Durable Objects, R2, D1, SecretsStore, Queues, Hyperdrive, EmailRouting, EmailSending, Containers; PlanetScale; Drizzle; Axiom
lastUpdated: 2026-05-21T00:00:00.000Z
---

# Alchemy

> Alchemy Effect is an Infrastructure-as-Effects (IaE) framework that combines cloud infrastructure and application logic into a single, type-safe program powered by [Effect](https://effect.website). Resources are declared as Effects; bindings wire IAM, env vars, and typed SDKs in one call; deploys and runtime share the same code.

This file is a navigation index for the local reference docs under `references/`. Every page listed below has been scraped from the official docs at https://v2.alchemy.run and stored locally so the agent can read them directly with the `read` tool. **When working on an Alchemy task, load the relevant reference files in full** — don't skim, and don't try to work from this index alone.

## Start here

- [What is Alchemy?](./references/what-is-alchemy.md) — Alchemy is an Infrastructure-as-Effects framework that combines cloud infrastructure and application logic into a single type-safe program powered by Effect.
- [Getting Started](./references/getting-started.md) — Install Alchemy and create your first Stack in under two minutes.

## Tutorial — main path (Cloudflare)

A linear five-part walkthrough from zero to a tested, locally-developed, CI-deployed Cloudflare project. Each part builds on the previous one.

- [Part 1: Your First Stack](./references/tutorial/part-1.md) — Install Alchemy, create a Stack with a Cloudflare R2 Bucket, and deploy it.
- [Part 2: Add a Worker](./references/tutorial/part-2.md) — Create a Cloudflare Worker, bind the R2 Bucket, and implement GET/PUT routes.
- [Part 3: Testing](./references/tutorial/part-3.md) — Write integration tests that deploy your stack and make HTTP requests against your live Worker.
- [Part 4: Local Dev](./references/tutorial/part-4.md) — Run your stack locally with alchemy dev for hot reloading and instant feedback.
- [Part 5: CI/CD](./references/tutorial/part-5.md) — Set up GitHub Actions for automated deployments, PR previews, and remote state — with Cloudflare credentials managed as code.

## Tutorial — Cloudflare add-ons

Standalone tutorials that extend the main tutorial's Worker with a specific Cloudflare feature. Pick the ones that match your use case.

- [Add a Durable Object](./references/tutorial/cloudflare/durable-objects.md) — Add a Durable Object to your Worker — persist state per key, expose RPC methods, and stream values back to the client.
- [Accept WebSockets](./references/tutorial/cloudflare/hibernatable-websockets.md) — Accept WebSocket connections in a Durable Object, broadcast between peers, and survive Cloudflare's hibernation.
- [Run a Container](./references/tutorial/cloudflare/containers.md) — Run a long-lived container alongside a Durable Object, expose RPC methods, and proxy HTTP requests to ports inside the container.
- [Add a Workflow](./references/tutorial/cloudflare/workflows.md) — Orchestrate durable, multi-step work with Cloudflare Workflows — automatic retries, replayable steps, and at-least-once delivery.
- [Add a Vite SPA](./references/tutorial/cloudflare/vite-spa.md) — Ship a Vite single-page app from the same Stack as your Worker — built, bundled, and deployed to Cloudflare in one command.
- [Add an AI Gateway](./references/tutorial/cloudflare/ai-gateway.md) — Route Workers AI calls through a Cloudflare AI Gateway for caching, rate limiting, and unified observability across providers.

## Tutorial — AWS

End-to-end AWS tutorials. Read the Lambda page first; the others bind storage and event sources to that Lambda.

- [Deploy a Lambda Function](./references/tutorial/aws/lambda.md) — Stand up an AWS Lambda Function from a single Effect, expose it over a Function URL, and call it from a test.
- [Read & Write S3](./references/tutorial/aws/s3.md) — Add an S3 Bucket to your Stack, bind PutObject and GetObject as runtime capabilities, and let Alchemy mint the IAM policy for you.
- [React to S3 Events](./references/tutorial/aws/s3-events.md) — Subscribe a Lambda Function to S3 bucket notifications, process them as an Effect Stream, and let Alchemy wire up the IAM and event-source plumbing.
- [Send & Consume SQS Messages](./references/tutorial/aws/sqs.md) — Add an SQS Queue, publish messages from your Lambda, and consume them from a second consumer Lambda — all wired through Alchemy bindings.
- [Stream Records with Kinesis](./references/tutorial/aws/kinesis.md) — Add a Kinesis Data Stream, publish records from one Lambda, and consume them in order from another — wired through the same Stream-shaped event source.
- [Store Records in DynamoDB](./references/tutorial/aws/dynamodb.md) — Add a DynamoDB Table, bind GetItem and PutItem to your Lambda, and serve a typed key/value HTTP API backed by DynamoDB.
- [Process DynamoDB Streams](./references/tutorial/aws/dynamodb-streams.md) — Enable a DynamoDB Stream on your table and consume change records as a typed Effect Stream from the same Lambda.

## Concepts — the mental model

Reference pages explaining what each primitive means and how they fit together. Read these when something in a tutorial feels magical, or before designing a new Stack.

- [Resource](./references/concepts/resource.md) — Resources are named cloud entities with input properties and output attributes.
- [Provider](./references/concepts/provider.md) — Providers implement the lifecycle operations for a resource type — reconcile, delete, diff, read, and more.
- [Resource Lifecycle](./references/concepts/resource-lifecycle.md) — How alchemy plans, applies, replaces, and destroys resources — and how to think about idempotency and recovery.
- [Stack](./references/concepts/stack.md) — A Stack is a collection of Resources deployed together as a unit.
- [Stages](./references/concepts/stages.md) — Stages are isolated instances of a Stack — dev_sam, staging, prod, pr-42 — each with their own state and physical names.
- [Phases](./references/concepts/phases.md) — Alchemy programs run in two phases — plantime/init drives the deploy, runtime handles requests. Knowing which is which is the key to using Platforms.
- [Platform](./references/concepts/platform.md) — A Platform bundles infrastructure with the runtime code that runs on it — Workers, Lambda Functions, Containers — so your handler ships with its bindings.
- [Binding](./references/concepts/binding.md) — A binding connects a resource to a Worker or Lambda. It generates IAM policies, env vars, and a typed SDK in one call.
- [Inputs and Outputs](./references/concepts/outputs.md) — Output<T> is alchemy's lazy reference type — the lazy values that flow between resources, get composed with .pipe, mapped, interpolated, and resolved during deploy.
- [Layers](./references/concepts/layers.md) — A Layer encapsulates a slice of infrastructure (resources, bindings, runtime logic) behind a typed service interface. Code that depends on the interface stays cloud-agnostic; swapping the implementation swaps the underlying infrastructure.
- [State Store](./references/concepts/state-store.md) — How Alchemy persists resource state between deploys to compute diffs and track infrastructure.
- [Profiles](./references/concepts/profiles.md) — Profiles store cloud credentials per environment in ~/.alchemy/profiles.json — switch between work and personal accounts, or between staging and prod credentials.
- [Local Development](./references/concepts/local-development.md) — How alchemy dev provides hot reloading, local workerd execution, and cloud-backed resources for fast iteration.
- [Observability](./references/concepts/observability.md) — Effect emits OpenTelemetry — ship traces, metrics, and logs to Axiom, Datadog, CloudWatch, or any OTLP endpoint. Declare dashboards and alarms in code.
- [Testing](./references/concepts/testing.md) — Reference for alchemy/Test — every helper, hook, and option exposed by Test.make for Bun and Vitest.

## Guides — task-oriented

Standalone how-to pages. Each solves a specific problem; read in any order.

- [Continuous Integration](./references/guides/ci.md) — Set up CI/CD pipelines for alchemy projects with GitHub Actions, automated deployments, and PR previews — with provider credentials managed as code.
- [Circular Bindings](./references/guides/circular-bindings.md) — How to model two services that reference each other (Worker A ↔ Worker B, Lambda ↔ Lambda) using tagged classes and Layers.
- [CLI Reference](./references/guides/cli.md) — All Alchemy CLI commands — deploy, destroy, plan, dev, tail, logs, aws, cloudflare, login, profile, and state.
- [Writing a Custom Resource Provider](./references/guides/custom-provider.md) — Add support for a new cloud or third-party API by declaring a Resource type and implementing its lifecycle as an Effect Layer.
- [Writing a Custom State Store](./references/guides/custom-state-store.md) — Build a Postgres-backed Alchemy state store step by step — implement the StateService interface, plug it into a stack, and test it end-to-end.
- [Effect HTTP API](./references/guides/effect-http-api.md) — Build a schema-validated HTTP API with Effect's HttpApi module and deploy it as a Cloudflare Worker.
- [Effect RPC](./references/guides/effect-rpc.md) — Build a typed RPC API with Effect's Rpc module and deploy it as a Cloudflare Worker.
- [Frontend frameworks](./references/guides/frontends.md) — Deploy Vite-based frameworks (TanStack Start, Astro, SolidStart, Nuxt, React) and any custom-built static site (Hugo, Eleventy) to Cloudflare with one declaration.
- [Building Infrastructure Layers](./references/guides/infrastructure-layers.md) — Package resources + bindings + runtime glue into a typed Effect Layer that callers can swap between clouds or replace with an in-memory mock.
- [Migrating from v1](./references/guides/migrating-from-v1.md) — Migrate your Alchemy v1 (async/await) project to Alchemy v2.
- [Monorepos](./references/guides/monorepo.md) — Two patterns for organizing an Alchemy monorepo with a backend API and a frontend website — one shared stack (recommended) or one stack per package — with the trade-offs and a working example for each.
- [Secrets and env vars](./references/guides/secrets.md) — Wire OPENAI_API_KEY (or any .env value) into a Cloudflare Worker as a secret_text binding using Alchemy.Secret and Effect's Config.
- [Shared database across stages](./references/guides/shared-database.md) — Have ephemeral PR-preview stages reference a long-lived Neon Postgres project from staging instead of provisioning their own — fast previews, copy-on-write branches, no extra Postgres clusters.

## Blog

- [alchemy@2.0.0-beta.35](./references/blog/2026-05-08-beta-35.md) — A Stream-shaped Effect consumer for Cloudflare Queues, R2 bucket custom domains, non-string env bindings on Workers, Neon logical replication, and a round of CLI quality-of-life.
- [alchemy@2.0.0-beta.36](./references/blog/2026-05-09-beta-36.md) — Cloudflare Images binding, Hyperdrive as a Worker binding, R2 object lifecycle rules, and a dev-mode networking fix.
- [Secrets and Variables](./references/blog/2026-05-11-secrets-and-variables.md) — Bind a value into your deploy target's env and get back a typed runtime accessor — the same one-liner works for Cloudflare Workers and AWS Lambda.
- [alchemy@2.0.0-beta.37](./references/blog/2026-05-12-beta-37.md) — Cross-stack and cross-stage references, fully-typed Worker-to-Worker bindings, Workflows with typed I/O, `Alchemy.Secret` / `Alchemy.Variable`, cron triggers, an Analytics Engine binding, and R2 buckets that finally empty themselves on destroy.
- [alchemy@2.0.0-beta.38](./references/blog/2026-05-13-beta-38.md) — Cloudflare Email Routing and the `send_email` Worker binding, a new `Action` plan node for arbitrary Effects that run during apply, a leaner Neon provider on the typed `@distilled.cloud/neon` SDK, and a transport-error retry fix.
- [alchemy@2.0.0-beta.39](./references/blog/2026-05-13-beta-39.md) — A small, high-impact fix release — `VITE_*` env props are now inlined into the client bundle, the Cloudflare Worker HTTP adapter runs handlers through Effect's standard HTTP lifecycle (unblocking `RpcServer.toHttpEffect`), and the `SendEmail` binding from beta.38 is now wired into Worker binding inference.
- [alchemy@2.0.0-beta.40](./references/blog/2026-05-15-beta-40.md) — Cloudflare local dev gains a real Vite dev server (HMR, SSR, client + worker in one process), AiGateway stops reporting spurious updates on every deploy, the Worker HTTP server returns generic 500s while logging the full Cause server-side, and a handful of fixes around entrypoint generation, container startup, and the dev lockfile.
- [alchemy@2.0.0-beta.41](./references/blog/2026-05-20-beta-41.md) — A big internal rewrite of the Cloudflare Worker runtime fixes hung requests and dropped responses from RPC and HTTP API workers. The Worker entrypoint is now a thin shell over `WorkerBridge.ts`, scopes are linearized per request, and the same schema-driven pattern (HTTP API, RPC, and Durable Object proxies) is now stable end-to-end.

## Providers — auto-generated API reference

Per-resource API pages live under `https://v2.alchemy.run/providers/{Cloud}/{Resource}` (e.g. `/providers/AWS/Bucket`, `/providers/Cloudflare/Worker`). They are generated from JSDoc on the source `.ts` files via `bun generate:api-reference` and are not checked into git, so these are **not** mirrored locally. Each page documents:

- The resource's input properties (props) with types, defaults, and constraints.
- The resource's output attributes.
- Quick Reference and Examples sections derived from `@section` / `@example` JSDoc tags.

To find a specific resource, browse the Providers section in the sidebar at https://v2.alchemy.run, or read the source JSDoc at `packages/alchemy/src/{Cloud}/{Service}/{Resource}.ts` in [the repository](https://github.com/alchemy-run/alchemy-effect).
