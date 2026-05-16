---
name: raycast
description: Build, configure, debug, publish, and maintain Raycast extensions with the Raycast API. Use when working with @raycast/api, @raycast/utils, extension manifests, commands, tools, UI components, AI extensions, Raycast Store publishing, or Raycast Teams/private extensions.
---

# Raycast

Raycast extensions are built with TypeScript, React, Node.js, `@raycast/api`, and optional `@raycast/utils` helpers.

When working on a Raycast extension, read the relevant local reference first. The files in `references/` are a cleaned Markdown mirror of the Raycast developer docs.

## Common tasks

- Create a new extension: [basics/create-your-first-extension.md](references/basics/create-your-first-extension.md)
- Understand extension structure and manifest: [information/file-structure.md](references/information/file-structure.md)
- Develop/debug/lint/build with the CLI: [information/developer-tools/cli.md](references/information/developer-tools/cli.md)
- Prepare and publish to the Store: [basics/prepare-an-extension-for-store.md](references/basics/prepare-an-extension-for-store.md)
- Build lists, forms, detail views, and actions: [api-reference/user-interface.md](references/api-reference/user-interface.md)
- Use AI in extensions: [ai/getting-started.md](references/ai/getting-started.md)
- Use utilities and React hooks: [utilities/getting-started.md](references/utilities/getting-started.md)
- Find any page: [documentation map](references/doc-map.md)

## Reference sections

### Raycast API

- [Introduction](references/readme.md) — Start building your perfect tools with the Raycast API.

### Basics

- [Getting Started](references/basics/getting-started.md) — This guide covers the prerequisites you need to start building extensions.
- [Create Your First Extension](references/basics/create-your-first-extension.md) — Learn how to build your first extension and use it in Raycast.
- [Contribute to an Extension](references/basics/contribute-to-an-extension.md) — Learn how to import an extension to collaborate with others.
- [Prepare an Extension for Store](references/basics/prepare-an-extension-for-store.md) — Learn how to get through review process quickly
- [Publish an Extension](references/basics/publish-an-extension.md) — Learn how to share your extension with our community.
- [Debug an Extension](references/basics/debug-an-extension.md) — This guide covers how to find and fix bugs in your extension.
- [Install an Extension](references/basics/install-an-extension.md) — Learn how to find and use extensions from the Raycast Store.
- [Review an Extension in a Pull Request](references/basics/review-pullrequest.md) — Learn how to review a contribution from a Pull Request opened by a contributor.

### AI Extensions

- [Getting Started](references/ai/getting-started.md) — This guide explains how to use AI inside extensions.
- [Create an AI Extension](references/ai/create-an-ai-extension.md) — Learn how to turn a regular extension into an AI-powered one.
- [Learn Core Concepts of AI Extensions](references/ai/learn-core-concepts-of-ai-extensions.md) — Get to know the core concepts of AI extensions.
- [Write Evals for Your AI Extension](references/ai/write-evals-for-your-ai-extension.md) — Make your AI Extension more reliable by writing evals.
- [Follow Best Practices for AI Extensions](references/ai/follow-best-practices-for-ai-extensions.md) — Make the most out of your AI Extension by following best practices.

### Teams

- [Getting Started](references/teams/getting-started.md) — This guide sets you up with Raycast for Teams.
- [Publish a Private Extension](references/teams/publish-a-private-extension.md) — Learn how to share an extension in your organization's private extension store
- [Collaborate on Private Extensions](references/teams/collaborate-on-private-extensions.md) — This guide explains how to collaborate with your team on extensions.

### Examples

- [Doppler Share Secrets](references/examples/doppler.md) — This example uses a simple form to collect data.
- [Hacker News](references/examples/hacker-news.md) — This example shows how to show an RSS feed as a List.
- [Todo List](references/examples/todo-list.md) — This example show how to use lists in combination with forms.
- [Spotify Controls](references/examples/spotify-controls.md) — This example shows how to bundle multiple scripts into a single extension.

### Information

- [Terminology](references/information/terminology.md) — An explanation of various terms used in this documentation.
- [File Structure](references/information/file-structure.md) — Understand the file structure of an extension.
- [Manifest](references/information/manifest.md)
- [Lifecycle](references/information/lifecycle.md)
- [Arguments](references/information/lifecycle/arguments.md)
- [Background Refresh](references/information/lifecycle/background-refresh.md)
- [Deeplinks](references/information/lifecycle/deeplinks.md)
- [Best Practices](references/information/best-practices.md) — Tips to guarantee a good user experience for your extensions.
- [Developer Tools](references/information/developer-tools.md)
- [Manage Extensions Command](references/information/developer-tools/manage-extensions-command.md) — A Raycast command to manage your extensions, add new commands or attachments, etc.
- [CLI](references/information/developer-tools/cli.md) — The Raycast CLI allows you to build, develop, and lint your extension.
- [ESLint](references/information/developer-tools/eslint.md)
- [Forked Extensions (community tool)](references/information/developer-tools/forked-extensions.md)
- [VS Code (community tool)](references/information/developer-tools/vscode.md)
- [Templates](references/information/developer-tools/templates.md) — Learn about the templates provided by Raycast to help kickstart your extension.
- [Security](references/information/security.md)
- [Versioning](references/information/versioning.md)

