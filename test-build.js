// Try to build with more verbose error tracking
const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.join(__dirname));

try {
    console.log('Building with Node.js debug mode...');
    const output = execSync('node --trace-warnings node_modules/.bin/next build', {
        encoding: 'utf8',
        stdio: 'pipe',
        env: {
            ...process.env,
            NODE_OPTIONS: '--trace-deprecation',
            NEXT_TELEMETRY_DISABLED: '1'
        }
    });
    console.log(output);
} catch (error) {
    console.log('Build failed with error:');
    console.error(error.stdout || error.message);

    // Try to get more info
    if (error.status) {
        console.log('\nExit code:', error.status);
    }
}