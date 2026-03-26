async function test() {
  const res = await fetch('http://localhost:3000/api/ingest');
  const text = await res.text();
  console.log('Error output (first 1500 chars):\n', text.substring(0, 1500));
}
test();
