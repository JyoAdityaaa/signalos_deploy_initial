const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const quote = await yahooFinance.quote('RELIANCE.NS');
    console.log('Success:', quote.regularMarketPrice);
  } catch (error) {
    console.error('EXACT ERROR MESSAGE:\n', error.message || error);
  }
}
test();
