# Toast

When an asynchronous operation is happening or when an error is thrown, it's usually a good idea to keep the user informed about it. Toasts are made for that.

Additionally, Toasts can have some actions associated to the action they are about. For example, you could provide a way to cancel an asynchronous operation, undo an action, or copy the stack trace of an error.

> [!INFO]
> The `showToast()` will fallback to [showHUD()](hud.md#showhud) if the Raycast window is closed.

![](https://developers.raycast.com/files/p2Ao61w6yFE9oEI2qsvA)

## API Reference

### showToast

Creates and shows a Toast with the given [options](#toast.options).

#### Signature

```typescript
async function showToast(options: Toast.Options): Promise<Toast>;
```

#### Example

```typescript
import { showToast, Toast } from "@raycast/api";

export default async function Command() {
  const success = false;

  if (success) {
    await showToast({ title: "Dinner is ready", message: "Pizza margherita" });
  } else {
    await showToast({
      style: Toast.Style.Failure,
      title: "Dinner isn't ready",
      message: "Pizza dropped on the floor",
    });
  }
}
```

When showing an animated Toast, you can later on update it:

```typescript
import { showToast, Toast } from "@raycast/api";
import { setTimeout } from "timers/promises";

export default async function Command() {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Uploading image",
  });

  try {
    // upload the image
    await setTimeout(1000);

    toast.style = Toast.Style.Success;
    toast.title = "Uploaded image";
  } catch (err) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed to upload image";
    if (err instanceof Error) {
      toast.message = err.message;
    }
  }
}
```

#### Parameters

| Name                                      | Description                         | Type                                                                                                              |
| ----------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| options\* | The options to customize the Toast. | [`Alert.Options`](https://developers.raycast.com/api-reference/feedback/pages/WwoLgel1tKGMFIlb32QR#alert.options) |

#### Return

A Promise that resolves with the shown Toast. The Toast can be used to change or hide it.

## Types

### Toast

A Toast with a certain style, title, and message.

Use [showToast](#showtoast) to create and show a Toast.

#### Properties

| Property                                          | Description                                                                                                        | Type                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| message\*         | An additional message for the Toast. Useful to show more information, e.g. an identifier of a newly created asset. | `string`                                                                                                                      |
| primaryAction\*   | The primary Action the user can take when hovering on the Toast.                                                   | [`Alert.ActionOptions`](https://developers.raycast.com/api-reference/feedback/pages/WwoLgel1tKGMFIlb32QR#alert.actionoptions) |
| secondaryAction\* | The secondary Action the user can take when hovering on the Toast.                                                 | [`Alert.ActionOptions`](https://developers.raycast.com/api-reference/feedback/pages/WwoLgel1tKGMFIlb32QR#alert.actionoptions) |
| style\*           | The style of a Toast.                                                                                              | [`Action.Style`](https://developers.raycast.com/api-reference/feedback/pages/-MiwANRaRK1jG1WJw3dy#action.style)               |
| title\*           | The title of a Toast. Displayed on the top.                                                                        | `string`                                                                                                                      |

#### Methods

| Name | Type                  | Description      |
| ---- | --------------------- | ---------------- |
| hide | `() => Promise<void>` | Hides the Toast. |
| show | `() => Promise<void>` | Shows the Toast. |

### Toast.Options

The options to create a [Toast](#toast).

#### Example

```typescript
import { showToast, Toast } from "@raycast/api";

export default async function Command() {
  const options: Toast.Options = {
    style: Toast.Style.Success,
    title: "Finished cooking",
    message: "Delicious pasta for lunch",
    primaryAction: {
      title: "Do something",
      onAction: (toast) => {
        console.log("The toast action has been triggered");
        toast.hide();
      },
    },
  };
  await showToast(options);
}
```

#### Properties

| Property                                | Description                                                                                                        | Type                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| title\* | The title of a Toast. Displayed on the top.                                                                        | `string`                                                                                                                      |
| message                                 | An additional message for the Toast. Useful to show more information, e.g. an identifier of a newly created asset. | `string`                                                                                                                      |
| primaryAction                           | The primary Action the user can take when hovering on the Toast.                                                   | [`Alert.ActionOptions`](https://developers.raycast.com/api-reference/feedback/pages/WwoLgel1tKGMFIlb32QR#alert.actionoptions) |
| secondaryAction                         | The secondary Action the user can take when hovering on the Toast.                                                 | [`Alert.ActionOptions`](https://developers.raycast.com/api-reference/feedback/pages/WwoLgel1tKGMFIlb32QR#alert.actionoptions) |
| style                                   | The style of a Toast.                                                                                              | [`Action.Style`](https://developers.raycast.com/api-reference/feedback/pages/-MiwANRaRK1jG1WJw3dy#action.style)               |

### Toast.Style

Defines the visual style of the Toast.

Use [Toast.Style.Success](#toast.style) for confirmations and [Toast.Style.Failure](#toast.style) for displaying errors.
Use [Toast.Style.Animated](#toast.style) when your Toast should be shown until a process is completed.
You can hide it later by using [Toast.hide](#toast) or update the properties of an existing Toast.

#### Enumeration members

| Name     | Value                            |
| -------- | -------------------------------- |
| Animated | ![](https://developers.raycast.com/files/IVXRyPP5lT6Ow6fBJWZt) |
| Success  | ![](https://developers.raycast.com/files/r5wjQiSm5F802e6Tunoi) |
| Failure  | ![](https://developers.raycast.com/files/SAJ6DPeJISjOjTrkEbi8) |

### Toast.ActionOptions

The options to create a [Toast](#toast) Action.

#### Properties

| Property                                   | Description                                     | Type                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| onAction\* | A callback called when the action is triggered. | `(toast:` [`Toast`](#toast)`) => void`                                                                                    |
| title\*    | The title of the action.                        | `string`                                                                                                                  |
| shortcut                                   | The keyboard shortcut for the action.           | [`Keyboard.Shortcut`](https://developers.raycast.com/api-reference/feedback/pages/-MlFvcN8apU1HW0IqNpC#keyboard.shortcut) |
