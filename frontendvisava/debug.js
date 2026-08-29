import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log('Launching puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Listen to console logs
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type().toUpperCase(), msg.text()));
    
    // Listen to page errors (uncaught exceptions)
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    
    // Listen to request failures
    page.on('requestfailed', request => {
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    
    console.log('Navigation complete. Waiting a few seconds for react to render...');
    await new Promise(r => setTimeout(r, 2000));
    
    const bodyContent = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
    console.log('BODY SNAPSHOT (first 500 chars):', bodyContent);
    
    await browser.close();
  } catch (err) {
    console.error('PUPPETEER SCRIPT ERROR:', err);
    process.exit(1);
  }
})();
