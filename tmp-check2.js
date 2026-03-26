async function run() {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=ZOMATO.NS,TATAMOTORS.NS,RELIANCE.NS`;
  const res = await fetch(url);
  console.log('Status v7 quote:', res.status);
  const data = await res.json();
  const results = data.quoteResponse.result;
  results.forEach(r => console.log(r.symbol, r.regularMarketPrice));
}
run();
