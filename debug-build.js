// Debug script to find the source of String.repeat(-10) error
const fs = require('fs');
const path = require('path');

function findStringRepeat(dir) {
    const files = [];

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
                traverse(fullPath);
            } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
                files.push(fullPath);
            }
        }
    }

    traverse(dir);

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                if (line.includes('.repeat(') || line.includes('repeat(')) {
                    console.log(`\n${file}:${index + 1}`);
                    console.log(line.trim());

                    // Look for potential negative values around this line
                    for (let i = Math.max(0, index - 2); i <= Math.min(lines.length - 1, index + 2); i++) {
                        if (lines[i].includes('-') && (lines[i].includes('count') || lines[i].includes('length') || lines[i].includes('size'))) {
                            console.log(`  Related line ${i + 1}: ${lines[i].trim()}`);
                        }
                    }
                }
            });
        } catch (e) {
            console.error(`Error reading ${file}:`, e.message);
        }
    }
}

findStringRepeat(path.join(__dirname, 'app'));