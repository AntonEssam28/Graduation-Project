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
  if (file.includes('shelter-admin/page.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Ensure Auth headers are in all fetch calls
  content = content.replace(/fetch\((`[^`]+`)\)/g, 'fetch($1, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})');
  content = content.replace(/fetch\((`[^`]+`), \{\s*method:\s*"DELETE",?\s*\}\)/g, 'fetch($1, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })');
  
  // Fix cases where headers already exist but lack token
  if (content.includes('headers:') && !content.includes('Authorization:')) {
      content = content.replace(/headers:\s*\{\s*"Content-Type":\s*"application\/json",?\s*\}/g, 'headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }');
  }

  // 2. Wrap setDogs/setReports/setData with filtering
  const listRegex = /set(Dogs|Reports|Requests|Supplies|Staff|Store|Sales|Data)\(([^)]+)\)/g;
  if (listRegex.test(content)) {
      // Avoid wrapping if already wrapped or complex
      if (!content.includes('const user = JSON.parse')) {
          content = content.replace(listRegex, (match, type, varName) => {
              return `{
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const filtered = Array.isArray(${varName}) ? ${varName}.filter(item => !user.assignedShelter || item.shelter === user.assignedShelter) : (${varName}.data || []);
                set${type}(filtered);
              }`;
          });
      }
  }

  if (content !== original) {
     fs.writeFileSync(file, content);
     console.log('Finalized:', file);
  }
});
