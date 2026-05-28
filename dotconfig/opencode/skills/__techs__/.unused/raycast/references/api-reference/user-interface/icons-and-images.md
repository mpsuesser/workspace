# Icons & Images

## API Reference

### Icon

List of built-in icons that can be used for actions or list items.

#### Example

```typescript
import { Icon, List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="Icon" icon={Icon.Circle} />
    </List>
  );
}
```

#### Enumeration members

|        AddPerson       |        Airplane       |      AirplaneFilled     |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     AirplaneLanding    |    AirplaneTakeoff    |         Airpods         |
|          Alarm         |      AlarmRinging     |       AlignCentre       |
|        AlignLeft       |       AlignRight      |     AmericanFootball    |
|         Anchor         |       AppWindow       |     AppWindowGrid2x2    |
|    AppWindowGrid3x3    |     AppWindowList     |   AppWindowSidebarLeft  |
|  AppWindowSidebarRight |     ArrowClockwise    |  ArrowCounterClockwise  |
|        ArrowDown       |    ArrowDownCircle    |  ArrowDownCircleFilled  |
|        ArrowLeft       |    ArrowLeftCircle    |  ArrowLeftCircleFilled  |
|         ArrowNe        |       ArrowRight      |     ArrowRightCircle    |
| ArrowRightCircleFilled |        ArrowUp        |      ArrowUpCircle      |
|   ArrowUpCircleFilled  |     ArrowsContract    |       ArrowsExpand      |
|        AtSymbol        |        BandAid        |         BankNote        |
|        BarChart        |        BarCode        |         BathTub         |
|         Battery        |    BatteryCharging    |     BatteryDisabled     |
|          Bell          |      BellDisabled     |           Bike          |
|       Binoculars       |          Bird         |      BlankDocument      |
|        Bluetooth       |          Boat         |           Bold          |
|          Bolt          |      BoltDisabled     |           Book          |
|        Bookmark        |          Box          |          Brush          |
|         Bubble         |          Bug          |         Building        |
|      BulletPoints      |        BullsEye       |      BullsEyeMissed     |
|          Buoy          |       Calculator      |         Calendar        |
|         Camera         |          Car          |           Cart          |
|           Cd           |         Center        |          Check          |
|       CheckCircle      |       CheckList       |       CheckRosette      |
|        Checkmark       |       ChessPiece      |       ChevronDown       |
|    ChevronDownSmall    |      ChevronLeft      |     ChevronLeftSmall    |
|      ChevronRight      |   ChevronRightSmall   |        ChevronUp        |
|      ChevronUpDown     |     ChevronUpSmall    |          Circle         |
|     CircleDisabled     |     CircleEllipsis    |       CircleFilled      |
|     CircleProgress     |   CircleProgress100   |     CircleProgress25    |
|    CircleProgress50    |    CircleProgress75   |     ClearFormatting     |
|        Clipboard       |         Clock         |          Cloud          |
|     CloudLightning     |       CloudRain       |        CloudSnow        |
|        CloudSun        |          Code         |        CodeBlock        |
|           Cog          |          Coin         |          Coins          |
|      CommandSymbol     |        Compass        |       ComputerChip      |
|        Contrast        |     CopyClipboard     |        CreditCard       |
|       CricketBall      |          Crop         |          Crown          |
|         Crypto         |     DeleteDocument    |         Desktop         |
|         Devices        |          Dna          |         Document        |
|           Dot          |        Download       |         Droplets        |
|        Duplicate       |       EditShape       |          Eject          |
|        Ellipsis        |    EllipsisVertical   |          Emoji          |
|        EmojiSad        |        Envelope       |          Eraser         |
|     ExclamationMark    |    Exclamationmark    |     Exclamationmark2    |
|    Exclamationmark3    |          Eye          |       EyeDisabled       |
|       EyeDropper       |         Female        |        FilmStrip        |
|         Filter         |         Finder        |       Fingerprint       |
|          Flag          |         Folder        |        Footprints       |
|         Forward        |     ForwardFilled     |       FountainTip       |
|       FullSignal       |     GameController    |          Gauge          |
|          Gear          |         Geopin        |           Germ          |
|          Gift          |        Glasses        |          Globe          |
|          Goal          |         Hammer        |        HardDrive        |
|         Hashtag        |        Heading        |        Headphones       |
|          Heart         |     HeartDisabled     |        Heartbeat        |
|        Highlight       |       Hourglass       |          House          |
|        Humidity        |         Image         |        Important        |
|          Info          |        Italics        |           Key           |
|        Keyboard        |         Layers        |       Leaderboard       |
|          Leaf          |       LevelMeter      |        LightBulb        |
|      LightBulbOff      |       LineChart       |           Link          |
|          List          |       Livestream      |    LivestreamDisabled   |
|          Lock          |      LockDisabled     |       LockUnlocked      |
|         Logout         |         Lorry         |        Lowercase        |
|     MagnifyingGlass    |          Male         |           Map           |
|          Mask          |        Maximize       |      MedicalSupport     |
|        Megaphone       |       MemoryChip      |       MemoryStick       |
|         Message        |       Microphone      |    MicrophoneDisabled   |
|        Minimize        |         Minus         |       MinusCircle       |
|    MinusCircleFilled   |         Mobile        |         Monitor         |
|          Moon          |        MoonDown       |          MoonUp         |
|        Moonrise        |        Mountain       |          Mouse          |
|          Move          |          Mug          |         MugSteam        |
|        Multiply        |         Music         |         Network         |
|       NewDocument      |       NewFolder       |        Paperclip        |
|        Paragraph       |         Patch         |          Pause          |
|       PauseFilled      |         Pencil        |          Person         |
|      PersonCircle      |      PersonLines      |          Phone          |
|      PhoneRinging      |        PieChart       |           Pill          |
|           Pin          |      PinDisabled      |           Play          |
|       PlayFilled       |          Plug         |           Plus          |
|       PlusCircle       |    PlusCircleFilled   | PlusMinusDivideMultiply |
|       PlusSquare       |   PlusTopRightSquare  |          Power          |
|          Print         |      QuestionMark     |    QuestionMarkCircle   |
|        Quicklink       |     QuotationMarks    |        QuoteBlock       |
|         Racket         |        Raindrop       |      RaycastLogoNeg     |
|     RaycastLogoPos     |        Receipt        |           Redo          |
|      RemovePerson      |         Repeat        |         Replace         |
|       ReplaceOne       |         Reply         |          Rewind         |
|      RewindFilled      |         Rocket        |         Rosette         |
|   RotateAntiClockwise  |    RotateClockwise    |           Rss           |
|          Ruler         |      SaveDocument     |          Shield         |
|     ShortParagraph     |        Shuffle        |         Sidebar         |
|         Signal0        |        Signal1        |         Signal2         |
|         Signal3        |        Snippets       |        Snowflake        |
|       SoccerBall       |        Speaker        |       SpeakerDown       |
|       SpeakerHigh      |       SpeakerLow      |        SpeakerOff       |
|        SpeakerOn       |       SpeakerUp       |       SpeechBubble      |
|   SpeechBubbleActive   | SpeechBubbleImportant |      SquareEllipsis     |
|      StackedBars1      |      StackedBars2     |       StackedBars3      |
|      StackedBars4      |          Star         |        StarCircle       |
|      StarDisabled      |         Stars         |           Stop          |
|       StopFilled       |       Stopwatch       |          Store          |
|      StrikeThrough     |          Sun          |         Sunrise         |
|         Swatch         |         Switch        |         Syringe         |
|          Tack          |      TackDisabled     |           Tag           |
|       Temperature      |       TennisBall      |         Terminal        |
|          Text          |       TextCursor      |        TextInput        |
|      TextSelection     |       ThumbsDown      |     ThumbsDownFilled    |
|        ThumbsUp        |     ThumbsUpFilled    |          Ticket         |
|          Torch         |         Train         |          Trash          |
|          Tray          |          Tree         |          Trophy         |
|        TwoPeople       |        Umbrella       |        Underline        |
|          Undo          |         Upload        |        Uppercase        |
|          Video         |     VideoDisabled     |          Wallet         |
|          Wand          |        Warning        |         Waveform        |
|         Weights        |          Wifi         |       WifiDisabled      |
|          Wind          |         Window        |         Windsock        |
|    WrenchScrewdriver   |       WristWatch      |       XMarkCircle       |
|    XMarkCircleFilled   |  XMarkCircleHalfDash  |   XMarkTopRightSquare   |
|          Xmark         |                                                                                                                                                                                     |                                                                                                                                                                                       |

