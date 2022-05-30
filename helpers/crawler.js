const axios = require("axios");
const extractDataModule = require("./extractData");
const Status = require("../models/Status");
const Question = require("../models/Question");
const baseURL = 'https://stackoverflow.com'


const crawlRecursively = async (link) => {
  // Check Stop Status
  console.log("crawlRecursively");
  const status = await Status.findById('6291bf7ab67339a508ea7beb');
  if (status.stop) {
    console.info('CRAWLER TERMINATED');
    if(status.status === "stopped"){
      status.status = "stopped";
      await status.save();
      return 'stopped';
    } else if(status.status === "paused"){
      status.status = "paused";
      await status.save();
      return "paused";
    }
  }

  // Check if data already exists
  const savedData = await Question.findOne({
    questionId: extractDataModule.getQuestionId(link),
  });

  if (savedData) {
    console.info("Data already exists");
    savedData.referenceCount = savedData.referenceCount + 1;

    await Promise.all([
      savedData.save(),
      status.save(),
    ])
    return;
  }

  // search link
  const website = await axios.get(baseURL+link);

  // extract data
  let questionData = extractDataModule.getQuestionData(website, link);
  
  // save data
  const newQuestion = await new Question(questionData);
  await newQuestion.save();
  console.log("data Saved", newQuestion);
  
  // update Recent Link
  status.recentLink = link;
  await status.save();
  
  // get nextLink
  const newLinks = extractDataModule.getAllLinksFromRelatedQuestions(website);
  console.log("newLinks", newLinks);
  await Promise.all(
    newLinks.map(async (link) => {
      return await crawlRecursively(link)
    })
  );
};

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
    status.stop = false;
    await status.save()
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
    
    await status.save()
    console.log("res", await res);
    return 'paused';
  }
};

module.exports = {
  runCrawler,
  crawlRecursively,
};
