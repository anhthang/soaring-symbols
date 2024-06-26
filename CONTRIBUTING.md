# Soaring Symbols: Contribution Guidelines

This document outlines the guidelines for contributing logos and icons to the Soaring Symbols project, a curated collection of airline logos in SVG format.

> [!IMPORTANT]
> This project, "Soaring Symbols", provides a collection of airline logos/icons in SVG format for informational and reference purposes only. While every effort has been made to ensure the accuracy of the logos and information presented, we do not claim ownership of any trademarks or copyrighted materials. The logos remain the intellectual property of their respective airlines.

## Contribution Process

We welcome contributions from the community to enrich the Soaring Symbols collection. Here's how you can get involved:

### 1. File Naming

* **Color Logos/Icons:** Use the airline's IATA code in lowercase for the filename (e.g., `qr.svg` for Qatar Airways).
* **Monochrome Logos/Icons:** Append "_mono" to the filename after the IATA code for monochrome versions (e.g., `qr_mono.svg`).

### 2. SVG Specifications

- **SVG Optimization**: All logos and icons will be optimized using SVGO tools to ensure efficient file size and performance.

    - Command Line: [SVGO](https://github.com/svg/svgo)
    - Online Tool: [SVGOMG](https://svgomg.net)

- **ViewBox Dimensions**: Logos will utilize a viewBox of `0 0 64 64`, while icons/symbols will use `0 0 24 24`.

- **Accessibility Attributes**: Logos and icons will be annotated with essential attributes to enhance accessibility for users with assistive technologies

    - `role="img"`: This attribute identifies the element as an image to screen readers and other assistive tools.
    - `viewBox="0 0 64 64"` or `viewBox="0 0 24 24"`: This attribute defines the visible area of the SVG content and ensures consistent scaling across different platforms as specified earlier.
    - `xmlns="http://www.w3.org/2000/svg"`: This attribute specifies the SVG namespace, ensuring proper interpretation by browsers.
    - `<title>Airline Name</title>`: A title element containing the brand name will be included to provide a text description of the logo or icon for screen readers and other assistive technologies.

> [!WARNING]
> **Note on ViewBox and Multi-Colored SVGs:**
>
> * Some logos and icons may require multiple SVG paths to accurately represent the original colors or adhere to brand guidelines.
> * In these cases, verifying the existing viewBox dimensions might be challenging. 
>
> **Therefore:**
>
> * We will assume the viewBox is correct after the SVG optimization process using SVGO tools. 
> * **However, it's highly recommended to double-check the visual appearance of the logo/icon after optimization to ensure color accuracy and alignment within the viewBox.**

### 3. JSON Data Updates

When adding or updating logos/icons, update the `airlines.json` file with corresponding metadata for each airline.

Here's a description of the required fields:

| Field Name | Required | Description |
|---|:---:|---|
| name | Yes | Full name of the airline, sorted alphabetically within the `airlines.json` file. |
| iata | Yes | Airline's two-character IATA code. |
| icao | Yes | Airline's three-character ICAO code. |
| country | Yes | Country of origin for the airline. You can reference [ISO country codes](https://countrycode.org) for a comprehensive list. |
| flag_carrier | No | Boolean value indicating if the airline is a flag carrier (true) or not (false). |
| guidelines | No | Link to the airline's brand guidelines or press/media kit. |
| website | Yes | Official website of the airline. |
| alliance | No | Name of the airline alliance the airline belongs to (e.g., "oneworld", "SkyTeam", "Star Alliance"). |

> [!NOTE]
> Ensure the airline names in the `airlines.json` file are sorted alphabetically by their full names. This facilitates easier navigation and data management.

### 4. Pull Requests

* Once you have prepared the SVG logo(s) and updated the `airlines.json` file, submit a pull request to the project repository.
* Please ensure your pull request includes a clear description of the changes you've made.

### Example JSON Data:

Here's an example of JSON data for a single airline:

```json
{
    "name": "Qatar Airways",
    "iata": "QR",
    "icao": "QTR",
    "flag_carrier": true,
    "country": "QA",
    "guidelines": "https://www.qatarairways.com/content/dam/tradepartners/pdf-files/Brand-Elements_Section-1.pdf",
    "website": "https://www.qatarairways.com",
    "alliance": "oneworld"
}
```
