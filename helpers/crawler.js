const axios = require("axios");
const extractDataModule = require("./extractData");
const Status = require("../models/Status");
const Question = require("../models/Question");
const baseURL = 'https://stackoverflow.com'


const addStatus = async (req, res) => {
  const st = new Status({
    recentLink: '',
    status: 'stopped',
  })
  await st.save();
  return;
}

const crawlRecursively = async (link) => {
  // Check Stop Status
  console.log("crawlRecursively");
  const status = await Status.findById('6291bf7ab67339a508ea7beb');
  if (status.stop) {
    status.stop = false;
    status.status = "stopped";
    console.info('CRAWLER TERMINATED');
    await status.save();
    return true;
  }
  
  // search link
  const website = await axios.get(baseURL+link);

  // Check if data already exists
  const savedData = await Question.findOne({
    questionId: extractDataModule.getQuestionId(link),
  });
  if (savedData) {
    if(status.repeats === 3) {
      console.log('Going to seond link', 'background: #222; color: #bada55')
      const baseWebsite = await axios.get("https://stackoverflow.com/questions");
      const secondLink = await extractDataModule.getLinkFromBaseLink(baseWebsite);
      status.repeats = 0;
      await status.save();
      console.log({secondLink})
      return crawlRecursively(secondLink);
    }

    console.info("Data already exists");
    savedData.referenceCount = savedData.referenceCount + 1;
    status.repeats = status.repeats + 1;

    await Promise.all([
      savedData.save(),
      status.save(),
    ])

    console.log({savedData: await savedData, REPEATS: status.repeats})
    const nextLink = extractDataModule.getLinkFromRelatedQuestions(website);
    return crawlRecursively(nextLink);
  }

  // extract data
  let questionData = extractDataModule.getQuestionData(website);
  questionData.link = link;
  questionData.questionId = extractDataModule.getQuestionId(link);
  
  // save data
  const newQuestion = await new Question(questionData);
  await newQuestion.save();
  console.log("data Saved", newQuestion);
  
  // update Recent Link
  status.recentLink = link;
  await status.save();
  
  // get nextLink
  const nextLink = extractDataModule.getLinkFromRelatedQuestions(website);
  // Call again
  console.log({"nextLink" : nextLink})
  console.log(`FUNCTION ENDED ${extractDataModule.getQuestionId(link)}`, 'background: #222; color: #bada55')
  crawlRecursively(nextLink);
};

const runCrawler = async () => {
  console.log("started");
  const status = await Status.findById('6291bf7ab67339a508ea7beb');

  if (status.status === "stopped" || status.status === "running") {
    console.log("stopped");
    await Status.findByIdAndUpdate(status._id, { status: "running" });
    website = await axios.get("https://stackoverflow.com/questions");
    const link = await extractDataModule.getLinkFromBaseLink(website);
    console.log("link", baseURL+link);
    crawlRecursively(link);
  } else if (status.status === "paused") {
    await Status.findByIdAndUpdate(status._id, { status: "running" });
    crawlRecursively(status.recentLink);
  }
};

module.exports = {
  runCrawler,
  crawlRecursively,
  addStatus
};
