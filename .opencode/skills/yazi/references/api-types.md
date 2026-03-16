# Plugin API — Types

Core types available in Yazi plugins. All types are userdata backed by Rust.

## Table of Contents

- [Url](#url)
- [Path](#path)
- [Cha](#cha)
- [File](#file)
- [Icon](#icon)
- [Error](#error)
- [Window](#window)

## Url

Create: `Url("/path/to/file")` or `Url("sftp://server//path/to/file")`

Cloning: `Url(existing_url)` — creates a new Url (important for ownership transfer)

| Property | Type | Description |
|----------|------|-------------|
| `path` | `Path` | Path portion of the URL |
| `name` | `string?` | Filename |
| `stem` | `string?` | Filename without extension |
| `ext` | `string?` | File extension |
| `parent` | `Url?` | Parent directory URL |
| `domain` | `string?` | Domain (for remote URLs like SFTP) |
| `is_regular` | `boolean` | Regular file (not search/archive) |
| `is_search` | `boolean` | From search result |
| `is_archive` | `boolean` | From archive |
| `is_absolute` | `boolean` | Absolute path |
| `has_root` | `boolean` | Has root component |

| Method | Signature | Description |
|--------|-----------|-------------|
| `join` | `(self, other: Url\|string) -> Url` | Join paths |
| `starts_with` | `(self, base: Url\|string) -> boolean` | Prefix check |
| `ends_with` | `(self, base: Url\|string) -> boolean` | Suffix check |
| `strip_prefix` | `(self, base: Url\|string) -> Path` | Remove prefix |

Metamethods: `__eq`, `__tostring`, `__concat(self, string) -> Url`

## Path

Path portion of a URL. For `sftp://server//path/to/file`, path is `/path/to/file`.

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string?` | Filename |
| `stem` | `string?` | Filename without extension |
| `parent` | `Path?` | Parent path |
| `is_absolute` | `boolean` | Absolute path |
| `has_root` | `boolean` | Has root |

| Method | Signature | Description |
|--------|-----------|-------------|
| `join` | `(self, other: Path\|string) -> Path` | Join paths |
| `starts_with` | `(self, base: Path\|string) -> boolean` | Prefix check |
| `ends_with` | `(self, base: Path\|string) -> boolean` | Suffix check |
| `strip_prefix` | `(self, base: Path\|string) -> Path` | Remove prefix |

Metamethods: `__eq`, `__tostring`, `__concat(self, string) -> Path`

## Cha

File characteristics (metadata).

| Property | Type | Description |
|----------|------|-------------|
| `is_dir` | `boolean` | Directory |
| `is_hidden` | `boolean` | Hidden file |
| `is_link` | `boolean` | Symbolic link |
| `is_orphan` | `boolean` | Bad symlink (target missing) |
| `is_dummy` | `boolean` | Failed to load metadata |
| `is_block` | `boolean` | Block device |
| `is_char` | `boolean` | Character device |
| `is_fifo` | `boolean` | FIFO pipe |
| `is_sock` | `boolean` | Socket |
| `is_exec` | `boolean` | Executable |
| `is_sticky` | `boolean` | Sticky bit set |
| `len` | `integer` | File size in bytes |
| `atime` | `integer?` | Access time (Unix timestamp) |
| `btime` | `integer?` | Birth time |
| `mtime` | `integer?` | Modified time |
| `uid` | `integer?` | User ID (Unix only) |
| `gid` | `integer?` | Group ID (Unix only) |
| `nlink` | `integer?` | Hard link count (Unix only) |

| Method | Signature | Description |
|--------|-----------|-------------|
| `perm` | `(self) -> string?` | Permission string e.g. `drwxr-xr-x` (Unix only) |

## File

A bare file without context. See `api-context.md` for `fs::File` (context-aware).

| Property | Type | Description |
|----------|------|-------------|
| `url` | `Url` | File URL |
| `cha` | `Cha` | File characteristics |
| `link_to` | `Path?` | Symlink target |
| `name` | `string` | Filename |

## Icon

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Icon character |
| `style` | `Style` | Icon style |

## Error

| Property | Type | Description |
|----------|------|-------------|
| `code` | `integer` | Raw error code |

Metamethods: `__tostring`, `__concat(self, string) -> Error`

## Window

Terminal window dimensions.

| Property | Type | Description |
|----------|------|-------------|
| `rows` | `integer` | Number of rows |
| `cols` | `integer` | Number of columns |
| `width` | `integer` | Width in pixels |
| `height` | `integer` | Height in pixels |
