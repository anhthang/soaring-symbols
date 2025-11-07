import { promises as fs } from 'fs'
import path from 'path'

const inputFile = './index.js'

// Helper to recursively copy a directory
async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true })
    const entries = await fs.readdir(src, { withFileTypes: true })

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath)
        } else {
            await fs.copyFile(srcPath, destPath)
        }
    }
}

// Copy required files and directories
async function copyFiles() {
    const distDir = './dist'
    await fs.mkdir(distDir, { recursive: true })

    // Copy required files and directories
    const filesToCopy = [
        { src: './airlines.json', dest: 'airlines.json' },
        { src: './index.d.ts', dest: 'index.d.ts' },
    ]

    const dirsToCopy = [
        { src: './assets', dest: 'assets' },
        { src: './utils', dest: 'utils' },
    ]

    // Copy individual files
    for (const file of filesToCopy) {
        await fs.copyFile(file.src, path.join(distDir, file.dest))
    }

    // Copy directories
    for (const dir of dirsToCopy) {
        await copyDir(dir.src, path.join(distDir, dir.dest))
    }
}

// ESM version (as-is, just copy to dist)
async function buildESM() {
    const content = await fs.readFile(inputFile, 'utf-8')
    await fs.mkdir('./dist', { recursive: true })
    await fs.writeFile('./dist/index.js', content)
}

// CJS version
async function buildCJS() {
    const content = await fs.readFile(inputFile, 'utf-8')
    // Convert ESM to CJS
    const cjsContent = content
        .replace(
            'import airlines from \'./airlines.json\' assert { type: \'json\' }',
            'const airlines = require(\'./airlines.json\')'
        )
        .replace(
            'import { toSlug, getAirlineAssets } from \'./utils/index.js\'',
            'const { toSlug, getAirlineAssets } = require(\'./utils\')'
        )
        .replace(/export\s*{[^}]+}/, 'module.exports = { listAirlines, getAirline, getAssets }')
        .replace(/export\s*default\s*{[^}]+}/, '')

    await fs.writeFile('./dist/index.cjs', cjsContent)
}

// Run all builds
async function build() {
    await copyFiles() // First copy all required files
    await Promise.all([buildESM(), buildCJS()])
}

build().catch((err) => {
    console.error('Build failed:', err)
    process.exit(1)
})
