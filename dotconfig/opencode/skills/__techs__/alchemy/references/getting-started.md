# Getting Started

## Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 22+
- A [Cloudflare](https://dash.cloudflare.com/sign-up) account

## Create a project

```sh
mkdir my-app && cd my-app && bun init -y
```

## Install dependencies

```sh
bun add "alchemy@2.0.0-beta.43" "effect@>=4.0.0-beta.66 || >=4.0.0" "@effect/platform-bun@>=4.0.0-beta.66 || >=4.0.0" "@effect/platform-node@>=4.0.0-beta.66 || >=4.0.0"
```

## Create your Stack

Every Alchemy program starts with a Stack — create `alchemy.run.ts`:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2Bucket("Bucket");
    return {
      bucketName: bucket.bucketName,
    };
  }),
);
```

## Deploy

Run `alchemy deploy` to create the Bucket on Cloudflare:

```sh
bun alchemy deploy
```

The first time you deploy, Alchemy walks each provider in your stack (here, Cloudflare) through an interactive login and saves the credentials to your **`default`** [profile](./concepts/profiles.md) at `~/.alchemy/profiles.json`. For Cloudflare you can sign in with OAuth in the browser or paste an API token — no environment variables required.

Once you're authenticated, Alchemy shows a plan, asks for confirmation, and provisions the resource:

```
Plan: 1 to create
+ Bucket (Cloudflare.R2Bucket)

Proceed?
◉ Yes ○ No
✓ Bucket (Cloudflare.R2Bucket) created
{
  bucketName: "myapp-bucket-a1b2c3d4e5",
}
```

That's it — you have a live R2 Bucket on Cloudflare.
