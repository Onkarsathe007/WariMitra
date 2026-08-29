const fs = require('fs');
const services = JSON.parse(fs.readFileSync('/tmp/services.json', 'utf8')).services || [];
const camps = JSON.parse(fs.readFileSync('/tmp/camps.json', 'utf8')).camps || [];

console.log("=== SERVICES ===");
services.forEach(s => console.log(`- [${s.type.toUpperCase()}] ${s.name} in ${s.city}`));
console.log("\n=== CAMPS (SHELTERS) ===");
camps.forEach(c => console.log(`- [${c.type.toUpperCase()}] ${c.name} in ${c.city}`));