### Image.Mask

Available masks that can be used to change the shape of an image.

Can be handy to shape avatars or other items in a list.

#### Example

```typescript
import { Image, List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item
        title="Icon"
        icon={{
          source: "https://raycast.com/uploads/avatar.png",
          mask: Image.Mask.Circle,
        }}
      />
    </List>
  );
}
```

#### Enumeration members

| Name             | Value              |
| ---------------- | ------------------ |
| Circle           | "circle"           |
| RoundedRectangle | "roundedRectangle" |

## Types

### Image

Display different types of images, including network images or bundled assets.

Apply image transforms to the source, such as a `mask` or a `tintColor`.

> [!INFO]
> Tip: Suffix your local assets with `@dark` to automatically provide a dark theme option, eg: `icon.png` and `icon@dark.png`.

#### Example

```typescript
// Built-in icon
const icon = Icon.Eye;

// Built-in icon with tint color
const tintedIcon = { source: Icon.Bubble, tintColor: Color.Red };

// Bundled asset with circular mask
const avatar = { source: "avatar.png", mask: Image.Mask.Circle };

// Implicit theme-aware icon
// with 'icon.png' and 'icon@dark.png' in the `assets` folder
const icon = "icon.png";

// Explicit theme-aware icon
const icon = { source: { light: "https://example.com/icon-light.png", dark: "https://example.com/icon-dark.png" } };
```

