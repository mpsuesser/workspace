# Create Your First Extension

## Create a new extension

Open the Create Extension command, name your extension "Hello World" and select the "Detail" template. Pick a parent folder in the Location field and press `⌘` `↵` to continue.

![Create Extension command in Raycast](https://developers.raycast.com/files/tbeHWr3nxcCaaL0IhAOl)

> [!INFO]
> To create a private extension, select your organization in the first dropdown. You need to be logged in and part of an organization to see the dropdown. Learn more about Raycast for Teams [here](../teams/getting-started.md).

> [!INFO]
> To kickstart your extensions, Raycast provides various templates for commands and tools. Learn more [here](../information/developer-tools/templates.md).

Next, you'll need to follow the on-screen instructions to build the extension.

## Build the extension

Open your terminal, navigate to your extension directory and run `npm install && npm run dev`. Open Raycast, and you'll notice your extension at the top of the root search. Press `↵` to open it.

![Your first extension](https://developers.raycast.com/files/ceKSMOrn1acrLreYwaxz)

## Develop your extension

To make changes to your extension, open the `./src/index.tsx` file in your extension directory, change the `markdown` text and save it. Then, open your command in Raycast again and see your changes.

> [!INFO]
> `npm run dev` starts the extension in development mode with hot reloading, error reporting and [more](../information/developer-tools/cli.md#development).

## Use your extension

Now, you can press `⌃` `C` in your terminal to stop `npm run dev`. The extension stays in Raycast, and you can find its commands in the root when searching for the extension name "Hello World" or the command name "Render Markdown".

![Find your extension in the root search](https://developers.raycast.com/files/ceKSMOrn1acrLreYwaxz)

🎉 Congratulations! You built your first extension. Off to many more.

> [!INFO]
> Don't forget to run [`npm run dev`](../information/developer-tools/cli.md#development) again when you want to change something in your extension.
