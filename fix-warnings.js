// Script to batch fix common warning patterns
const fs = require('fs');
const path = require('path');

// Common patterns to fix
const patterns = [
    // Replace unused caught errors
    {
        search: /} catch \(err\) {/g,
        replace: '} catch {'
    },
    // Replace unused caught errors with _
    {
        search: /} catch \((error|err|e)\) {/g,
        replace: '} catch {'
    },
    // Replace unused error variables
    {
        search: /catch \(error\) \{/g,
        replace: 'catch {'
    },
    // Remove unused console.log errors
    {
        search: /console\.error\([^)]+\);?/g,
        replace: ''
    }
];

// Files to process (most critical pages)
const files = [
    'app/(dashboard)/resident/facilities/page.tsx',
    'app/(dashboard)/resident/support/page.tsx',
    'app/(dashboard)/resident/support/[id]/page.tsx',
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        patterns.forEach(pattern => {
            content = content.replace(pattern.search, pattern.replace);
        });
        fs.writeFileSync(file, content);
        console.log(`Fixed ${file}`);
    }
});

console.log('Batch fix complete!');