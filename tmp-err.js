const fs = require('fs');
const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    await yahooFinance.quote('RELIANCE.NS');
  } catch (error) {
    fs.writeFileSync('err.txt', error.message || String(error));
  }
}
test();
