async function test() {
  console.log("Fetching live data + AI signals...");
  const res = await fetch('http://localhost:3000/api/ingest');
  const json = await res.json();
  
  if (json.data) {
    json.data.forEach(d => {
      console.log(`\n=== ${d.ticker} ===`);
      console.log('Price:', d.quote?.price);
      console.log('AI Signals Generated:', d.signals?.length || 0);
      if (d.signals && d.signals.length > 0) {
        d.signals.forEach((sig, idx) => {
          console.log(`  [${idx+1}] ${sig.signalType.toUpperCase()} (${sig.sentiment}): ${sig.description} [Confidence: ${sig.confidenceScore}%]`);
        });
      }
    });
  } else {
    console.log("No data returned:", json);
  }
}
test();
