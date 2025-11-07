# Soaring Symbols

This project aims to create a meticulously curated collection of airline logos and icons entirely in SVG format, serving as a valuable resource for travelers, aviation enthusiasts, and designers.

> [!IMPORTANT]
> "Soaring Symbols" provides airline logos/icons in SVG for informational and reference purposes only. We do not claim ownership of any trademarks or copyrighted materials. The logos remain the intellectual property of their respective airlines.

## Project Scope

The initial phase will focus on building a core collection of high-quality SVG logos from major airlines. The collection will be expanded progressively to include regional and potentially historical airlines.

The inclusion of monochrome versions will depend on the airline's brand guidelines and the feasibility of converting their original logos to a simple, one-color format.

## TODO / Roadmap

- [ ] Nuxt Homepage
  - [ ] Launch a Nuxt-powered homepage showcasing the catalog, search, and usage examples.
  - [ ] Include live previews, install instructions, and API docs (pulling from `API.md`).

## Installation

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

## Ecosystem

| Tool / Integration | Author |
| :-- | :-- |
| [npm Package](https://www.npmjs.com/package/soaring-symbols) <img src="https://cdn.simpleicons.org/npm/000/CB3837" alt="npm" align=left width=24 height=24 /> | [anhthang]|
| [Raycast Extension](https://www.raycast.com/anhthang/soaring-symbols) <img src="https://cdn.simpleicons.org/raycast/000/FF6363" alt="Raycast" align=left width=24 height=24 /> | [anhthang]|

## Usage

```js
import { listAirlines, getAirline, getAssets, getAssetContent } from 'soaring-symbols'

// Get a list of all airlines
const all = listAirlines()

// Get a specific airline's data
const vna = getAirline('VN') 

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
        "tagline": "Reach Further",
        "guidelines": "https://www.vietnamairlines.com/~/media/FilesDownload/AboutUs/Corporate-Identity/GSM-2017-Web1.pdf"
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
*/

// Get SVG content for an airline
const content = getAssetContent('VN')

/* output example - SVG content is truncated for brevity
{
    "icon": {
        "color": "<svg>...</svg>",
        "monochrome": null,
        "color_model": "single",
        "colors": ["#d99e09"]
    },
    "logo": {
        "color": "<svg>...</svg>",
        "monochrome": "<svg>...</svg>",
        "color_model": "multi",
        "colors": ["#d99e09", "#005e80"]
    }
}
*/
```

For a full list of functions and the data structures they return, please see the [API Reference](./API.md).

## Contributing

Contributions are welcome!

Whether through adding new logos, improving existing ones, or suggesting features to enhance usability. Please refer to our [Contribution Guidelines](https://github.com/anhthang/soaring-symbols/blob/main/CONTRIBUTING.md) for detailed instructions on how to contribute effectively.

## License

This repository is licensed under the MIT License — see [LICENSE](./LICENSE) for details.

[anhthang]: https://github.com/anhthang