#### Properties

| Property                                 | Description                                                            | Type                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| source\* | The Image.Source of the image.                                         | [`Image.Source`](#image.source)                                                                                             |
| fallback                                 | Image.Fallback image, in case `source` can't be loaded.                | [`Image.Fallback`](#image.fallback)                                                                                         |
| mask                                     | A Image.Mask to apply to the image.                                    | [`Image.Mask`](#image.mask)                                                                                                 |
| tintColor                                | A Color.ColorLike to tint all the non-transparent pixels of the image. | [`Color.ColorLike`](https://developers.raycast.com/api-reference/user-interface/pages/-MiwANRbUk391XIQ6FMp#color.colorlike) |

### FileIcon

An icon as it's used in the Finder.

#### Example

```typescript
import { List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="File icon" icon={{ fileIcon: __filename }} />
    </List>
  );
}
```

#### Properties

| Property                                   | Description                                        | Type     |
| ------------------------------------------ | -------------------------------------------------- | -------- |
| fileIcon\* | The path to a file or folder to get its icon from. | `string` |

### Image.ImageLike

```typescript
ImageLike: URL | Asset | Icon | FileIcon | Image;
```

Union type for the supported image types.

#### Example

```typescript
import { Icon, Image, List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="URL" icon="https://raycast.com/uploads/avatar.png" />
      <List.Item title="Asset" icon="avatar.png" />
      <List.Item title="Icon" icon={Icon.Circle} />
      <List.Item title="FileIcon" icon={{ fileIcon: __filename }} />
      <List.Item
        title="Image"
        icon={{
          source: "https://raycast.com/uploads/avatar.png",
          mask: Image.Mask.Circle,
        }}
      />
    </List>
  );
}
```

### Image.Source

```typescript
Image.Source: URL | Asset | Icon | { light: URL | Asset; dark: URL | Asset }
```

The source of an [Image](#image). Can be either a remote URL, a local file resource, a built-in [Icon](#icon) or a single emoji.

For consistency, it's best to use the built-in [Icon](#icon) in lists, the Action Panel, and other places. If a specific icon isn't built-in, you can reference custom ones from the `assets` folder of the extension by file name, e.g. `my-icon.png`. Alternatively, you can reference an absolute HTTPS URL that points to an image or use an emoji. You can also specify different remote or local assets for light and dark theme.

#### Example

```typescript
import { Icon, List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="URL" icon={{ source: "https://raycast.com/uploads/avatar.png" }} />
      <List.Item title="Asset" icon={{ source: "avatar.png" }} />
      <List.Item title="Icon" icon={{ source: Icon.Circle }} />
      <List.Item
        title="Theme"
        icon={{
          source: {
            light: "https://raycast.com/uploads/avatar.png",
            dark: "https://raycast.com/uploads/avatar.png",
          },
        }}
      />
    </List>
  );
}
```

### Image.Fallback

```typescript
Image.Fallback: Asset | Icon | { light: Asset; dark: Asset }
```

A fallback [Image](#image) that will be displayed in case the source image cannot be loaded. Can be either a local file resource, a built-in [Icon](#icon), a single emoji, or a theme-aware asset. Any specified `mask` or `tintColor` will also apply to the fallback image.

#### Example

```typescript
import { List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item
        title="URL Source With Asset Fallback"
        icon={{
          source: "https://raycast.com/uploads/avatar.png",
          fallback: "default-avatar.png",
        }}
      />
    </List>
  );
}
```

### Image.URL

Image is a string representing a URL.

#### Example

```typescript
import { List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="URL" icon={{ source: "https://raycast.com/uploads/avatar.png" }} />
    </List>
  );
}
```

### Image.Asset

Image is a string representing an asset from the `assets/` folder

#### Example

```typescript
import { List } from "@raycast/api";

export default function Command() {
  return (
    <List>
      <List.Item title="Asset" icon={{ source: "avatar.png" }} />
    </List>
  );
}
```
