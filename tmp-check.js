async function check(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
  const res = await fetch(url);
  console.log(ticker, res.status);
}
async function run() {
  await check('ETERNAL.NS');
  await check('TAMO.NS');
  await check('TMPV.NS');
}
run();
