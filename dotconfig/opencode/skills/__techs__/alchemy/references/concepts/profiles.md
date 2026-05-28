# Profiles

A **profile** is a named bundle of cloud credentials stored locally in `~/.alchemy/profiles.json`. Profiles let you keep work/personal accounts separate, use different roles per environment, and rotate tokens without losing other configurations.

Profiles are independent from [Stages](./stages.md): a stage controls *what* is deployed; a profile controls *how alchemy authenticates*.

## The default profile

Every command uses the profile named **`default`** unless you pass `--profile <name>` or set `$ALCHEMY_PROFILE`. The first deploy creates `default` automatically.

```sh
alchemy deploy
# uses profile `default`
```

## Logging in

The first time you `alchemy deploy` (or `destroy`, `dev`, `plan`), alchemy walks each cloud provider in your stack and prompts you to authenticate (OAuth, API token, SSO profile, …). The result is saved under the current profile.

To re-run the flow at any time:

```sh
# Refresh credentials for the current profile
alchemy login

# Re-run the interactive setup (e.g. switch from OAuth → API token)
alchemy login --configure

# Log into a separate profile
alchemy login --profile prod --configure
```

`login` imports your stack file to discover which providers are needed.

## Inspecting a profile

```sh
alchemy profile show
alchemy profile show --profile prod
```

Sample output (credentials redacted):

```
Profile: default
── AWS ──
  accessKeyId:     ASIA****
  secretAccessKey: Pj5T****
  region:          us-west-2
  source: sso - default
── Cloudflare ──
  accessToken: Xl06****
  expires: in 59m 58s 999ms
  accountId: 123456789...
  source: oauth
```

## Switching profiles

```sh
alchemy deploy --stage prod --profile prod
alchemy destroy --stage pr-42 --profile work

export ALCHEMY_PROFILE=work
alchemy deploy
```

A typical CI pairing: one profile per environment.

```sh
alchemy deploy --stage staging --profile staging
alchemy deploy --stage prod --profile prod
```

## File location

Profiles live at `~/.alchemy/profiles.json` — plain JSON keyed by profile name. You can edit it manually, but `alchemy login --configure` is usually safer.

For environment isolation, see [Stages](./stages.md).
