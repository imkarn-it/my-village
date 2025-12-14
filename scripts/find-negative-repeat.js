const fs = require('fs');
const path = require('path');

function findNegativePattern(dir) {
    const suspiciousPatterns = [];

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
                traverse(fullPath);
            } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const lines = content.split('\n');

                    lines.forEach((line, index) => {
                        // Look for patterns that might result in negative numbers
                        if ((line.includes('.repeat(') || line.includes('Array(') || line.includes('new Array(')) &&
                            (line.includes('-') || line.includes('length') || line.includes('count') || line.includes('size'))) {
                            suspiciousPatterns.push({
                                file: fullPath.replace(process.cwd(), ''),
                                line: index + 1,
                                content: line.trim()
                            });
                        }

                        // Look for negative array indices or negative lengths
                        if ((line.includes('[ -') || line.includes('[-') || line.includes('.length') && line.includes('-'))) {
                            suspiciousPatterns.push({
                                file: fullPath.replace(process.cwd(), ''),
                                line: index + 1,
                                content: line.trim()
                            });
                        }
                    });
                } catch (e) {
                    console.error(`Error reading ${fullPath}:`, e.message);
                }
            }
        }
    }

    traverse(dir);
    return suspiciousPatterns;
}

console.log('Searching for patterns that might cause String.repeat(-10)...\n');
const patterns = findNegativePattern(path.join(__dirname, '..'));

if (patterns.length > 0) {
    console.log('Found suspicious patterns:');
    patterns.forEach(p => {
        console.log(`\n${p.file}:${p.line}`);
        console.log(`  ${p.content}`);
    });
} else {
    console.log('No suspicious patterns found.');
}