const router = require("express").Router();
const Status = require("../models/Status");
const {runCrawler} = require('../helpers/crawler')

router.post("/crawl", async (req, res) => {
  res.json({ message: 'process started'})
  const terminate = await runCrawler();
  return;
});

router.post('/pause', async (req, res) => {
  const status = await Status.findById('6291bf7ab67339a508ea7beb');
  status.status = "paused";
  status.stop =  true;
  await status.save();
  res.status(200).json({ message: 'process paused'})
})

router.post('/stop', async (req, res) => {
  const status = await Status.findById('6291bf7ab67339a508ea7beb');
  status.status = "stopped";
  status.stop =  true;
  await status.save();
  res.status(200).json({ message: 'process stopped'})
})

router.get('/count', (req, res) => {
  Question.countDocuments({}, (err, count) => {
    res.status(200).json({ count })
  })
})

module.exports = router;
