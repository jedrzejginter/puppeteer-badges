const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DEFAULT_CHROME_EXE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const html = fs.readFileSync('./index.html', 'utf-8');

function makeFilename(text, size = 1) {
  let filename = text
    .replace(/[\s]+/g,'-')
    .replace(/[^a-z\d\-]/gi, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+$/g, '')
    .toLowerCase();

  if (size === 1) {
    return filename;
  }

  return `${filename}@${size}x`;
}

let browser;

module.exports = async ({ text, backgroundColor, color }) => {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_EXE_PATH || DEFAULT_CHROME_EXE_PATH,
    });
  }

  const page = await browser.newPage();

  for (const size of [1, 2]) {
    await page.setContent(html);

    const root = await page.$('#root');

    await page.evaluate((ctx) => {
      // this code runs in browser
      // so things like document.querySelector are possible :o
      root.textContent = ctx.text;
      root.setAttribute('data-v', ctx.size);

      root.style.backgroundColor = ctx.backgroundColor;
      root.style.color = ctx.color;
    }, { backgroundColor, color, size, text });

    const filePath = `badges/${makeFilename(text, size)}.png`;

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    await root.screenshot({
      path: filePath,
      omitBackground: true,
    });
  }

  await browser.close();
};
