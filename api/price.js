const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const { gotScraping } = await import("got-scraping");
    const urls = [
      "https://www.tascaparts.com/oem-parts/ford-engine-timing-belt-tensioner-f1fz6c348c",
      "https://shop.ford.co.uk/products/ford-ecosport-fiesta-focus-gtdi-oil-pump-drive-belt-2017",
      "https://shop.ford.co.uk/products/ford-gtdi-ecoboost-cam-timing-belt-11-2017",
    ];

    const promises = urls.map(async (url) => {
      try {
        const { body } = await gotScraping(url);
        const $ = cheerio.load(body);
        const hostname = new URL(url).hostname;
        let price, title, partNumber;

        if (hostname === "www.tascaparts.com") {
          price = $("#product_price").text().trim();
          title = $(".product-title").first().text().trim();
          partNumber = $(".part_number span").first().text().trim();
        } else if (hostname === "shop.ford.co.uk") {
          title = $("h1.product-details__title").text().trim();
          const rawSku = $(".product-details__sku").first().text();
          partNumber = rawSku.match(/\d+/)[0];
          price = $("span.price--large").text().trim();
        }

        return { price, title, partNumber, url };
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return { url, error: "Failed to scrape this URL." };
      }
    });

    const results = await Promise.all(promises);

    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to fetch prices." });
  }
};
