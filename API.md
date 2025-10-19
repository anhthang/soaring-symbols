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
````

### `getAssets(identifier)`

Retrieves an object with relative paths to an airline's assets. Uses the same `identifier` lookup as `getAirline`.

- **Argument:** `identifier` (string)
- **Returns:** `AssetPaths` (see [Asset Path Model](#asset-path-model)) or `undefined` if not found.

```js
const assets = getAssets('VN')
/*
{
    "icon": {
        "color": "assets/vietnam-airlines/icon.svg",
        "monochrome": null
    },
    "logo": {
        "color": "assets/vietnam-airlines/logo.svg",
        "monochrome": "assets/vietnam-airlines/logo-mono.svg"
    }
}
*/
```

## Data Models

### Airline Data Model

The main object returned by `getAirline()` and found in the `listAirlines()` array.

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
        "guidelines": "https://www.vietnamairlines.com/~/media/FilesDownload/AboutUs/Corporate-Identity/GSM-2017-Web1.pdf",
        "assets": {
            "icon": {
                "has_mono_file": false,
                "color_model": "single",
                "colors": [
                    "#d99e09"
                ]
            },
            "logo": {
                "has_mono_file": true,
                "color_model": "multi",
                "colors": [
                    "#d99e09",
                    "#005e80"
                ]
            }
        }
    }
}
```

### Asset Path Model

The object returned by `getAssets()`. If a monochrome variant (`-mono.svg`) does not exist for an asset, its value will be `null`.

```json
{
    "icon": {
        "color": "assets/vietnam-airlines/icon.svg",
        "monochrome": null
    },
    "logo": {
        "color": "assets/vietnam-airlines/logo.svg",
        "monochrome": "assets/vietnam-airlines/logo-mono.svg"
    }
}
```

### Branding & Asset Details

The `branding.assets` object provides metadata about the SVG files, which you can use to determine how to display them.

- `has_mono_file`: (`boolean`) True if a separate `-mono.svg` file exists (e.g., `icon-mono.svg`).
- `color_model`: (`"single" | "multi"`) `"single"` if only one color was found in the color SVG; `"multi"` if multiple colors were found.
- `colors`: (`string[]`) An array of hex colors extracted from the color SVG.

**Note:** If `has_mono_file` is `false` but `color_model` is `"single"`, the color SVG uses a single solid color. This means it can be safely treated as a monochrome asset (e.g., by setting the CSS `fill` property).
