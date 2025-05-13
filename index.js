// GLOBAL ERROR HANDLERS — place at the very top of the file!
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Optionally: log or send notification here
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optionally: log or send notification here
});

const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 Chrome/119.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile Safari/604.1',
  'Mozilla/5.0 (Kit/537.36 (KHTML, like Gecko) Firefox/118.0',
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
  'https://www.profitableratecpm.com/xx94cy19a?key=10c3e0d5c69fad15576ced560b53b44a',
  'https://allowsalmond.com/updxhar2?key=ac1d36ce315f630b062f30e2fc532405',
  'https://www.profitableratecpm.com/na4zv93kc?key=532f2bed27c29be540f801eb37c0fe41',
  'https://www.profitableratecpm.com/kzqvknf2?key=836ebdefe253ae88ebfbd481d9b376ac',
  'https://allowsalmond.com/befpjq8qck?key=70cc3c742709496daf9263a08da15368',

'https://allowsalmond.com/ukr2rva6?key=00aac82ff5f6bc7020eaef343a85055d'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateUserBehavior(page) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const scrollSteps = Math.floor(Math.random() * 5) + 3;

  for (let i = 0; i < scrollSteps; i++) {
    await page.mouse.wheel(0, scrollHeight / scrollSteps);
    await wait(Math.random() * 1200 + 800); // slower scrolls
  }

  const idle = Math.random() * 2000 + 2000; // 2 to 4s idle
  await wait(idle);
}

async function visitSite(site, visitNumber, send) {
  let browser;
  try {
    const ua = getRandom(userAgents);
    const viewport = getRandom(screenSizes);

    browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({
      userAgent: ua,
      viewport,
      locale: 'en-US',
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await simulateUserBehavior(page);
    send(`✅ Visit #${visitNumber} done`);
  } catch (err) {
    send(`❌ Visit #${visitNumber} failed | ${err.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        send(`⚠️ Warning: Error closing browser | ${closeErr.message}`);
      }
    }
  }
}

// EXPRESS HANDLER WITH TRY/CATCH
app.get('/run-bots', async (req, res) => {
  try {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const send = (msg) => res.write(`data: ${msg}\n\n`);

    send(`🚀 Starting visits (2 per site)...`);

    for (let i = 0; i < SITES.length; i++) {
      const site = SITES[i];
      send(`➡️ Site ${i + 1}/${SITES.length}`);

      for (let j = 1; j <= 2; j++) {
        await visitSite(site, j, send);
        await wait(1000); // Delay to reduce pressure
      }

      send(`✅complete`);
    }

    send(`🎉 All visits complete.`);
    res.end();
  } catch (err) {
    res.write(`data: ❌ Fatal error in bot runner | ${err.message}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});