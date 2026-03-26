async function test() {
  const res = await fetch('http://localhost:3000/api/ingest');
  const json = await res.json();
  console.log('Quotes received:');
  json.data.forEach(d => console.log(d.ticker, d.quote));
}
test();
