import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Use require for airlines.json import issues
const {
    listAirlines,
    getAirline,
    getAssets,
    getAssetContent,
} = require('../dist/index.cjs')
const assert = require('assert')

async function run() {
    // Basic sanity checks
    const airlines = listAirlines()
    assert(Array.isArray(airlines), 'listAirlines should return an array')
    assert(airlines.length > 0, 'airlines should not be empty')

    // Pick the first airline and verify lookups
    const sample = airlines[0]
    assert(
        sample && (sample.name || sample.slug),
        'sample airline has a name or slug'
    )

    const bySlug = getAirline(sample.slug)
    assert(
        bySlug && bySlug.name === sample.name,
        'getAirline should find by slug'
    )

    const byName = getAirline(sample.name)
    assert(
        byName && byName.name === sample.name,
        'getAirline should find by name'
    )

    // getAssets may return null (if no assets) or an object
    const assets = getAssets(sample.slug)
    assert(
        assets === null || typeof assets === 'object',
        'getAssets returns null or an object'
    )

    // Test getAssetContent if assets are available
    if (assets) {
        const content = getAssetContent(sample.slug)
        assert(
            content !== null,
            'getAssetContent should return content when assets exist'
        )

        // Verify that SVG content is returned for at least one variant
        const hasContent = Object.values(content).some(
            (variant) =>
                variant.color?.includes('<svg') ||
                variant.monochrome?.includes('<svg')
        )
        assert(hasContent, 'at least one variant should have SVG content')
    }

    console.log('All tests passed')
}

run().catch((err) => {
    console.error('Test failed:')
    console.error(err && err.stack ? err.stack : err)
    process.exit(1)
})
