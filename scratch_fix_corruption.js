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
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix the broken functional updates
  // It looks like: { ... } => prev.map(...)
  content = content.replace(/\{\s*const user = JSON\.parse\(localStorage\.getItem\("user"\) \|\| "\{\}"\);\s*const filtered = Array\.isArray\(\(prev\) \? \(prev\.filter\(item => !user\.assignedShelter \|\| item\.shelter === user\.assignedShelter\) : \(\(prev\.data \|\| \[\]\);\s*set(Dogs|Reports|Requests|Supplies|Staff|Store|Sales|Data)\(filtered\);\s*\} =>\s*prev\.map/g, '(prev) => prev.map');

  if (content !== original) {
     fs.writeFileSync(file, content);
     console.log('Fixed Corruption in:', file);
  }
});
