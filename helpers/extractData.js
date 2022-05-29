const cheerio = require("cheerio");

const getQuestionId = (link) => {
  const questionId = link.slice(11, link.lastIndexOf("/"));
  return questionId;
};

const getLinkFromBaseLink = async (initialLink) => {
  console.log("getting link from base link");
  const $ = cheerio.load(initialLink.data);
  const questionsElement = $(".s-post-summary");
  const firstLink = questionsElement.first();
  const link = $(firstLink)
    .children(".s-post-summary--content")
    .children("h3")
    .children("a")
    .attr("href");
  return link;
};

const getLinkFromRelatedQuestions = (website) => {
  console.log("getting link from related questions");
  const $ = cheerio.load(website.data);
  const relateQuestionsElement = $(".related div:nth-child(1)").children("a:nth-child(2)");
  const link = relateQuestionsElement.attr("href");
  return link;
};

const getQuestionData = (website) => {
  console.log("getting question data");
  const $ = cheerio.load(website.data);
  const data = {
    title: $("#question-header").children("h1").children("a").text(),
    questionId: String,
    votes: parseInt($(".js-vote-count").attr('data-value')),
    answers: Number,
    views: Number,
    link: String,
  };

  let answers = parseInt(
    $("answers-subheader").children("div").children("h2").text()
  )
  if (answers) {
    data.answers = answers;
  } else {
    data.answers = 0;
  }
  let views = $(".inner-content div:nth-child(3)");
  views = views.attr("title");
  let viewCount = views.slice(7);
  let index = viewCount.indexOf(" ");
  viewCount = viewCount.slice(0, index).replace(/,/g, "");
  data.views = parseInt(viewCount);

  return data;
};

const getSecondLinkFromRelatedQuestions = (website) => {
  console.log("getting second link from related questions");
  const $ = cheerio.load(website.data);
  const relateQuestionsElement = $(".related div:nth-child(2)").children("a:nth-child(2)");
  const link = relateQuestionsElement.attr("href");
  return link;
}


module.exports = {
  getLinkFromRelatedQuestions,
  getLinkFromBaseLink,
  getQuestionData,
  getQuestionId,
  getSecondLinkFromRelatedQuestions,
};
