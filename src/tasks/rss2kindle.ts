import { RssParser } from "../utils/rss-parser";
import { Item } from "rss-parser";
import { sendEmail } from "../lib/email";
import { htmlToEpub } from "../lib/converter";
import fs from "fs/promises";
import envs from "../envs";
import Redis from "ioredis";

const getFetchRss = async (redis: Redis) => {
    let response = await redis.get("kindle/rss");
    const fetchedRSS = response ? JSON.parse(response) : [];
    return fetchedRSS;
};

const checkForRssUpdates = async (redis: Redis, RssUrl: string) => {
    const feed = await RssParser.parseURL(RssUrl);
    const fetchedRSS = await getFetchRss(redis);
    const unReadItems = feed.items.filter((item: any) => {
        if (item && item.enclosure && item.enclosure.type.includes("audio"))
            return false;
        return !fetchedRSS?.includes(item.guid);
    });
    return unReadItems;
};

const updateFetchedRss = async (redis: Redis, unReadItems: Item[]) => {
    const fetchedRSS = await getFetchRss(redis);
    const unReadItemsGuid = unReadItems.map((item: any) => item.guid) || [];
    const allItemsGuid = Array.from(new Set([...fetchedRSS, ...unReadItemsGuid]));
    redis.set("kindle/rss", JSON.stringify(allItemsGuid));
};

// 主函数
export async function rss2kindle(rssUrls: string[]) {
    const redis = new Redis(envs.value.redis.url);
    try {
        for (const url of rssUrls) {
            try {
                const unreadItems = await checkForRssUpdates(redis, url);
                if (!unreadItems?.length) {
                    console.log(`[rss2kindle] ${url} 没有新的未读条目`);
                    continue;
                }

                const feed = await RssParser.parseURL(url);

                console.log(`[rss2kindle] ${url} 未读条目数: ${unreadItems.length}`);

                for (const item of unreadItems) {
                    try {
                        const title = (item.title || "Untitled").trim();
                        const html = item.content

                        if (!html) {
                            console.warn(`[rss2kindle] 跳过（无 HTML）：${title}`);
                            continue;
                        }

                        const author = item.creator || feed.title || "";
                        await htmlToEpub(title, author, html);

                        // 邮件发送
                        const output = `/tmp/${title}.epub`;
                        await sendEmail(output, title);
                        console.log(`[rss2kindle] 已发送：${title}`);

                        await fs.unlink(output).catch((err) => {
                            console.warn(`[rss2kindle] 删除文件失败 ${output}`, err);
                        });

                        await updateFetchedRss(redis, [item]);
                    } catch (err) {
                        // 单条失败不影响后续
                        console.error(`[rss2kindle] 处理失败：${item?.title || "Untitled"}`, err);
                    }
                }
            } catch (err) {
                console.error(`[rss2kindle] 拉取 RSS 出错：${url}`, err);
            }
        }
    } finally {
        // 确保 Redis 连接关闭
        console.log("🛑 Closing Redis connection...");
        await redis.quit();
        console.log("👋 Task completed.");
    }
}