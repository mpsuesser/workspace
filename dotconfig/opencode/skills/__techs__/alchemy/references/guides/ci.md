# Continuous Integration

Set up GitHub Actions for Alchemy: a deploy workflow with PR previews, a `stacks/github.ts` that mints scoped CI credentials, and provider-specific recipes for Cloudflare and AWS. The unifying idea is credentials-as-code — Alchemy provisions exactly the credentials CI needs and writes them straight to the repo as encrypted secrets.

## PR preview flow

1. PR opens → workflow computes `STAGE = pr-{number}` and runs the deploy job.
2. Alchemy deploys an isolated copy of every resource under that stage.
3. A `GitHub.Comment` is posted (or updated) on the PR with the preview URL.
4. PR merged/closed → cleanup job runs `alchemy destroy --stage pr-{n}`.

## Preview comments

In `alchemy.run.ts`:

```ts
import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";

if (process.env.PULL_REQUEST) {
  yield* GitHub.Comment("preview-comment", {
    owner: "your-org",
    repository: "your-repo",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: Output.interpolate`
      ## Preview Deployed
      **URL:** ${app.url}
      Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}
      ---
      _This comment updates automatically with each push._
    `,
  });
}
```

The comment's logical ID (`"preview-comment"`) stays stable so it updates in place rather than creating a new comment on every push.

## Base workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy Application
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, reopened, synchronize, closed]

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

env:
  STAGE: ${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.number) || (github.ref == 'refs/heads/main' && 'prod' || github.ref_name) }}

