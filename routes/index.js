const router = require("express").Router();
const Status = require("../models/Status");

router.post("/crawl", async (req, res) => {
  const status = await Status.findById('6291bf7ab67339a508ea7beb');
  status.status = "running";
  await status.save();
  const terminate = await runCrawler();
  if(terminate) {
      res.status(200).json({ message: 'process terminated'})
  }
});

router.post('/pause', async (req, res) => {
  const status = await Status.findById('6291bf7ab67339a508ea7beb');
  status.status = "paused";
  await status.save();
  res.status(200).json({ message: 'process paused'})
})

router.post('/crawl?stop=true', async (req, res) => {
  const status = await Status.findById('6291bf7ab67339a508ea7beb');
  status.status = "stopped";
  await status.save();
  res.status(200).json({ message: 'process stopped'})
})

router.get('/count', (req, res) => {
  Question.countDocuments({}, (err, count) => {
    res.status(200).json({ count })
  })
})

module.exports = { router };
