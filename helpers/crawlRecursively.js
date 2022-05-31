const {request} = require("../services/axios");
const Status = require("../models/Status");
const baseURL = "https://stackoverflow.com";
const extractDataModule = require("./extractData");
const Question = require("../models/Question");

const crawlRecursively = async (link) => {
  // Check Stop Status
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
    savedData.referenceCount = savedData.referenceCount + 1;

    await Promise.all([savedData.save(), status.save()]);
    return;
  }

  // search link
  const website = await request.get(baseURL + link);
  console.log('request sent')

  // extract data
  let questionData = extractDataModule.getQuestionData(website, link);

  // save data
  const newQuestion = await new Question(questionData);
  try {
    await newQuestion.save();
  } catch (err) {
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
