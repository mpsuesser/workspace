---
description: Wrap an existing Foldkit app in an Electron desktop shell
---

Add an Electron desktop shell around this existing Foldkit web app without changing the Foldkit renderer app unless absolutely necessary.

Goal:
- Treat the existing Foldkit app as the single renderer source of truth.
- Add Electron as an additive alternative surface, not a migration or fork.
- Discover the project’s actual structure first: workspace layout, UI app/package path, dev server command, build command, build output directory, routing mode, and any existing proxy/backend routes.
- Keep the renderer code platform-neutral. Prefer solving desktop-specific serving, proxying, secrets, and native-window concerns in the Electron main process.

Implementation approach:
1. Inspect the project:
   - identify the Foldkit renderer app/package
   - identify how it runs in dev
   - identify how it builds for production
   - identify the production build output directory
   - identify same-origin backend/proxy routes used by the renderer
   - identify package manager/workspace conventions and root scripts

2. Add a new sibling Electron desktop package/app/workspace using the project’s existing conventions.
   It should contain:
   - package/config files needed for Electron
   - a TypeScript Electron main process
   - optional packaging config if the project already expects packaged builds
   - optional tests for routing/config helpers if this repo uses tests for app infrastructure

3. In development mode:
   - Electron should load the existing web dev server URL.
   - It should retry gracefully while the dev server is still booting.

4. In static/packaged mode:
   - Build the Foldkit app normally.
   - Serve the built assets from Electron.
   - Do not use `file://` as the primary app URL.
   - Register a privileged custom app scheme, for example `app://<app-name>`.
   - Ensure client-side/history routes reload correctly by falling back extensionless routes to `index.html`.

5. Preserve the renderer’s existing same-origin contract:
   - If the web app calls relative routes like `/api`, `/rpc`, `/graphql`, etc., make those work in Electron too.
   - Proxy those routes from the Electron main process to the correct upstreams.
   - Keep secrets/tokens in the main process, not in renderer code.
   - Do not add CORS requirements unless there is no better option.

6. Keep the Electron surface minimal:
   - no preload script unless needed
   - no IPC unless needed
   - no Node access in the renderer unless explicitly required
   - open external links in the OS browser
   - add native window behavior only as needed

7. Add project-level scripts:
   - a desktop dev/start script
   - a desktop build/package script if appropriate
   - include desktop typecheck/build in the repo’s normal validation flow if that matches the project’s conventions
   - ignore generated Electron build output

8. Validate:
   - run the normal web app in dev
   - run Electron in dev and confirm it loads the existing Foldkit app
   - build the Foldkit app and run Electron in static/packaged mode
   - reload a deep client-side route
   - test backend/proxy calls from inside Electron
   - run the repo’s normal checks

Important constraints:
- Do not rename, relocate, or rewrite the existing Foldkit app.
- Do not fork renderer code for desktop.
- Prefer “Electron wraps the existing web app” over “the app becomes an Electron app.”
- If project paths differ from examples, adapt to the discovered local structure.
