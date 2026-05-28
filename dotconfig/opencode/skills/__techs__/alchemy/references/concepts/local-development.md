# Local Development

`alchemy dev` provides a fast local dev loop without sacrificing access to real cloud services. Infrastructure deploys to the cloud while your code runs locally with hot reloading.

```sh
bun alchemy dev
```

Three things happen:

1. **Infrastructure deploys to the cloud** — R2 Buckets, D1 Databases, KV Namespaces are real cloud resources. No emulation, no fidelity gaps.
2. **Workers run locally in workerd** — your code executes in the same runtime used in production. A proxy routes requests between the cloud and your local process.
3. **File changes hot reload** — edit your code and the Worker rebuilds instantly.

## Hot module reloading

- Code changes take effect in **milliseconds**
- Cloud resources stay deployed across reloads — only your application code is rebuilt
- Edit, save, refresh

## Why not emulate everything?

Full local emulation (Miniflare, LocalStack) leads to fidelity gaps and false confidence. Alchemy keeps the resources real and only runs application code locally.

## Debugging

Workers run locally in workerd, so you can attach a debugger:

- Set breakpoints in your IDE
- Inspect variables and call stacks
- Profile performance

## Resource adaptation

Resources adapt their behavior in dev mode:

- **Cloudflare Workers** — run locally in workerd with a cloud proxy instead of deploying to the edge
- **Vite dev servers** — integrate with Alchemy's dev server for frontend hot reloading
- **Databases** — connect to real cloud instances

Each resource's provider checks `ALCHEMY_PHASE` (set to `dev`) and adjusts.

## Custom dev port

```ts
export default Cloudflare.Worker("Worker", {
  main: import.meta.path,
  dev: {
    port: 3000,
  },
  // ...
});
```

## `alchemy dev` vs `alchemy deploy`

| | `alchemy dev` | `alchemy deploy` |
|---|---|---|
| Infrastructure | Deployed to cloud | Deployed to cloud |
| Application code | Runs locally in workerd | Deployed to cloud |
| File watching | Hot reload on change | Manual redeploy |
| Debugging | Attach local debugger | Tail logs |
| Speed | Milliseconds | Seconds to minutes |
| Fidelity | Real cloud resources | Real cloud resources |
