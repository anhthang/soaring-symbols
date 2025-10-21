# Soaring Symbols: API Reference

This document details the functions exported by the `soaring-symbols` package and the data structures they return.

## Functions

### `listAirlines()`

Returns an array of all airline objects.

- **Returns:** `Airline[]`

### `getAirline(identifier)`

Retrieves a single airline object. The `identifier` can be the airline's IATA code, ICAO code, full name, or URL-friendly slug.

- **Argument:** `identifier` (string)
- **Returns:** `Airline` (see [Airline Data Model](#airline-data-model)) or `undefined` if not found.

```js
// All of these will find Vietnam Airlines
const vna = getAirline('VN')
const vna = getAirline('HVN')
const vna = getAirline('Vietnam Airlines')
const vna = getAirline('vietnam-airlines')
```

### `getAssets(identifier)`

Retrieves an object containing relative paths and metadata for an airline's visual assets. Uses the same `identifier` lookup as `getAirline()`.

- **Argument:** `identifier` (string)
- **Returns:** `AssetPaths` (see [Asset Data Model](#asset-data-model)) or `undefined` if not found.

```js
const assets = getAssets('VN')
```

## Data Models

### Airline Data Model

The main object returned by `getAirline()` and found in the array from `listAirlines()`.

```json
{
    "name": "Vietnam Airlines",
    "iata": "VN",
    "icao": "HVN",
    "country": "VN",
    "flag_carrier": true,
    "website": "https://www.vietnamairlines.com",
    "alliance": "SkyTeam",
    "slug": "vietnam-airlines",
    "branding": {
        "primary_color": "#d99e09",
        "tagline": "Reach Further",
        "guidelines": "https://www.vietnamairlines.com/~/media/FilesDownload/AboutUs/Corporate-Identity/GSM-2017-Web1.pdf"
    }
}
```

### Asset Data Model

The object returned by `getAssets()`. Each key represents an asset type (e.g., `icon`, `logo`).

If a monochrome variant (`-mono.svg`) does not exist for an asset, its `monochrome` property will be `null`.

```json
{
    "icon": {
        "color": "assets/vietnam-airlines/icon.svg",
        "monochrome": null,
        "color_model": "single",
        "colors": [
            "#d99e09"
        ]
    },
    "logo": {
        "color": "assets/vietnam-airlines/logo.svg",
        "monochrome": "assets/vietnam-airlines/logo-mono.svg",
        "color_model": "multi",
        "colors": [
            "#d99e09",
            "#005e80"
        ]
    }
}
```

### Asset Metadata Fields

Each asset entry in `AssetPaths` contains these fields:

| Field         | Type                  | Description                                                                     |
| ------------- | --------------------- | ------------------------------------------------------------------------------- |
| `color`       | `string`              | Relative path to the full-color SVG.                                            |
| `monochrome`  | `string \| null`      | Relative path to the monochrome (`-mono.svg`) variant, if available.            |
| `color_model` | `"single" \| "multi"` | `"single"` if the SVG uses one color; `"multi"` if it contains multiple colors. |
| `colors`      | `string[]`            | Array of hex colors extracted from the SVG.                                     |

**Notes:**

- `color_model` is determined from the color version of the SVG.
- If `color_model` is `"single"`, the SVG can be treated as monochrome even without a `-mono.svg` variant (e.g., use `fill: currentColor`).
- The assets directory typically follows this structure:

  ```plaintext
  assets/<slug>/
  ├── icon.svg
  ├── logo.svg
  └── logo-mono.svg   # optional
  ```
