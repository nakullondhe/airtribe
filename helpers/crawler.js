const {request} = require("../services/axios");
const extractDataModule = require("./extractData");
const Status = require("../models/Status");
const Question = require("../models/Question");
const baseURL = 'https://stackoverflow.com'
const crawlRecursively = require("./crawlRecursively");

const runCrawler = async () => {
  console.log("started");
  const status = await Status.findById('6291bf7ab67339a508ea7beb');

  if (status.status === "stopped") {
    await Status.findByIdAndUpdate(status._id, { status: "running" });
    const website = await request.get("https://stackoverflow.com/questions");
    const links = await extractDataModule.getAllLinksFromBaseLink(website);
    
    const res = await Promise.all(
      links.map(async (link) => {
        return await crawlRecursively(link)
      })
    );

    await Status.findByIdAndUpdate(status._id, { stop: false });
    console.log("finished");
    return 'terminated';

  } else if (status.status === "paused") {
    await Status.findByIdAndUpdate(status._id, { status: "running" , stop: false});
    const website = await request.get(`${baseURL}${status.recentLink}`);
    const links = extractDataModule.getAllLinksFromRelatedQuestions(website);

    const res = await Promise.all(
      links.map(async (link) => {
        return await crawlRecursively(link)
      })
    );
    
    await Status.findByIdAndUpdate(status._id, { stop: false });
    console.info("Finished");
    return 'paused';
  }
};

module.exports = {
  runCrawler,
};
