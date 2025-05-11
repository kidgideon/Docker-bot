const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
app.use(cors());

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
  'https://coolmovies.vercel.app',
  'https://apexflick.com',
  'https://news-m.vercel.app',
  'https://greenlove-pink.vercel.app',
  'https://soccer-delta.vercel.app',
  'https://www.campusicon.ng'
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

// === SSE endpoint to trigger bot runs ===
app.get('/run-bots', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const send = msg => res.write(`data: ${msg}\n\n`);

  send(`🚀 Starting 100 visits per site...`);

  let visitCount = 1;
  for (let i = 1; i <= 100; i++) {
    await Promise.all(
      SITES.map(site =>
        visitSite(site, visitCount++, send)
      )
    );
    send(`📦 Round ${i} complete.`);
  }

  send(`✅ All 600 visits complete.`);
  res.end();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
