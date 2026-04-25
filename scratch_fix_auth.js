const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/dashboard/super-admin');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  const getRegex = /await fetch\((`[^`]+`)\)/g;

  // Let's manually replace the 3 scenarios we expect in Next.js frontend fetches:
  // 1. GET requests: await fetch(`url`);
  const getRegexMatches = [...content.matchAll(/await fetch\((`[^`]+`)\);/g)];
  if(getRegexMatches.length > 0) {
    content = content.replace(/await fetch\((`[^`]+`)\);/g, 'await fetch($1, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});');
    modified = true;
  }

  // 2. DELETE requests without headers
  const deleteRegex = /await fetch\((`[^`]+`), \{\s*method:\s*"DELETE",?\s*\}\);/g;
  if(deleteRegex.test(content)) {
      content = content.replace(deleteRegex, 'await fetch($1, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });');
      modified = true;
  }
  
  // 3. POST/PUT requests with Content-Type header already present
  const headersRegex = /headers:\s*\{\s*"Content-Type":\s*"application\/json",?\s*\}/g;
  if(headersRegex.test(content)) {
      content = content.replace(headersRegex, 'headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }');
      modified = true;
  }

  if (modified) {
     fs.writeFileSync(file, content);
     console.log('Modified:', file);
  }
});

