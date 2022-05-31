
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


