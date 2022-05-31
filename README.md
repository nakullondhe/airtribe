
## Deployment

To deploy this project run

```bash
  git pull https://github.com/nakullondhe/airtribe.git
```

To run server

```bash
node index.js
```

## Description
This is an api based application and provides three operations.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/802be9a412212cd0c6ce)

* Crawl -  Starts crawling stackoverflow
```
http://localhost:8081/crawl
```
* Pause - Pauses crawling and saves most recent link in the Database.
```
http://localhost:8081/pause
```
* Stop - Stops crawling entirely and doesn't save the last link.
```
http://localhost:8081/stop
```

## Technology Stack

* Nodejs
* Express.js
* MongoDB Atlas
* Cheerio
* Axios

## Note
This applications in not rate limited yet and will be added soon.
So, use with caustion as your IP might be temporily blocked for 5-10 mins.
