const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const cron = require("node-cron");

async function start() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto("https://learnwebcode.github.io/practice-requests/", {
      timeout: 60000,
    });
    const names = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".info strong")).map(
        (x) => x.textContent
      );
    });

    if (names && names.length > 0) {
      await fs.writeFile("names.txt", names.join("\r\n"));
    } else {
      console.error('No names found or "names" is undefined.');
    }

    await page.click("#clickme");
    const clickedData = await page.$eval("#data", (el) => el.textContent);
    // console.log(clickedData);

    const photos = await page.$$eval("img", (imgs) => {
      return imgs.map((x) => x.src);
    });

    await page.type("#ourfield", "blue");

    await Promise.all([
      page.click("#ourform button"),
      page.waitForNavigation(),
    ]);

    const info = await page.$eval("#message", (el) => el.textContent);
    console.log(info);

    for (const photo of photos) {
      const imgpage = await page.goto(photo);
      await fs.writeFile(photo.split("/").pop(), await imgpage.buffer());
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }

  await browser.close();
}

// call it every 5 secs
// setInterval(start, 5000);

// cron.schedule("*/5 * * * * *", start);
