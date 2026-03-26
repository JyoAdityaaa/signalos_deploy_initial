const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

async function test() {
  try {
    const quote = await yahooFinance.quote('RELIANCE.NS');
    console.log('Success!', quote.regularMarketPrice);
  } catch (error) {
    console.error('ERROR:', error);
  }
}
test();
