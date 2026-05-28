# Observability

Effect already emits OpenTelemetry traces, metrics, and logs. Alchemy declares the exporter as a Layer — point it at Axiom, Datadog, CloudWatch, or any OTLP endpoint — then declare dashboards and alarms next to the code that emits the metrics.

## OpenTelemetry by default

Every Effect spans a trace. Every `Metric` increments a counter. Every `logInfo` ships a log line. The exporter is a Layer — swap one line, ship to a different vendor.

```ts
export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  Effect.gen(function* () {
    yield* Effect.logInfo("request received");
    yield* Metric.increment(requestsTotal);
    return { fetch: handler };
  }).pipe(
    Effect.provide(AxiomExporter), // or CloudWatch, Datadog, OTLP …
  ),
) {}
```

Supported destinations include Axiom, Datadog, CloudWatch, and any OTLP-compatible collector.

## Dashboards and alarms in code

Declare CloudWatch (or Grafana, or Datadog) dashboards and alarms next to the resources they observe. Threshold changes show up as PR diffs — reviewable, revertable, audited.

```ts
export const Dashboard = AWS.CloudWatch.Dashboard("ApiHealth", {
  widgets: [
    Widget.line({ title: "p99 latency", metric: api.metrics.p99 }),
    Widget.line({ title: "requests / sec", metric: api.metrics.rps }),
    Widget.number({ title: "5xx ratio", metric: api.metrics.errorRate }),
  ],
});

export const P99Alarm = AWS.CloudWatch.Alarm("p99Latency", {
  metric: api.metrics.p99,
  threshold: 500,
  comparisonOperator: ">",
  evaluationPeriods: 5,
  alarmActions: [pagerDuty, slackWebhook],
});
```

- Widgets reference typed `.metrics` outputs from your resources.
- Alarms compose. The same alarm can be wired to PagerDuty, Slack, SQS — typed actions.
- Per-stage dashboards: `prod`, `staging`, `pr-42` all separate.

## Alert routing

Alarm actions are typed resources too. Wire alarms to PagerDuty, Slack, an SQS queue, an SNS topic — reuse the same notification channel across every alarm.

- **Threshold + window** — Evaluation periods, statistic, comparison operator — all typed and autocompleted.
- **Composite alarms** — AND/OR multiple alarm states into a higher-level alert.
- **Audit trail in git** — Thresholds and channels live in source; `git blame` answers who/when/why.
