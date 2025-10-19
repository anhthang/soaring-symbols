# Soaring Symbols

This project aims to create a meticulously curated collection of airline logos and icons entirely in SVG format, serving as a valuable resource for travelers, aviation enthusiasts, and designers.

> [!IMPORTANT]
> "Soaring Symbols" provides airline logos/icons in SVG for informational and reference purposes only. We do not claim ownership of any trademarks or copyrighted materials. The logos remain the intellectual property of their respective airlines.

## Project Scope

The initial phase will focus on building a core collection of high-quality SVG logos from major airlines. The collection will be expanded progressively to include regional and potentially historical airlines.

The inclusion of monochrome versions will depend on the airline's brand guidelines and the feasibility of converting their original logos to a simple, one-color format.

### Installation

```bash
# Using npm
npm install soaring-symbols

# Using yarn
yarn add soaring-symbols

# Using pnpm
pnpm add soaring-symbols

# Using bun
bun add soaring-symbols
```

Or use the repo directly in your project (checkout the repo and import locally).

### What You'll Find

- `assets/`: airline-specific folders (slugified names) containing SVG files for `icon.svg`, `icon-mono.svg`, `logo.svg`, `logo-mono.svg`.
- `airlines.json`: metadata for each airline, including `branding` and `branding.assets` (colors, mono availability).
- `generate.js`: script that scans `assets/`, extracts colors from SVGs, and writes structured data into `airlines.json` + `AIRLINES.md`.

### Assets Model

Each airline has a folder in `assets/` named after a slugified airline name, for example `assets/vietnam-airways/`.

Files expected in the airline folder:

- `icon.svg` — color icon (default)
- `icon-mono.svg` — monochrome icon (optional)
- `logo.svg` — color logo (default)
- `logo-mono.svg` — monochrome logo (optional)

The `generate.js` script detects these files and populates `airlines.json` with a `branding` object similar to:

```json
{
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

**Notes:**

- `has_mono_file`: true when a corresponding `-mono.svg` variant exists (for example `icon-mono.svg`).
- `color_model`: `single` when exactly one color is found in the color SVG; `multi` when multiple colors are present.
- `colors`: array of hex colors extracted from the SVG.

Additional behavior:

- If `has_mono_file` is `false` but `color_model` is `"single"`, the color SVG uses a single solid color and can be treated as a monochrome asset (it can be filled or used anywhere a mono version is expected).

### Usage

```js
import { listAirlines, getAirline, getAssets } from 'soaring-symbols'

// List all airline metadata
const all = listAirlines()

// Lookup by IATA code
const vna = getAirline('VN')
const vna = getAirline('Vietnam Airlines')
const vna = getAirline('vietnam-airlines')

/* output example
{
    "name": "Vietnam Airlines",
    "iata": "VN",
    "icao": "HVN",
    "country": "VN",
    "flag_carrier": true,
    "website": "https://www.vietnamairlines.com",
    "alliance": "SkyTeam",
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
    },
    "slug": "vietnam-airlines"
}
*/

// Get asset paths for an airline
const assets = getAssets('VN')

/* output example
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

If you use the package in a browser or bundler, import the functions from the package entry — check the package's exported API for exact names.

## Contributing

Contributions are welcome!

Whether through adding new logos, improving existing ones, or suggesting features to enhance usability. Please refer to our [Contribution Guidelines](https://github.com/anhthang/soaring-symbols/blob/main/CONTRIBUTING.md) for detailed instructions on how to contribute effectively.

## License

This repository is licensed under the MIT License — see [LICENSE](./LICENSE) for details.
