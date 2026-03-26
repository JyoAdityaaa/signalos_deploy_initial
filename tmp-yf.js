const yahooFinance = require('yahoo-finance2').default;
yahooFinance.suppressNotices(['yahooSurvey']);

async function test() {
  try {
    const quote = await yahooFinance.quote('RELIANCE.NS');
    console.log('Quote object keys:', Object.keys(quote));
    console.log('Price:', quote.regularMarketPrice);
    console.log('Prev Close:', quote.regularMarketPreviousClose);
    console.log('Volume:', quote.regularMarketVolume);
    console.log('Full excerpt:', JSON.stringify(quote).substring(0, 500));
  } catch (error) {
    console.error('API Error:', error);
  }
}
test();
