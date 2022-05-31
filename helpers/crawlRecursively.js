const axios = require("axios");
const Status = require("../models/Status");
const baseURL = "https://stackoverflow.com";
const extractDataModule = require("./extractData");
const Question = require("../models/Question");

const crawlRecursively = async (link) => {
  // Check Stop Status
  console.log("crawlRecursively");
  const status = await Status.findById("6291bf7ab67339a508ea7beb");
  if (status.stop) {
    console.info("CRAWLER TERMINATED");
    if (status.status === "stopped") {
      status.status = "stopped";
      await status.save();
      return "stopped";
    } else if (status.status === "paused") {
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

    await Promise.all([savedData.save(), status.save()]);
    return;
  }

  // search link
  const website = await axios.get(baseURL + link);

  // extract data
  let questionData = extractDataModule.getQuestionData(website, link);

  // save data
  const newQuestion = await new Question(questionData);
  try {
    await newQuestion.save();
    console.log("data Saved", newQuestion);
  } catch (err) {
    console.log("error", err);
    if (err.code === 11000) {
      console.log("Duplicate Entry");
    }
    return;
  }

  // update Recent Link
  status.recentLink = link;
  await status.save();

  // get nextLink
  const newLinks = extractDataModule.getAllLinksFromRelatedQuestions(website);

  await Promise.all(
    newLinks.map(async (link) => {
      return await crawlRecursively(link);
    })
  );
};

module.exports = crawlRecursively;
