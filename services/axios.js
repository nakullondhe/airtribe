const { default: axios } = require("axios");
const Status = require("../models/Status");
console.log("crawler.js");
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 429) {
      console.log("Too Many Requests");
      await Status.findByIdAndUpdate("6291bf7ab67339a508ea7beb", {
        status: "paused",
        stop: false,
      });
      return Promise.reject("Too Many Requests");
    }
    return Promise.reject(error);
  }
);
