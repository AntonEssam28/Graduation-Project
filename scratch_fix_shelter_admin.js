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

const files = walk('src/app/dashboard/shelter-admin');

files.forEach(file => {
  if (file.includes('shelter-admin/page.tsx')) return; // already fixed
  
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // 1. Inject Authorization header if missing
  const tokenInjected = content.includes('localStorage.getItem("token")');
  if (!tokenInjected) {
      content = content.replace(/await fetch\((`[^`]+`)\)/g, 'await fetch($1, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})');
      content = content.replace(/await fetch\((`[^`]+`), \{\s*method:\s*"DELETE",?\s*\}\)/g, 'await fetch($1, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })');
      content = content.replace(/headers:\s*\{\s*"Content-Type":\s*"application\/json",?\s*\}/g, 'headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }');
      modified = true;
  }

  // 2. Add Shelter Filtering Logic if it's a list page
  if (content.includes('Array.isArray(data)')) {
      if (!content.includes('user.assignedShelter')) {
          content = content.replace(
              /const result = await res\.json\(\);/,
              'const result = await res.json();\n        const user = JSON.parse(localStorage.getItem("user") || "{}");\n        const filtered = Array.isArray(result) ? result.filter(item => !user.assignedShelter || item.shelter === user.assignedShelter) : (result.data || []);'
          );
          content = content.replace(/setData\(Array\.isArray\(result\) \? result : result\.data \|\| \[\]\);/, 'setData(filtered);');
          modified = true;
      }
  }

  if (modified) {
     fs.writeFileSync(file, content);
     console.log('Modified:', file);
  }
});
