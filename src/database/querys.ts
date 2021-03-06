import { dbClient } from "./connection";
import Fastify from "fastify";

const fastify = require("fastify")({
  logger: true,
});

const getRss = async (url: string) => {
  return dbClient
    .query(
      `
      select * from rss
      where url = '${url}'
        `
    )
    .then((res: any) => {
      fastify.log.info(`(getRss) ${url}`);
      return res.rows[0];
    })
    .catch((e: any) => {
      fastify.log.warn(`(getRss) ${e}`);
      return false;
    });
};

const insertMessage = async (data: any, rss_id: number) => {
  return dbClient
    .query(
      `
    insert into message
    (guid,title,link,content,category,rss_id,tokens)
    values
    ('${data.guid}','${data.title}','${data.link}','${data.content}','${data.categories}','${rss_id}',to_tsvector('${data.title}'))
      `
    )
    .then((res: any) => {
      fastify.log.info(`(insertMessage) ${data.guid}`);
      return res.rows;
    })
    .catch((e: any) => {
      fastify.log.warn(`(insertMessage) ${e}`);
      return false;
    });
};

const timeSeries = async (series: series, limit: number, rss_id: number) => {
  return dbClient
    .query(
      `
SELECT
    date_trunc('${series}', created_at) as ${series},
    COUNT (*)
FROM
    message
WHERE 
	rss_id = ${rss_id}
GROUP BY
  ${series}
ORDER BY
  ${series}
LIMIT ${limit};
      `
    )
    .then((res: any) => {
      fastify.log.info(`(timeSeries) ${rss_id}`);
      return res.rows;
    })
    .catch((e: any) => {
      fastify.log.warn(`(timeSeries) ${e}`);
      return false;
    });
};

type series = "day" | "week" | "month" | "year";

const bulkMessageInsert = (data: any, rss_id: any) => {
  var packed = '';
  for (var i in data) {
    const pack = `('${data[i].guid}','${data[i].title}','${data[i].link}','${data[i].content}','${data[i].categories}','${rss_id}','${data[i].title}')`;
    packed += pack + ",";
  }

  packed = packed.slice(0, -1)

  return dbClient
    .query(
      `
    insert into message
    (guid,title,link,content,category,rss_id,tokens)
    values
    ${packed}
    ON CONFLICT DO NOTHING
      `
    )
    .then((res: any) => {
      fastify.log.info(`(bulkMessageInsert) PASS`);
      return res.rows;
    })
    .catch((e: any) => {
      fastify.log.warn(`(bulkMessageInsert) ${e} , ${packed}`);
      return false;
    });
};

export { getRss, insertMessage,bulkMessageInsert };
