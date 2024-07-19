const puppeteer = require("puppeteer");
const fs = require("fs/promises");

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

    const photos = await page.$$eval("img", (imgs) => {
      return imgs.map((x) => x.src);
    });

    for (const photo of photos) {
      const imgpage = await page.goto(photo);
      await fs.writeFile(photo.split("/").pop(), await imgpage.buffer());
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }

  await browser.close();
}

start();
