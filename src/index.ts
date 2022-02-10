import Fastify from 'fastify';
import { getRss, insertMessage } from './database/querys'
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
    return feed.items;
}

var reSync = async (url: string) => {
    const rss = await getRss(url);
    const items = await parseUrl(url)
    for (var i in items) {
        insertMessage(items[i], rss.id)
    }
}

cron.schedule('0 * * * *', () => {
    fastify.log.info('UPDATING RSS FEEDS')
    for (var i in json.records) {
        reSync(json.records[i].url)
    }
});

