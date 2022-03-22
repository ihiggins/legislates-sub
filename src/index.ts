import Fastify from 'fastify';
import { bulkMessageInsert, getRss, insertMessage } from './database/querys'
import cron from 'node-cron'

let json = require('./rssList.json');
let Parser = require('rss-parser');
let parser = new Parser();

const fastify = require('fastify')({
    logger: true
})

fastify.listen(3000, function (err, _address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

const parseUrl = async (url: string) => {
    let feed = await parser.parseURL(url);
    var temp = JSON.stringify(feed)
    var temp2 = temp.replaceAll("'", '’');
    var temp3 = JSON.parse(temp2)
    return temp3.items;
}

var reSync = async (url: string) => {
    const rss = await getRss(url);
    const items = await parseUrl(url)
    bulkMessageInsert(items, rss.id)
}

// cron.schedule('0 * * * *', () => {
//     fastify.log.info('UPDATING RSS FEEDS')
//     for (var i in json.records) {
//         reSync(json.records[i].url)
//     }
// });



    fastify.log.info('UPDATING RSS FEEDS')
    for (var i in json.records) {
        reSync(json.records[i].url)
    }