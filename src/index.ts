import process from "node:process";
import dotenv from "dotenv";
import { MusicAPI } from "./MusicAPI";

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中获取需要的值
const cookie = process.env.MUSIC_API_COOKIE || "";
const playlistId = process.env.PLAYLIST_ID || 0;
const batchSize = process.env.BATCH_SIZE ? Number(process.env.BATCH_SIZE) : 1; // 默认每次请求 1 首歌曲
const intervalInSeconds = process.env.INTERVAL_SECONDS ? Number(process.env.INTERVAL_SECONDS) : 120; // 默认每 120 秒执行一次

// 创建 API 实例
const api = new MusicAPI(cookie);

// 定时执行 API 的函数
async function executeApiPeriodically() {
  let executionCount = 0; // 用于统计执行次数

  // 设置定时器，每一定时间间隔执行一次
  const _intervalId = setInterval(async () => {
    try {
      const result = await api.listen(Number(playlistId), batchSize);
      console.log(`Execution ${++executionCount}:`, result);
    } catch (error) {
      console.error("An error occurred while executing the API:", error);
      // 如果出现错误，你可以选择是否停止定时器
      // clearInterval(intervalId);
    }
  }, intervalInSeconds * 1000); // 将间隔时间转换为毫秒

  // 可选：设置定时器的超时时间，避免长时间运行
  // setTimeout(() => {
  //   clearInterval(intervalId);
  //   console.log("Stopped executing API periodically due to timeout.");
  // }, timeoutInSeconds * 1000);
}

console.log("START");

// 执行定时任务
executeApiPeriodically().catch((error) => {
  console.error("An error occurred while setting up the periodic task:", error);
});
