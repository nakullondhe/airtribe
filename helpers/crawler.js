const axios = require("axios");
const extractDataModule = require("./extractData");
const Status = require("../models/Status");
const Question = require("../models/Question");
const baseURL = 'https://stackoverflow.com'
const crawlRecursively = require("./crawlRecursively");

const runCrawler = async () => {
  console.log("started");
  const status = await Status.findById('6291bf7ab67339a508ea7beb');

  if (status.status === "stopped") {
    console.log("stopped");
    await Status.findByIdAndUpdate(status._id, { status: "running" });
    const website = await axios.get("https://stackoverflow.com/questions");
    const links = await extractDataModule.getLinksFromBaseLink(website);
    
    const res = await Promise.all(
      links.map(async (link) => {
        return await crawlRecursively(link)
      })
    );

    if(res[0] === "stopped"){
      await Status.findByIdAndUpdate(status._id, { status: "stopped", recentLink: '', stop: false });
    } else if(res[0] === "paused"){
      await Status.findByIdAndUpdate(status._id, { status: "paused", stop: false });
    }

    console.log("res", await res);
    return 'terminated';

  } else if (status.status === "paused") {
    console.log("paused", status.recentLink);
    await Status.findByIdAndUpdate(status._id, { status: "running" , stop: false});
    const website = await axios.get(`${baseURL}${status.recentLink}`);
    const links = extractDataModule.getAllLinksFromRelatedQuestions(website);

    const res = await Promise.all(
      links.map(async (link) => {
        return await crawlRecursively(link)
      })
    );
    
    if(res[0] === "stopped"){
      await Status.findByIdAndUpdate(status._id, { status: "stopped", stop: false });
    } else if(res[0] === "paused"){
      await Status.findByIdAndUpdate(status._id, { status: "paused", stop: false });
    }
    
    console.log("res", await res);
    return 'paused';
  }
};

module.exports = {
  runCrawler,
};
