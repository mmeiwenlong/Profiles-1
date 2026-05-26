import cron from "node-cron";
import { handler as fetchLeetcodeDailyQuestionCn } from "./leetcode/dailyquestion-cn";
import { handler as fetchLeetcodeDailyQuestionEn } from "./leetcode/dailyquestion-en";
import { rss2kindle } from "./rss2kindle";

cron.schedule("0 9 * * *", async () => {
    console.log("⏳ Running daily question CN task...");
    await fetchLeetcodeDailyQuestionCn().catch(console.error);
}, {
    timezone: "Asia/Shanghai",
});

cron.schedule("0 9 * * *", async () => {
    console.log("⏳ Running daily question EN task...");
    await fetchLeetcodeDailyQuestionEn().catch(console.error);
}, {
    timezone: "America/Los_Angeles",
});

cron.schedule("*/5 * * * *", async () => {
    console.log("⏳ Running rss2kindle task...");
    await rss2kindle(["https://freshrss.yifwang.com/api/query.php?user=ethanwng97&t=5j1idoREyj74KDasPkH53U&f=rss"]).catch(console.error);
}, {
    timezone: "America/Los_Angeles",
});