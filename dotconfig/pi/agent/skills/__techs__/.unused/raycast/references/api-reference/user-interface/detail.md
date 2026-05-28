# Detail

![](https://developers.raycast.com/files/7QhfalF99KLagNjrMsUX)

## API Reference

### Detail

Renders a markdown ([CommonMark](https://commonmark.org)) string with an optional metadata panel.

Typically used as a standalone view or when navigating from a [List](list.md).

#### Example

#### Render a markdown string

```typescript
import { Detail } from "@raycast/api";

export default function Command() {
  return <Detail markdown="**Hello** _World_!" />;
}
```

#### Render an image from the assets directory

```typescript
import { Detail } from "@raycast/api";

export default function Command() {
  return <Detail markdown={`![Image Title](example.png)`} />;
}
```

#### Props

| Prop            | Description                                                                    | Type              | Default |
| --------------- | ------------------------------------------------------------------------------ | ----------------- | ------- |
| actions         | A reference to an ActionPanel.                                                 | `React.ReactNode` | -       |
| isLoading       | Indicates whether a loading bar should be shown or hidden below the search bar | `boolean`         | -       |
| markdown        | The CommonMark string to be rendered.                                          | `string`          | -       |
| metadata        | The `Detail.Metadata` to be rendered in the right side area                    | `React.ReactNode` | -       |
| navigationTitle | The main title for that view displayed in Raycast                              | `string`          | -       |

> [!INFO]
> You can specify custom image dimensions by adding a `raycast-width` and `raycast-height` query string to the markdown image. For example: `![Image Title](example.png?raycast-width=250&raycast-height=250)`
>
> You can also specify a tint color to apply to an markdown image by adding a `raycast-tint-color` query string. For example: `![Image Title](example.png?raycast-tintColor=blue)`

> [!INFO]
> You can now render [LaTeX](https://www.latex-project.org) in the markdown. We support the following delimiters:
>
> * Inline math: `\(...\)` and `\begin{math}...\end{math}`
> * Display math: `\[...\]`, `$$...$$` and `\begin{equation}...\end{equation}`

### Detail.Metadata

A Metadata view that will be shown in the right-hand-side of the `Detail`.

Use it to display additional structured data about the main content shown in the `Detail` view.

![Detail-metadata illustration](https://developers.raycast.com/files/Jy07fia1YGCZuzxRgCpX)

#### Example

```typescript
import { Detail } from "@raycast/api";

// Define markdown here to prevent unwanted indentation.
const markdown = `
# Pikachu

![](https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png)

Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.
`;

export default function Main() {
  return (
    <Detail
      markdown={markdown}
      navigationTitle="Pikachu"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Height" text={`1' 04"`} />
          <Detail.Metadata.Label title="Weight" text="13.2 lbs" />
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text="Electric" color={"#eed535"} />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Separator />
          <Detail.Metadata.Link title="Evolution" target="https://www.pokemon.com/us/pokedex/pikachu" text="Raichu" />
        </Detail.Metadata>
      }
    />
  );
}
```

#### Props

| Prop                                       | Description                        | Type              | Default |
| ------------------------------------------ | ---------------------------------- | ----------------- | ------- |
| children\* | The elements of the Metadata view. | `React.ReactNode` | -       |

### Detail.Metadata.Label

A single value with an optional icon.

![Detail-metadata-label illustration](https://developers.raycast.com/files/mTmluHN6JjOqEaak1Woj)

#### Example

```typescript
import { Detail } from "@raycast/api";

// Define markdown here to prevent unwanted indentation.
const markdown = `
# Pikachu

![](https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png)

Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.
`;

export default function Main() {
  return (
    <Detail
      markdown={markdown}
      navigationTitle="Pikachu"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Height" text={`1' 04"`} icon="weight.svg" />
        </Detail.Metadata>
      }
    />
  );
}
```

#### Props

| Prop                                    | Description                                                                                                                | Type                                                                                                                        | Default |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| title\* | The title of the item.                                                                                                     | `string`                                                                                                                    | -       |
| icon                                    | An icon to illustrate the value of the item.                                                                               | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike) | -       |
| text                                    | The text value of the item. Specifying `color` will display the text in the provided color. Defaults to Color.PrimaryText. | `string` or `{ color?:` [`Color`](colors.md#color)`; value: string }`                         | -       |

### Detail.Metadata.Link

An item to display a link.

![Detail-metadata-link illustration](https://developers.raycast.com/files/3fUVKzqb6dKya7dNl3Ot)

#### Example

```typescript
import { Detail } from "@raycast/api";

// Define markdown here to prevent unwanted indentation.
const markdown = `
# Pikachu

![](https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png)

Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.
`;

export default function Main() {
  return (
    <Detail
      markdown={markdown}
      navigationTitle="Pikachu"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Link title="Evolution" target="https://www.pokemon.com/us/pokedex/pikachu" text="Raichu" />
        </Detail.Metadata>
      }
    />
  );
}
```

#### Props

| Prop                                     | Description                     | Type     | Default |
| ---------------------------------------- | ------------------------------- | -------- | ------- |
| target\* | The target of the link.         | `string` | -       |
| text\*   | The text value of the item.     | `string` | -       |
| title\*  | The title shown above the item. | `string` | -       |

### Detail.Metadata.TagList

A list of [`Tags`](#detail.metadata.taglist.item) displayed in a row.

![Detail-metadata-taglist illustration](https://developers.raycast.com/files/9cdjdn44iSydhBniB6vh)

#### Example

```typescript
import { Detail } from "@raycast/api";

// Define markdown here to prevent unwanted indentation.
const markdown = `
# Pikachu

![](https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png)

Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.
`;

export default function Main() {
  return (
    <Detail
      markdown={markdown}
      navigationTitle="Pikachu"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text="Electric" color={"#eed535"} />
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}
```

#### Props

| Prop                                       | Description                        | Type              | Default |
| ------------------------------------------ | ---------------------------------- | ----------------- | ------- |
| children\* | The tags contained in the TagList. | `React.ReactNode` | -       |
| title\*    | The title shown above the item.    | `string`          | -       |

### Detail.Metadata.TagList.Item

A Tag in a `Detail.Metadata.TagList`.

#### Props

| Prop     | Description                                                                                         | Type                                                                                                                        | Default |
| -------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| color    | Changes the text color to the provided color and sets a transparent background with the same color. | [`Color.ColorLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRbUk391XIQ6FMp#color.colorlike) | -       |
| icon     | The optional icon tag icon. Required if the tag has no text.                                        | [`Image.ImageLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRdFuMoKkR6at_E#image.imagelike) | -       |
| onAction | Callback that is triggered when the item is clicked.                                                | `() => void`                                                                                                                | -       |
| text     | The optional tag text. Required if the tag has no icon.                                             | `string`                                                                                                                    | -       |

### Detail.Metadata.Separator

A metadata item that shows a separator line. Use it for grouping and visually separating metadata items.

![](https://developers.raycast.com/files/Cw8w24koVYxART0gYL3M)

```typescript
import { Detail } from "@raycast/api";

// Define markdown here to prevent unwanted indentation.
const markdown = `
# Pikachu

![](https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png)

Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.
`;

export default function Main() {
  return (
    <Detail
      markdown={markdown}
      navigationTitle="Pikachu"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Height" text={`1' 04"`} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Weight" text="13.2 lbs" />
        </Detail.Metadata>
      }
    />
  );
}
```
