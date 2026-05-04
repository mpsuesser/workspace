# Actions

Our API includes a few built-in actions that can be used for common interactions, such as opening a link or copying some content to the clipboard. By using them, you make sure to follow our human interface guidelines. If you need something custom, use the [`Action`](#action) component. All built-in actions are just abstractions on top of it.

## API Reference

### Action

A context-specific action that can be performed by the user.

Assign keyboard shortcuts to items to make it easier for users to perform frequently used actions.

#### Example

```typescript
import { ActionPanel, Action, List } from "@raycast/api";

export default function Command() {
  return (
    <List navigationTitle="Open Pull Requests">
      <List.Item
        title="Docs: Update API Reference"
        subtitle="#1"
        actions={
          <ActionPanel title="#1 in raycast/extensions">
            <Action.OpenInBrowser url="https://github.com/raycast/extensions/pull/1" />
            <Action.CopyToClipboard title="Copy Pull Request Number" content="#1" />
            <Action title="Close Pull Request" onAction={() => console.log("Close PR #1")} />
          </ActionPanel>
        }
      />
    </List>
  );
}
```

#### Props

| Prop                                    | Description                                                                                                              | Type                                                                                                                            | Default |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| title\* | The title displayed for the Action.                                                                                      | `string`                                                                                                                        | -       |
| autoFocus                               | Indicates whether the Action should be focused automatically when the parent ActionPanel (or Actionpanel.Submenu) opens. | `boolean`                                                                                                                       | -       |
| icon                                    | The icon displayed for the Action.                                                                                       | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| onAction                                | Callback that is triggered when the Action is selected.                                                                  | `() => void`                                                                                                                    | -       |
| shortcut                                | The keyboard shortcut for the Action.                                                                                    | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| style                                   | Defines the visual style of the Action.                                                                                  | [`Alert.ActionStyle`](https://developers.raycast.com/api-reference/user-interface/pages/WwoLgel1tKGMFIlb32QR#alert.actionstyle) | -       |

### Action.CopyToClipboard

Action that copies the content to the clipboard.

The main window is closed, and a HUD is shown after the content was copied to the clipboard.

#### Example

```typescript
import { ActionPanel, Action, Detail } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown="Press `⌘ + .` and share some love."
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content="I ❤️ Raycast" shortcut={{ modifiers: ["cmd"], key: "." }} />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                      | Description                                                                                                            | Type                                                                                                                                                                       | Default |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| content\* | The contents that will be copied to the clipboard.                                                                     | `string` or `number` or [`Clipboard.Content`](https://developers.raycast.com/api-reference/user-interface/pages/-MeevahoUhiMuSWf1kdb#clipboard.content)                    | -       |
| concealed                                 | Indicates whether the content be treated as confidential. If `true`, it will not be recorded in the Clipboard History. | `boolean`                                                                                                                                                                  | -       |
| icon                                      | A optional icon displayed for the Action.                                                                              | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)                                                | -       |
| onCopy                                    | Callback when the content was copied to clipboard.                                                                     | `(content: string \| number \|` [`Clipboard.Content`](https://developers.raycast.com/api-reference/user-interface/pages/-MeevahoUhiMuSWf1kdb#clipboard.content)`) => void` | -       |
| shortcut                                  | The keyboard shortcut for the Action.                                                                                  | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut)                                            | -       |
| title                                     | An optional title for the Action.                                                                                      | `string`                                                                                                                                                                   | -       |

### Action.Open

An action to open a file or folder with a specific application, just as if you had double-clicked the file's icon.

The main window is closed after the file is opened.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown="Check out your extension code."
      actions={
        <ActionPanel>
          <Action.Open title="Open Folder" target={__dirname} />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                     | Description                                       | Type                                                                                                                            | Default |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| target\* | The file, folder or URL to open.                  | `string`                                                                                                                        | -       |
| title\*  | The title for the Action.                         | `string`                                                                                                                        | -       |
| application                              | The application name to use for opening the file. | `string` or [`Application`](../utilities.md#application)                                                            | -       |
| icon                                     | The icon displayed for the Action.                | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| onOpen                                   | Callback when the file or folder was opened.      | `(target: string) => void`                                                                                                      | -       |
| shortcut                                 | The keyboard shortcut for the Action.             | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |

### Action.OpenInBrowser

Action that opens a URL in the default browser.

The main window is closed after the URL is opened in the browser.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown="Join the gang!"
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url="https://raycast.com/jobs" />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                  | Description                                      | Type                                                                                                                            | Default |
| ------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| url\* | The URL to open.                                 | `string`                                                                                                                        | -       |
| icon                                  | The icon displayed for the Action.               | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| onOpen                                | Callback when the URL was opened in the browser. | `(url: string) => void`                                                                                                         | -       |
| shortcut                              | The optional keyboard shortcut for the Action.   | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| title                                 | An optional title for the Action.                | `string`                                                                                                                        | -       |

### Action.OpenWith

Action that opens a file or URL with a specific application.

The action opens a sub-menu with all applications that can open the file or URL. The main window is closed after the item is opened in the specified application.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";
import { homedir } from "os";

const DESKTOP_DIR = `${homedir()}/Desktop`;

export default function Command() {
  return (
    <Detail
      markdown="What do you want to use to open your desktop with?"
      actions={
        <ActionPanel>
          <Action.OpenWith path={DESKTOP_DIR} />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                   | Description                                  | Type                                                                                                                            | Default |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| path\* | The path to open.                            | `string`                                                                                                                        | -       |
| icon                                   | The icon displayed for the Action.           | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| onOpen                                 | Callback when the file or folder was opened. | `(path: string) => void`                                                                                                        | -       |
| shortcut                               | The keyboard shortcut for the Action.        | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| title                                  | The title for the Action.                    | `string`                                                                                                                        | -       |

### Action.Paste

Action that pastes the content to the front-most applications.

The main window is closed after the content is pasted to the front-most application.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown="Let us know what you think about the Raycast API?"
      actions={
        <ActionPanel>
          <Action.Paste content="api@raycast.com" />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                      | Description                                                           | Type                                                                                                                                                                       | Default |
| ----------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| content\* | The contents that will be pasted to the frontmost application.        | `string` or `number` or [`Clipboard.Content`](https://developers.raycast.com/api-reference/user-interface/pages/-MeevahoUhiMuSWf1kdb#clipboard.content)                    | -       |
| icon                                      | The icon displayed for the Action.                                    | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)                                                | -       |
| onPaste                                   | Callback when the content was pasted into the front-most application. | `(content: string \| number \|` [`Clipboard.Content`](https://developers.raycast.com/api-reference/user-interface/pages/-MeevahoUhiMuSWf1kdb#clipboard.content)`) => void` | -       |
| shortcut                                  | The keyboard shortcut for the Action.                                 | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut)                                            | -       |
| title                                     | An optional title for the Action.                                     | `string`                                                                                                                                                                   | -       |

### Action.Push

Action that pushes a new view to the navigation stack.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";

function Ping() {
  return (
    <Detail
      markdown="Ping"
      actions={
        <ActionPanel>
          <Action.Push title="Push Pong" target={<Pong />} />
        </ActionPanel>
      }
    />
  );
}

function Pong() {
  return <Detail markdown="Pong" />;
}

export default function Command() {
  return <Ping />;
}
```

#### Props

| Prop                                     | Description                                                  | Type                                                                                                                            | Default |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| target\* | The target view that will be pushed to the navigation stack. | `React.ReactNode`                                                                                                               | -       |
| title\*  | The title displayed for the Action.                          | `string`                                                                                                                        | -       |
| icon                                     | The icon displayed for the Action.                           | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| onPop                                    | Callback when the target view will be popped.                | `() => void`                                                                                                                    | -       |
| onPush                                   | Callback when the target view was pushed.                    | `() => void`                                                                                                                    | -       |
| shortcut                                 | The keyboard shortcut for the Action.                        | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |

### Action.ShowInFinder

Action that shows a file or folder in the Finder.

The main window is closed after the file or folder is revealed in the Finder.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";
import { homedir } from "os";

const DOWNLOADS_DIR = `${homedir()}/Downloads`;

export default function Command() {
  return (
    <Detail
      markdown="Are your downloads pilling up again?"
      actions={
        <ActionPanel>
          <Action.ShowInFinder path={DOWNLOADS_DIR} />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                   | Description                                               | Type                                                                                                                            | Default |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| path\* | The path to open.                                         | `"fs".PathLike`                                                                                                                 | -       |
| icon                                   | A optional icon displayed for the Action.                 | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| onShow                                 | Callback when the file or folder was shown in the Finder. | `(path: "fs".PathLike) => void`                                                                                                 | -       |
| shortcut                               | The keyboard shortcut for the Action.                     | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| title                                  | An optional title for the Action.                         | `string`                                                                                                                        | -       |

### Action.SubmitForm

Action that adds a submit handler for capturing form values.

#### Example

```typescript
import { ActionPanel, Form, Action } from "@raycast/api";

export default function Command() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit Answer" onSubmit={(values) => console.log(values)} />
        </ActionPanel>
      }
    >
      <Form.Checkbox id="answer" label="Are you happy?" defaultValue={true} />
    </Form>
  );
}
```

#### Props

| Prop     | Description                                                                                               | Type                                                                                                                                                                            | Default |
| -------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| icon     | The icon displayed for the Action.                                                                        | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)                                                     | -       |
| onSubmit | Callback when the Form was submitted. The handler receives a the values object containing the user input. | `(input:` [`Form.Values`](https://developers.raycast.com/api-reference/user-interface/pages/-Meevt-B8-ffKiiXp5LH#form.values)`) => boolean \| void \| Promise<boolean \| void>` | -       |
| shortcut | The keyboard shortcut for the Action.                                                                     | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut)                                                 | -       |
| style    | Defines the visual style of the Action.                                                                   | [`Alert.ActionStyle`](https://developers.raycast.com/api-reference/user-interface/pages/WwoLgel1tKGMFIlb32QR#alert.actionstyle)                                                 | -       |
| title    | The title displayed for the Action.                                                                       | `string`                                                                                                                                                                        | -       |

### Action.Trash

Action that moves a file or folder to the Trash.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";
import { homedir } from "os";

const FILE = `${homedir()}/Downloads/get-rid-of-me.txt`;

export default function Command() {
  return (
    <Detail
      markdown="Some spring cleaning?"
      actions={
        <ActionPanel>
          <Action.Trash paths={FILE} />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                    | Description                                      | Type                                                                                                                            | Default |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| paths\* | The item or items to move to the trash.          | `"fs".PathLike` or `"fs".PathLike[]`                                                                                            | -       |
| icon                                    | A optional icon displayed for the Action.        | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| onTrash                                 | Callback when all items were moved to the trash. | `(paths: "fs".PathLike \| "fs".PathLike[]) => void`                                                                             | -       |
| shortcut                                | The optional keyboard shortcut for the Action.   | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| title                                   | An optional title for the Action.                | `string`                                                                                                                        | -       |

### Action.CreateSnippet

Action that navigates to the the Create Snippet command with some or all of the fields prefilled.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown="Test out snippet creation"
      actions={
        <ActionPanel>
          <Action.CreateSnippet snippet={{ text: "DE75512108001245126199" }} />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                      | Description                                                                                        | Type                                                                                                                            | Default |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| snippet\* |                                                                                                    | [`Snippet`](#snippet)                                                                                                           | -       |
| icon                                      | A optional icon displayed for the Action. See Image.ImageLike for the supported formats and types. | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| shortcut                                  | The keyboard shortcut for the Action.                                                              | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| title                                     | An optional title for the Action.                                                                  | `string`                                                                                                                        | -       |

### Action.CreateQuicklink

Action that navigates to the the Create Quicklink command with some or all of the fields prefilled.

#### Example

```typescript
import { ActionPanel, Detail, Action } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown="Test out quicklink creation"
      actions={
        <ActionPanel>
          <Action.CreateQuicklink quicklink={{ link: "https://duckduckgo.com/?q={Query}" }} />
        </ActionPanel>
      }
    />
  );
}
```

#### Props

| Prop                                        | Description                                                                                        | Type                                                                                                                            | Default |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| quicklink\* | The Quicklink to create.                                                                           | [`Quicklink`](#quicklink)                                                                                                       | -       |
| icon                                        | A optional icon displayed for the Action. See Image.ImageLike for the supported formats and types. | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| shortcut                                    | The keyboard shortcut for the Action.                                                              | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| title                                       | An optional title for the Action.                                                                  | `string`                                                                                                                        | -       |

### Action.ToggleQuickLook

Action that toggles the Quick Look to preview a file.

#### Example

```typescript
import { ActionPanel, List, Action } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item
        title="Preview me"
        quickLook={{ path: "~/Downloads/Raycast.dmg", name: "Some file" }}
        actions={
          <ActionPanel>
            <Action.ToggleQuickLook />
          </ActionPanel>
        }
      />
    </List>
  );
}
```

#### Props

| Prop     | Description                           | Type                                                                                                                            | Default |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| icon     | The icon displayed for the Action.    | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| shortcut | The keyboard shortcut for the Action. | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| title    | The title for the Action.             | `string`                                                                                                                        | -       |

### Action.PickDate

Action to pick a date.

#### Example

```typescript
import { ActionPanel, List, Action } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item
        title="Todo"
        actions={
          <ActionPanel>
            <Action.PickDate title="Set Due Date…" />
          </ActionPanel>
        }
      />
    </List>
  );
}
```

#### Props

| Prop                                       | Description                                                                                                                                                                                                                                                                                                                                                    | Type                                                                                                                            | Default |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| onChange\* | Callback when the Date was picked                                                                                                                                                                                                                                                                                                                              | `(date:` [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)`) => void`             | -       |
| title\*    | A title for the Action.                                                                                                                                                                                                                                                                                                                                        | `string`                                                                                                                        | -       |
| icon                                       | A optional icon displayed for the Action.                                                                                                                                                                                                                                                                                                                      | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike)     | -       |
| max                                        | The maximum date (inclusive) allowed for selection. - If the PickDate type is `Type.Date`, only the full day date will be considered for comparison, ignoring the time components of the Date object. - If the PickDate type is `Type.DateTime`, both date and time components will be considered for comparison. The date should be a JavaScript Date object. | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)                                 | -       |
| min                                        | The minimum date (inclusive) allowed for selection. - If the PickDate type is `Type.Date`, only the full day date will be considered for comparison, ignoring the time components of the Date object. - If the PickDate type is `Type.DateTime`, both date and time components will be considered for comparison. The date should be a JavaScript Date object. | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)                                 | -       |
| shortcut                                   | The keyboard shortcut for the Action.                                                                                                                                                                                                                                                                                                                          | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/user-interface/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) | -       |
| type                                       | Indicates what types of date components can be picked Defaults to Action.PickDate.Type.DateTime                                                                                                                                                                                                                                                                | [`Action.PickDate.Type`](#action.pickdate.type)                                                                                 | -       |

## Types

### Snippet

#### Properties

| Property                               | Description                         | Type     |
| -------------------------------------- | ----------------------------------- | -------- |
| text\* | The snippet contents.               | `string` |
| keyword                                | The keyword to trigger the snippet. | `string` |
| name                                   | The snippet name.                   | `string` |

### Quicklink

#### Properties

| Property                               | Description                                                                                                | Type                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| link\* | The URL or file path, optionally including placeholders such as in "<https://google.com/search?q={Query}>" | `string`                                                             |
| application                            | The application that the quicklink should be opened in.                                                    | `string` or [`Application`](../utilities.md#application) |
| icon                                   | The icon to display for the quicklink.                                                                     | [`Icon`](icons-and-images.md#icon)     |
| name                                   | The quicklink name                                                                                         | `string`                                                             |

### Action.Style

Defines the visual style of the Action.

Use [Action.Style.Regular](#action.style) for displaying a regular actions. Use [Action.Style.Destructive](#action.style) when your action has something that user should be careful about. Use the confirmation [Alert](../feedback/alert.md) if the action is doing something that user cannot revert.

### Action.PickDate.Type

The types of date components the user can pick with an `Action.PickDate`.

#### Enumeration members

| Name     | Description                                                      |
| -------- | ---------------------------------------------------------------- |
| DateTime | Hour and second can be picked in addition to year, month and day |
| Date     | Only year, month, and day can be picked                          |

### Action.PickDate.isFullDay

A method that determines if a given date represents a full day or a specific time.

```tsx
import { ActionPanel, List, Action } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item
        title="Todo"
        actions={
          <ActionPanel>
            <Action.PickDate
              title="Set Due Date…"
              onChange={(date) => {
                if (Action.PickDate.isFullDay(values.reminderDate)) {
                  // the event is for a full day
                } else {
                  // the event is at a specific time
                }
              }}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}
```
