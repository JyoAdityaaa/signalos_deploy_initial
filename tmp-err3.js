const fs = require('fs');
async function test() {
  const res = await fetch('http://localhost:3000/api/ingest');
  const text = await res.text();
  fs.writeFileSync('err2.txt', text);
}
test();
