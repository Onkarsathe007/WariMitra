const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.css');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find @media (prefers-color-scheme: dark) blocks
  const mediaRegex = /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{([\s\S]*?^\})\s*\}/gm;
  
  let modified = false;
  content = content.replace(mediaRegex, (match, inner) => {
    modified = true;
    
    // We have the inner content, e.g., "\n  .selector {\n    prop: val;\n  }\n}"
    // But actually `inner` will capture up to the matching brace if we're careful.
    // Given the simple CSS structure, let's just do a string replacement for simplicity.
    
    return inner.trim().split('\n').map(line => {
      // Find root level selectors inside the media query and prefix them
      if (line.match(/^\s*\.[a-zA-Z0-9_-]+\s*\{/)) {
        return line.replace(/^\s*(\.[a-zA-Z0-9_-]+)/, 'html.dark $1');
      }
      return line;
    }).join('\n');
  });

  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
