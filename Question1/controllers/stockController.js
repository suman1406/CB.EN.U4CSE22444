const api = require('../services/apiClient');

async function getAveragePrice(req, res) {
  try {
    const { ticker } = req.params;
    const minutes = Number(req.query.minutes);
    const aggregation = req.query.aggregation;

    if (!ticker || isNaN(minutes) || minutes <= 0 || aggregation !== 'average') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    console.log(`Fetching stock data for ${ticker} for last ${minutes} minutes`);

    const response = await api.get(`/stocks/${ticker}`, {
      params: { minutes },
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Response received:', response.status);
    
    if (!response.data) {
      console.log('No data received in response');
      return res.sendStatus(204);
    }

    const priceHistory = Array.isArray(response.data) ? response.data : [response.data];

    if (priceHistory.length === 0) {
      console.log('Empty price history array');
      return res.sendStatus(204);
    }

    const averagePrice = calculateAverage(priceHistory);

    return res.json({
      averageStockPrice: Number(averagePrice.toFixed(6)),
      priceHistory
    });

  } catch (err) {
    console.error('getAveragePrice error details:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message,
      url: err.config?.url,
      params: err.config?.params
    });
    
    return res
      .status(err.response?.status || 500)
      .json({ 
        error: 'Unable to fetch average price',
        details: err.response?.data || err.message
      });
  }
}

async function getCorrelation(req, res) {
  try {
    const minutes = Number(req.query.minutes);
    let tickers = req.query.ticker;

    if (typeof tickers === 'string') {
      tickers = [tickers];
    }

    if (
      isNaN(minutes) ||
      minutes <= 0 ||
      !Array.isArray(tickers) ||
      tickers.length !== 2
    ) {
      return res.status(400).json({
        error: 'Invalid parameters: Provide `minutes` and exactly two `ticker` values'
      });
    }

    // Fetch both price histories in parallel
    const [resp1, resp2] = await Promise.all([
      api.get(`/stocks/${tickers[0]}`, { params: { minutes } }),
      api.get(`/stocks/${tickers[1]}`, { params: { minutes } })
    ]);

    const history1 = resp1.data;
    const history2 = resp2.data;

    if (!history1.length || !history2.length) {
      return res.sendStatus(204);
    }

    const avg1 = calculateAverage(history1);
    const avg2 = calculateAverage(history2);

    const correlation = calculateCorrelationClosestPairing(history1, history2);

    return res.json({
      correlation: Number(correlation.toFixed(4)),
      stocks: {
        [tickers[0]]: { averagePrice: Number(avg1.toFixed(6)), priceHistory: history1 },
        [tickers[1]]: { averagePrice: Number(avg2.toFixed(6)), priceHistory: history2 }
      }
    });

  } catch (err) {
    console.error('getCorrelation error:', err.response?.status, err.message);
    return res
      .status(err.response?.status || 500)
      .json({ error: 'Unable to fetch correlation' });
  }
}

function calculateAverage(prices) {
  const sum = prices.reduce((acc, { price }) => acc + price, 0);
  return sum / prices.length;
}

function calculateCorrelationClosestPairing(prices1, prices2) {
  // Convert to arrays of [timestamp, price] pairs
  const pairs1 = prices1.map(p => [new Date(p.lastUpdatedAt).getTime(), p.price]);
  const pairs2 = prices2.map(p => [new Date(p.lastUpdatedAt).getTime(), p.price]);

  const used2 = new Set();
  const aligned = [];

  for (const [t1, p1] of pairs1) {
    let minDiff = Infinity;
    let bestIdx = -1;
    for (let i = 0; i < pairs2.length; i++) {
      if (used2.has(i)) continue;
      const [t2] = pairs2[i];
      const diff = Math.abs(t1 - t2);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = i;
      }
    }
    if (bestIdx !== -1) {
      aligned.push([p1, pairs2[bestIdx][1]]);
      used2.add(bestIdx);
    }
  }

  if (aligned.length < 2) {
    return 0;
  }

  const mean1 = aligned.reduce((sum, [x]) => sum + x, 0) / aligned.length;
  const mean2 = aligned.reduce((sum, [, y]) => sum + y, 0) / aligned.length;

  let covariance = 0;
  let variance1 = 0;
  let variance2 = 0;

  for (const [x, y] of aligned) {
    const diff1 = x - mean1;
    const diff2 = y - mean2;
    covariance += diff1 * diff2;
    variance1 += diff1 ** 2;
    variance2 += diff2 ** 2;
  }

  const n = aligned.length;
  covariance /= (n - 1);
  variance1 /= (n - 1);
  variance2 /= (n - 1);

  const stdDev1 = Math.sqrt(variance1);
  const stdDev2 = Math.sqrt(variance2);

  return stdDev1 && stdDev2 ? covariance / (stdDev1 * stdDev2) : 0;
}

async function listStocks(req, res) {
  try {
    const response = await api.get('/stocks');
    return res.json(response.data);
  } catch (err) {
    console.error('listStocks error:', err.response?.status, err.message);
    return res
      .status(err.response?.status || 500)
      .json({ error: 'Unable to fetch stock list' });
  }
}

module.exports = {
  getAveragePrice,
  getCorrelation,
  listStocks
};