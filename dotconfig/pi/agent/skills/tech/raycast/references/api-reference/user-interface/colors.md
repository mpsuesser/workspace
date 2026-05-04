# Colors

Anywhere you can pass a color in a component prop, you can pass either:

* A standard [Color](#color)
* A [Dynamic](#color.dynamic) Color
* A [Raw](#color.raw) Color

## API Reference

### Color

The standard colors. Use those colors for consistency.

The colors automatically adapt to the Raycast theme (light or dark).

#### Example

```typescript
import { Color, Icon, List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="Blue" icon={{ source: Icon.Circle, tintColor: Color.Blue }} />
      <List.Item title="Green" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
      <List.Item title="Magenta" icon={{ source: Icon.Circle, tintColor: Color.Magenta }} />
      <List.Item title="Orange" icon={{ source: Icon.Circle, tintColor: Color.Orange }} />
      <List.Item title="Purple" icon={{ source: Icon.Circle, tintColor: Color.Purple }} />
      <List.Item title="Red" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      <List.Item title="Yellow" icon={{ source: Icon.Circle, tintColor: Color.Yellow }} />
      <List.Item title="PrimaryText" icon={{ source: Icon.Circle, tintColor: Color.PrimaryText }} />
      <List.Item title="SecondaryText" icon={{ source: Icon.Circle, tintColor: Color.SecondaryText }} />
    </List>
  );
}
```

#### Enumeration members

| Name          | Dark Theme                       | Light Theme                      |
| ------------- | -------------------------------- | -------------------------------- |
| Blue          | ![](https://developers.raycast.com/files/XJ6gxMhbBILvRfZvkP6p) | ![](https://developers.raycast.com/files/oFbDXd3g4zp3viLCODOi) |
| Green         | ![](https://developers.raycast.com/files/1JV3o344I5p2zeggcZJ7) | ![](https://developers.raycast.com/files/DgKjjWA03h1QBl30ms4P) |
| Magenta       | ![](https://developers.raycast.com/files/S2knmuFAQ0NHhGwGdrp2) | ![](https://developers.raycast.com/files/5KexXgWT4AYcCGxh5Qo8) |
| Orange        | ![](https://developers.raycast.com/files/dmWxOeIcUcAyiPk0tMF4) | ![](https://developers.raycast.com/files/8tU3zrKC90rBpvZctbmH) |
| Purple        | ![](https://developers.raycast.com/files/4MZyVEJfg7BFyoiHWKTx) | ![](https://developers.raycast.com/files/M69lt8sYaOTrDleXiLLe) |
| Red           | ![](https://developers.raycast.com/files/Z9Z19fU98F7braKMBOOq) | ![](https://developers.raycast.com/files/YCQy4U5CYQa4ARUjis3D) |
| Yellow        | ![](https://developers.raycast.com/files/DRt7kRzZM8wlfPUXqyKJ) | ![](https://developers.raycast.com/files/5rTumXErTLqzkyzWnC4v) |
| PrimaryText   | ![](https://developers.raycast.com/files/ZoEIiSpBdSioTbjFrcqk) | ![](https://developers.raycast.com/files/CYnDpRlUfUEKrotVENoF) |
| SecondaryText | ![](https://developers.raycast.com/files/p5qeGDawfhkqk6xPTcv7) | ![](https://developers.raycast.com/files/pV3fkklTbw1P5V4xxNls) |

## Types

### Color.ColorLike

```typescript
ColorLike: Color | Color.Dynamic | Color.Raw;
```

Union type for the supported color types.

When using a [Raw Color](#color.raw), it will be adjusted to achieve high contrast with the Raycast user interface. To disable color adjustment, you need to switch to using a [Dynamic Color](#color.dynamic). However, we recommend leaving color adjustment on, unless your extension depends on exact color reproduction.

#### Example

```typescript
import { Color, Icon, List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="Built-in color" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      <List.Item title="Raw color" icon={{ source: Icon.Circle, tintColor: "#FF0000" }} />
      <List.Item
        title="Dynamic color"
        icon={{
          source: Icon.Circle,
          tintColor: {
            light: "#FF01FF",
            dark: "#FFFF50",
            adjustContrast: true,
          },
        }}
      />
    </List>
  );
}
```

### Color.Dynamic

A dynamic color applies different colors depending on the active Raycast theme.

When using a [Dynamic Color](#color.dynamic), it will be adjusted to achieve high contrast with the Raycast user interface. To disable color adjustment, you can set the `adjustContrast` property to `false`. However, we recommend leaving color adjustment on, unless your extension depends on exact color reproduction.

#### Example

```typescript
import { Icon, List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item
        title="Dynamic Tint Color"
        icon={{
          source: Icon.Circle,
          tintColor: {
            light: "#FF01FF",
            dark: "#FFFF50",
            adjustContrast: false,
          },
        }}
      />
      <List.Item
        title="Dynamic Tint Color"
        icon={{
          source: Icon.Circle,
          tintColor: { light: "#FF01FF", dark: "#FFFF50" },
        }}
      />
    </List>
  );
}
```

#### Properties

| Property                                | Description                                                         | Type      |
| --------------------------------------- | ------------------------------------------------------------------- | --------- |
| dark\*  | The color which is used in dark theme.                              | `string`  |
| light\* | The color which is used in light theme.                             | `string`  |
| adjustContrast                          | Enables dynamic contrast adjustment for light and dark theme color. | `boolean` |

### Color.Raw

A color can also be a simple string. You can use any of the following color formats:

* HEX, e.g `#FF0000`
* Short HEX, e.g. `#F00`
* RGBA, e.g. `rgb(255, 0, 0)`
* RGBA Percentage, e.g. `rgb(255, 0, 0, 1.0)`
* HSL, e.g. `hsla(200, 20%, 33%, 0.2)`
* Keywords, e.g. `red`