jobs:
  deploy:
    if: ${{ github.event.action != 'closed' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - name: Deploy
        run: bun alchemy deploy --stage ${{ env.STAGE }}
        env:
          PULL_REQUEST: ${{ github.event.number }}
          GITHUB_SHA: ${{ github.sha }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  cleanup:
    if: ${{ github.event_name == 'pull_request' && github.event.action == 'closed' }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - name: Safety Check
        run: |
          if [ "${{ env.STAGE }}" = "prod" ]; then
            echo "ERROR: Cannot destroy prod environment in cleanup job"
            exit 1
          fi
      - name: Destroy Preview Environment
        run: bun alchemy destroy --stage ${{ env.STAGE }}
        env:
          PULL_REQUEST: ${{ github.event.number }}
```

`GITHUB_TOKEN` is provided automatically by GitHub Actions and authorizes the `GitHub.Comment` resource.

## Set up an admin profile

The `stacks/github.ts` stack needs more privilege than your day-to-day app stack (creating Cloudflare tokens requires `API Tokens > Write`; AWS IAM admin rights for OIDC). Use a separate profile:

```sh
alchemy login --profile admin
```

Deploy the GitHub stack once locally:

```sh
alchemy deploy stacks/github.ts --profile admin
```

Re-run only when rotating credentials or changing permissions.

## Cloudflare: single-account setup

`stacks/github.ts`:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

export default Alchemy.Stack(
  "github",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const accountId = yield* Config.string("CLOUDFLARE_ACCOUNT_ID");
    const apiToken = yield* Cloudflare.AccountApiToken("CIToken", {
      accountId,
      policies: [
        {
          effect: "allow",
          permissionGroups: [
            "Workers Scripts Write",
            "Workers KV Storage Write",
            "Workers R2 Storage Write",
            "D1 Write",
            "Queues Write",
            "Pages Write",
            "Account Settings Write",
            "Secrets Store Write",
            "Workers Tail Read",
          ],
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: "*",
          },
        },
      ],
    });
    yield* GitHub.Secret("cf-api-token", {
      owner: "your-org",
      repository: "your-repo",
      name: "CLOUDFLARE_API_TOKEN",
      value: apiToken.value,
    });
    yield* GitHub.Secret("cf-account-id", {
      owner: "your-org",
      repository: "your-repo",
      name: "CLOUDFLARE_ACCOUNT_ID",
      value: Redacted.make(accountId),
    });
  }),
);
```

Notes:
- `Cloudflare.AccountApiToken` calls `POST /accounts/{account_id}/tokens`; Cloudflare returns the token value exactly once. The raw token never touches your terminal.
- Trim `permissionGroups` to what your app actually needs.

Add the secrets to the workflow:

```yaml
- name: Deploy
  run: bun alchemy deploy --stage ${{ env.STAGE }}
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    # ...
```

## Cloudflare: separate test/prod accounts

Mint two tokens, prefix the secrets, switch on `STAGE` in the workflow:

```yaml
env:
  CLOUDFLARE_API_TOKEN: ${{ env.STAGE == 'prod' && secrets.PROD_CLOUDFLARE_API_TOKEN || secrets.TEST_CLOUDFLARE_API_TOKEN }}
  CLOUDFLARE_ACCOUNT_ID: ${{ env.STAGE == 'prod' && secrets.PROD_CLOUDFLARE_ACCOUNT_ID || secrets.TEST_CLOUDFLARE_ACCOUNT_ID }}
```

Your `admin` profile needs API-token-write permission on both accounts (typically the Global API Key of a user that's a member of both).

## AWS with GitHub OIDC (recommended)

OIDC lets workflows assume an IAM role without storing long-lived keys. Stack creates the OIDC provider + an IAM role scoped to your repo, writes ARN and region as Actions **variables**:

```ts
const oidc = yield* AWS.IAM.OpenIDConnectProvider("GitHubOidc", {
  url: "https://token.actions.githubusercontent.com",
  clientIDList: ["sts.amazonaws.com"],
  thumbprintList: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
});

const role = yield* AWS.IAM.Role("GitHubActionsRole", {
  roleName: "github-actions",
  assumeRolePolicyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { Federated: oidc.openIDConnectProviderArn },
        Action: ["sts:AssumeRoleWithWebIdentity"],
        Condition: {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
          StringLike: {
            "token.actions.githubusercontent.com:sub": "repo:your-org/your-repo:*",
          },
        },
      },
    ],
  },
  managedPolicyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"],
});

const region = yield* AWS.Region;

yield* GitHub.Variable("aws-role-arn", {
  owner: "your-org",
  repository: "your-repo",
  name: "AWS_ROLE_ARN",
  value: role.roleArn,
});
yield* GitHub.Variable("aws-region", {
  owner: "your-org",
  repository: "your-repo",
  name: "AWS_REGION",
  value: region,
});
```

Workflow needs `id-token: write` and the `configure-aws-credentials` action:

```yaml
deploy:
  permissions:
    id-token: write
    contents: read
    pull-requests: write
  steps:
    - uses: actions/checkout@v4
    # ...setup and install...
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: ${{ vars.AWS_ROLE_ARN }}
        aws-region: ${{ vars.AWS_REGION }}
    - name: Deploy
      run: bun alchemy deploy --stage ${{ env.STAGE }}
```

## AWS with static access keys (fallback)

When OIDC isn't available. Push existing keys from your environment into the repo:

```ts
const accessKeyId = yield* Config.string("AWS_ACCESS_KEY_ID");
const secretAccessKey = yield* Config.redacted("AWS_SECRET_ACCESS_KEY");

yield* GitHub.Secret("aws-access-key-id", {
  owner: "your-org",
  repository: "your-repo",
  name: "AWS_ACCESS_KEY_ID",
  value: Redacted.make(accessKeyId),
});
yield* GitHub.Secret("aws-secret-access-key", {
  owner: "your-org",
  repository: "your-repo",
  name: "AWS_SECRET_ACCESS_KEY",
  value: secretAccessKey,
});
yield* GitHub.Variable("aws-region", {
  owner: "your-org",
  repository: "your-repo",
  name: "AWS_REGION",
  value: "us-east-1",
});
```

Add to workflow env:

```yaml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  AWS_REGION: ${{ vars.AWS_REGION || 'us-east-1' }}
```
