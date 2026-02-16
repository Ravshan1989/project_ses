const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const BACKEND_ROOT = path.resolve(__dirname, '..');
const MOBILE_ROOT = path.resolve(BACKEND_ROOT, '..', 'mobile');
const UPDATES_DIR = path.resolve(BACKEND_ROOT, 'public', 'updates');
const MOBILE_DIST = path.join(MOBILE_ROOT, 'dist');

console.log('🚀 Starting Update Publication...');

// 1. Build Mobile Bundle
console.log('📦 Building mobile bundle...');
try {
    // Escape arguments for Windows cmd
    execSync('npx expo export --platform android', { cwd: MOBILE_ROOT, stdio: 'inherit', shell: true });
} catch (error) {
    console.error('❌ Build failed!');
    process.exit(1);
}

// 2. Clean and Create Updates Directory
console.log('🧹 Cleaning updates directory...');
if (fs.existsSync(UPDATES_DIR)) {
    fs.rmSync(UPDATES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(UPDATES_DIR, { recursive: true });

// 3. Copy dist contents to updates
console.log('📂 Copying files...');
if (fs.existsSync(MOBILE_DIST)) {
    // Recursive copy for Node 16+
    fs.cpSync(MOBILE_DIST, UPDATES_DIR, { recursive: true });
    console.log(`✅ Updates published to ${UPDATES_DIR}`);
    console.log('⚠️  NOTE: You must redeploy the backend for these updates to be live.');
} else {
    console.error('❌ dist folder not found!');
    process.exit(1);
}
