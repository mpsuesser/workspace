---
name: alchemy
description: Use whenever working with Alchemy (Infrastructure as Effects)
lastUpdated: 2026-05-11T03:39:09.000Z
---

# Alchemy

> Alchemy Effect is an Infrastructure-as-Effects (IaE) framework that combines cloud infrastructure and application logic into a single, type-safe program powered by [Effect](https://effect.website). Resources are declared as Effects; bindings wire IAM, env vars, and typed SDKs in one call; deploys and runtime share the same code.

This file is a navigation index for the documentation site at https://v2.alchemy.run. Every page under `/src/content/docs/` is listed below with its URL and a one-line summary, so an agent can pick the right page in one hop.

## Start here

- [What is Alchemy?](https://v2.alchemy.run/what-is-alchemy) â€” Alchemy is an Infrastructure-as-Effects framework that combines cloud infrastructure and application logic into a single type-safe program powered by Effect.
- [Getting Started](https://v2.alchemy.run/getting-started) â€” Install Alchemy and create your first Stack in under two minutes.

## Tutorial â€” main path (Cloudflare)

A linear five-part walkthrough from zero to a tested, locally-developed, CI-deployed Cloudflare project. Each part builds on the previous one.

- [Part 1: Your First Stack](https://v2.alchemy.run/tutorial/part-1) â€” Install Alchemy, create a Stack with a Cloudflare R2 Bucket, and deploy it.
- [Part 2: Add a Worker](https://v2.alchemy.run/tutorial/part-2) â€” Create a Cloudflare Worker, bind the R2 Bucket, and implement GET/PUT routes.
- [Part 3: Testing](https://v2.alchemy.run/tutorial/part-3) â€” Write integration tests that deploy your stack and make HTTP requests against your live Worker.
- [Part 4: Local Dev](https://v2.alchemy.run/tutorial/part-4) â€” Run your stack locally with alchemy dev for hot reloading and instant feedback.
- [Part 5: CI/CD](https://v2.alchemy.run/tutorial/part-5) â€” Set up GitHub Actions for automated deployments, PR previews, and remote state â€” with Cloudflare credentials managed as code.

## Tutorial â€” Cloudflare add-ons

Standalone tutorials that extend the main tutorial's Worker with a specific Cloudflare feature. Pick the ones that match your use case.

- [Add a Durable Object](https://v2.alchemy.run/tutorial/cloudflare/durable-objects) â€” Add a Durable Object to your Worker â€” persist state per key, expose RPC methods, and stream values back to the client.
- [Accept WebSockets](https://v2.alchemy.run/tutorial/cloudflare/hibernatable-websockets) â€” Accept WebSocket connections in a Durable Object, broadcast between peers, and survive Cloudflare's hibernation.
- [Run a Container](https://v2.alchemy.run/tutorial/cloudflare/containers) â€” Run a long-lived container alongside a Durable Object, expose RPC methods, and proxy HTTP requests to ports inside the container.
- [Add a Workflow](https://v2.alchemy.run/tutorial/cloudflare/workflows) â€” Orchestrate durable, multi-step work with Cloudflare Workflows â€” automatic retries, replayable steps, and at-least-once delivery.
- [Add a Vite SPA](https://v2.alchemy.run/tutorial/cloudflare/vite-spa) â€” Ship a Vite single-page app from the same Stack as your Worker â€” built, bundled, and deployed to Cloudflare in one command.
- [Add an AI Gateway](https://v2.alchemy.run/tutorial/cloudflare/ai-gateway) â€” Route Workers AI calls through a Cloudflare AI Gateway for caching, rate limiting, and unified observability across providers.

## Tutorial â€” AWS

End-to-end AWS tutorials. Read the Lambda page first; the others bind storage and event sources to that Lambda.

- [Deploy a Lambda Function](https://v2.alchemy.run/tutorial/aws/lambda) â€” Stand up an AWS Lambda Function from a single Effect, expose it over a Function URL, and call it from a test.
- [Read & Write S3](https://v2.alchemy.run/tutorial/aws/s3) â€” Add an S3 Bucket to your Stack, bind PutObject and GetObject as runtime capabilities, and let Alchemy mint the IAM policy for you.
- [React to S3 Events](https://v2.alchemy.run/tutorial/aws/s3-events) â€” Subscribe a Lambda Function to S3 bucket notifications, process them as an Effect Stream, and let Alchemy wire up the IAM and event-source plumbing.
- [Send & Consume SQS Messages](https://v2.alchemy.run/tutorial/aws/sqs) â€” Add an SQS Queue, publish messages from your Lambda, and consume them from a second consumer Lambda â€” all wired through Alchemy bindings.
- [Stream Records with Kinesis](https://v2.alchemy.run/tutorial/aws/kinesis) â€” Add a Kinesis Data Stream, publish records from one Lambda, and consume them in order from another â€” wired through the same Stream-shaped event source.
- [Store Records in DynamoDB](https://v2.alchemy.run/tutorial/aws/dynamodb) â€” Add a DynamoDB Table, bind GetItem and PutItem to your Lambda, and serve a typed key/value HTTP API backed by DynamoDB.
- [Process DynamoDB Streams](https://v2.alchemy.run/tutorial/aws/dynamodb-streams) â€” Enable a DynamoDB Stream on your table and consume change records as a typed Effect Stream from the same Lambda.

## Concepts â€” the mental model

Reference pages explaining what each primitive means and how they fit together. Read these when something in a tutorial feels magical, or before designing a new Stack.

- [Resource](https://v2.alchemy.run/concepts/resource) â€” Resources are named cloud entities with input properties and output attributes.
- [Provider](https://v2.alchemy.run/concepts/provider) â€” Providers implement the lifecycle operations for a resource type â€” reconcile, delete, diff, read, and more.
- [Resource Lifecycle](https://v2.alchemy.run/concepts/resource-lifecycle) â€” How alchemy plans, applies, replaces, and destroys resources â€” and how to think about idempotency and recovery.
- [Stack](https://v2.alchemy.run/concepts/stack) â€” A Stack is a collection of Resources deployed together as a unit.
- [Stages](https://v2.alchemy.run/concepts/stages) â€” Stages are isolated instances of a Stack â€” dev_sam, staging, prod, pr-42 â€” each with their own state and physical names.
- [Phases](https://v2.alchemy.run/concepts/phases) â€” Alchemy programs run in two phases â€” plantime/init drives the deploy, runtime/exec handles requests. Knowing which is which is the key to using Platforms.
- [Platform](https://v2.alchemy.run/concepts/platform) â€” A Platform bundles infrastructure with the runtime code that runs on it â€” Workers, Lambda Functions, Containers â€” so your handler ships with its bindings.
- [Binding](https://v2.alchemy.run/concepts/binding) â€” A binding connects a resource to a Worker or Lambda. It generates IAM policies, env vars, and a typed SDK in one call.
- [Inputs and Outputs](https://v2.alchemy.run/concepts/outputs) â€” Output<T> is alchemy's lazy reference type â€” the lazy values that flow between resources, get composed with .pipe, mapped, interpolated, and resolved during deploy.
- [Layers](https://v2.alchemy.run/concepts/layers) â€” Use Effect Layers to encapsulate infrastructure behind a clean interface â€” define a service once, swap implementations across stacks, providers, and tests.
- [State Store](https://v2.alchemy.run/concepts/state-store) â€” How Alchemy persists resource state between deploys to compute diffs and track infrastructure.
- [Profiles](https://v2.alchemy.run/concepts/profiles) â€” Profiles store cloud credentials per environment in ~/.alchemy/profiles.json â€” switch between work and personal accounts, or between staging and prod credentials.
- [Local Development](https://v2.alchemy.run/concepts/local-development) â€” How alchemy dev provides hot reloading, local workerd execution, and cloud-backed resources for fast iteration.
- [Observability](https://v2.alchemy.run/concepts/observability) â€” Effect emits OpenTelemetry â€” ship traces, metrics, and logs to Axiom, Datadog, CloudWatch, or any OTLP endpoint. Declare dashboards and alarms in code.
- [Testing](https://v2.alchemy.run/concepts/testing) â€” Reference for alchemy/Test â€” every helper, hook, and option exposed by Test.make for Bun and Vitest.

## Guides â€” task-oriented

Standalone how-to pages. Each solves a specific problem; read in any order.

- [Continuous Integration](https://v2.alchemy.run/guides/ci) â€” Set up CI/CD pipelines for alchemy projects with GitHub Actions, automated deployments, and PR previews â€” with provider credentials managed as code.
- [Circular Bindings](https://v2.alchemy.run/guides/circular-bindings) â€” How to model two services that reference each other (Worker A â†” Worker B, Lambda â†” Lambda) using tagged classes and Layers.
- [CLI Reference](https://v2.alchemy.run/guides/cli) â€” All Alchemy CLI commands â€” deploy, destroy, plan, dev, tail, logs, aws, cloudflare, login, profile, and state.
- [Writing a Custom Resource Provider](https://v2.alchemy.run/guides/custom-provider) â€” Add support for a new cloud or third-party API by declaring a Resource type and implementing its lifecycle as an Effect Layer.
- [Writing a Custom State Store](https://v2.alchemy.run/guides/custom-state-store) â€” Build a Postgres-backed Alchemy state store step by step â€” implement the StateService interface, plug it into a stack, and test it end-to-end.
- [Effect HTTP API](https://v2.alchemy.run/guides/effect-http-api) â€” Build a schema-validated HTTP API with Effect's HttpApi module and deploy it as a Cloudflare Worker.
- [Effect RPC](https://v2.alchemy.run/guides/effect-rpc) â€” Build a typed RPC API with Effect's Rpc module and deploy it as a Cloudflare Worker.
- [Frontend frameworks](https://v2.alchemy.run/guides/frontends) â€” Deploy Vite-based frameworks (TanStack Start, Astro, SolidStart, Nuxt, React) and any custom-built static site (Hugo, Eleventy) to Cloudflare with one declaration.
- [Migrating from v1](https://v2.alchemy.run/guides/migrating-from-v1) â€” Migrate your Alchemy v1 (async/await) project to Alchemy v2.
- [Privacy & Telemetry](https://v2.alchemy.run/guides/privacy) â€” What data the Alchemy CLI and Cloudflare State Store collect, where it goes, and how to opt out.

## Blog

- [Hello World](https://v2.alchemy.run/blog/2026-04-13-hello-world) â€” Introducing the alchemy blog â€” a place for updates, deep dives, and patterns for building cloud programs with Effect.

## Providers â€” auto-generated API reference

Per-resource API pages live under `https://v2.alchemy.run/providers/{Cloud}/{Resource}` (e.g. `/providers/AWS/Bucket`, `/providers/Cloudflare/Worker`). They are generated from JSDoc on the source `.ts` files via `bun generate:api-reference` and are not checked into git, so this index does not enumerate them. Each page documents:

- The resource's input properties (props) with types, defaults, and constraints.
- The resource's output attributes.
- Quick Reference and Examples sections derived from `@section` / `@example` JSDoc tags.

To find a specific resource, browse the Providers section in the sidebar at https://v2.alchemy.run, or read the source JSDoc at `packages/alchemy/src/{Cloud}/{Service}/{Resource}.ts` in [the repository](https://github.com/alchemy-run/alchemy-effect).
