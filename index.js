const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
const corsOptions = {
  origin: '*', // Allow requests only from this origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

// Apply the CORS options to your app
app.use(cors(corsOptions));

const PORT = 3000;

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 Chrome/119.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile Safari/604.1',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.76',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/118.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile Safari/604.1',
  'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-J600G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) Gecko/20100101 Firefox/102.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0'
];



const screenSizes = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 414, height: 896 },
  { width: 375, height: 667 }
];

const SITES = [ 
  'https://www.profitableratecpm.com/ecx2ujcjf?key=fe0ff3db8aade97613dae3ed6e1b24dc',
  'https://www.profitableratecpm.com/mfym6sgtx?key=e8a24667eee54da01e68eaf507501749',
  'https://www.profitableratecpm.com/ecx2ujcjf?key=fe0ff3db8aade97613dae3ed6e1b24dc',
 'https://www.profitableratecpm.com/wqarcndcc?key=7316c0853e92a834ad3e44ea7c5d14e5',
 'https://www.profitableratecpm.com/ju8qibav0?key=2e48d01322fa94671211becbd36ac554',
 'https://www.profitableratecpm.com/na4zv93kc?key=532f2bed27c29be540f801eb37c0fe41',
 'https://www.profitableratecpm.com/xx94cy19a?key=10c3e0d5c69fad15576ced560b53b44a'
];


function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateUserBehavior(page) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const scrollSteps = 3;

  for (let i = 0; i < scrollSteps; i++) {
    await page.mouse.wheel(0, scrollHeight / scrollSteps);
    await wait(Math.random() * 300 + 300); // faster idle time
  }
}

async function visitSite(site, visitNumber, send) {
  const ua = getRandom(userAgents);
  const viewport = getRandom(screenSizes);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport,
    userAgent: ua,
    locale: 'en-US',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await simulateUserBehavior(page);
    send(`✅ Visit #${visitNumber} successful on ${site}`);
  } catch (err) {
    send(`❌ Visit #${visitNumber} failed on ${site} | ${err.message}`);
  } finally {
    await browser.close();
  }
}
app.get('/run-bots', async (req, res) => {
  console.log('Request received to run bots');
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const send = msg => {
    console.log('Sending message:', msg);
    res.write(`data: ${msg}\n\n`);
  };

  async function runVisitsForSite(site, totalVisits) {
    for (let i = 1; i <= totalVisits; i++) {
      await visitSite(site, i, send);
      await wait(500); // throttle a bit to reduce CPU/memory spikes
    }
  }

  try {
    send(`🚀 Starting 10 visits per site...`);

    for (let i = 0; i < SITES.length; i++) {
      const site = SITES[i];
      send(`➡️ Starting site ${i + 1}/${SITES.length}: ${site}`);
      await runVisitsForSite(site, 10);
      send(`✅ Finished site ${i + 1}: ${site}`);
    }

    send(`🎉 All site visits complete.`);
  } catch (err) {
    console.error('Error occurred during bot run:', err);
    send(`❌ Error: ${err.message}`);
  } finally {
    res.end();
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
