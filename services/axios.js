const { default: axios } = require("axios");
const { ConcurrencyManager } = require("axios-concurrency");
const Status = require("../models/Status");

const request = axios.create();

const MAX_CONCURRENT_REQUESTS = 5;

const manager = ConcurrencyManager(request, MAX_CONCURRENT_REQUESTS);

request.interceptors.response.use(
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
module.exports = { request, manager };
