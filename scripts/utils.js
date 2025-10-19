const slugify = require('slugify').default

function toSlug(name) {
    return slugify(name, {
        lower: true,
        strict: true,
    })
}

module.exports = {
    toSlug,
}
