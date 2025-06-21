const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const { gotScraping } = await import("got-scraping");
    const url =
      "https://www.tascaparts.com/oem-parts/ford-engine-timing-belt-tensioner-f1fz6c348c";
    const { body } = await gotScraping(url);

    const $ = cheerio.load(body);
    const price = $("#product_price").text().trim();
    const title = $(".product-title").text().trim();
    const partNumber = $(".part_number span").text().trim();

    res.status(200).json({ price, title, partNumber });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to fetch the price." });
  }
};
