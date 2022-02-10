import { dbClient } from "./connection";
import Fastify from 'fastify'

const fastify = require('fastify')({
  logger: true
})


const getRss = async (url: string) => {
  return dbClient
    .query(
      `
      select * from rss
      where url = '${url}'
        `
    )
    .then((res: any) => {
      fastify.log.info(`(getRss) ${url}`)
      return res.rows[0];
    })
    .catch((e: any) => {
      fastify.log.warn(`(getRss) ${e}`);
      return false;
    });
}

const insertMessage = async (data: any, rss_id: number) => {
  return dbClient
    .query(
      `
    insert into message
    (guid,title,link,content,category,rss_id)
    values
    ('${data.guid}','${data.title}','${data.link}','${data.content}','${data.categories}','${rss_id}')
      `
    )
    .then((res: any) => {
      fastify.log.info(`(insertMessage) ${data.guid}`)
      return res.rows;
    })
    .catch((e: any) => {
      fastify.log.warn(`(insertMessage) ${e}`);
      return false;
    });
};


export { getRss, insertMessage };
