const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const { gotScraping } = await import("got-scraping");
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required." });
    }

    const { body } = await gotScraping(url);
    const $ = cheerio.load(body);

    let price, title, partNumber;
    const hostname = new URL(url).hostname;

    if (hostname === "www.tascaparts.com") {
      price = $("#product_price").text().trim();
      title = $(".product-title").first().text().trim();
      partNumber = $(".part_number span").first().text().trim();
    } else if (hostname === "shop.ford.co.uk") {
      title = $("h1.product-details__title").text().trim();
      partNumber = $(".product-details__sku")
        .text()
        .replace("Product No.", "")
        .trim();
      price = $("span.price--large").text().trim();
    } else {
      return res.status(400).json({ error: "Unsupported website." });
    }

    res.status(200).json({ price, title, partNumber });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to fetch the price." });
  }
};