### API Reference

- [AI](references/api-reference/ai.md)
- [Browser Extension](references/api-reference/browser-extension.md)
- [Cache](references/api-reference/cache.md)
- [Command](references/api-reference/command.md)
- [Clipboard](references/api-reference/clipboard.md)
- [Environment](references/api-reference/environment.md)
- [Feedback](references/api-reference/feedback.md)
- [Alert](references/api-reference/feedback/alert.md)
- [HUD](references/api-reference/feedback/hud.md)
- [Toast](references/api-reference/feedback/toast.md)
- [Keyboard](references/api-reference/keyboard.md)
- [Menu Bar Commands](references/api-reference/menu-bar-commands.md)
- [OAuth](references/api-reference/oauth.md)
- [Preferences](references/api-reference/preferences.md)
- [Storage](references/api-reference/storage.md)
- [System Utilities](references/api-reference/utilities.md)
- [User Interface](references/api-reference/user-interface.md)
- [Action Panel](references/api-reference/user-interface/action-panel.md)
- [Actions](references/api-reference/user-interface/actions.md)
- [Detail](references/api-reference/user-interface/detail.md)
- [Form](references/api-reference/user-interface/form.md)
- [List](references/api-reference/user-interface/list.md) — The de-facto user interface in Raycast. Ideal to present similar data such as to-dos or files.
- [Grid](references/api-reference/user-interface/grid.md)
- [Colors](references/api-reference/user-interface/colors.md)
- [Icons & Images](references/api-reference/user-interface/icons-and-images.md)
- [Navigation](references/api-reference/user-interface/navigation.md)
- [Raycast Window & Search Bar](references/api-reference/window-and-search-bar.md)
- [Tool](references/api-reference/tool.md)
- [Window Management](references/api-reference/window-management.md)

### Utilities

- [Getting Started](references/utilities/getting-started.md)
- [Functions](references/utilities/functions.md)
- [createDeeplink](references/utilities/functions/createdeeplink.md)
- [executeSQL](references/utilities/functions/executesql.md)
- [runAppleScript](references/utilities/functions/runapplescript.md)
- [runPowerShellScript](references/utilities/functions/runpowershellscript.md)
- [showFailureToast](references/utilities/functions/showfailuretoast.md)
- [withCache](references/utilities/functions/withcache.md)
- [Icons](references/utilities/icons.md)
- [getAvatarIcon](references/utilities/icons/getavataricon.md)
- [getFavicon](references/utilities/icons/getfavicon.md)
- [getProgressIcon](references/utilities/icons/getprogressicon.md)
- [OAuth Utils](references/utilities/oauth.md)
- [OAuthService](references/utilities/oauth/oauthservice.md)
- [withAccessToken](references/utilities/oauth/withaccesstoken.md)
- [getAccessToken](references/utilities/oauth/getaccesstoken.md)
- [Getting a Google client ID](references/utilities/oauth/getting-google-client-id.md)
- [React hooks](references/utilities/react-hooks.md)
- [useCachedState](references/utilities/react-hooks/usecachedstate.md)
- [usePromise](references/utilities/react-hooks/usepromise.md)
- [useCachedPromise](references/utilities/react-hooks/usecachedpromise.md)
- [useFetch](references/utilities/react-hooks/usefetch.md)
- [useForm](references/utilities/react-hooks/useform.md)
- [useExec](references/utilities/react-hooks/useexec.md)
- [useSQL](references/utilities/react-hooks/usesql.md)
- [useAI](references/utilities/react-hooks/useai.md)
- [useFrecencySorting](references/utilities/react-hooks/usefrecencysorting.md)
- [useStreamJSON](references/utilities/react-hooks/usestreamjson.md)
- [useLocalStorage](references/utilities/react-hooks/uselocalstorage.md)

### Misc

- [Changelog](references/misc/changelog.md)
- [Migration](references/misc/migration.md)
- [v1.28.0](references/misc/migration/v1.28.0.md)
- [v1.31.0](references/misc/migration/v1.31.0.md)
- [v1.37.0](references/misc/migration/v1.37.0.md)
- [v1.42.0](references/misc/migration/v1.42.0.md)
- [v1.48.8](references/misc/migration/v1.48.8.md)
- [v1.50.0](references/misc/migration/v1.50.0.md)
- [v1.51.0](references/misc/migration/v1.51.0.md)
- [v1.59.0](references/misc/migration/v1.59.0.md)
- [FAQ](references/misc/faq.md) — Answers to the most frequently asked questions.
