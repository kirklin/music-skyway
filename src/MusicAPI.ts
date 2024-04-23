import querystring from "node:querystring";
import axios from "axios";
import { MusicCrypto } from "./MusicCrypto";

export class MusicAPI {
  private USERAGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0";
  private COOKIE = "os=ios; osver=Microsoft-Windows-10-Professional-build-10586-64bit; appver=8.7.01; channel=netease; __remember_me=true;";
  private REFERER = "http://music.163.com/";

  constructor(COOKIE: string) {
    this.COOKIE = COOKIE;
  }

  async sendRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, querystring.stringify(data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this.USERAGENT,
          "Referer": this.REFERER,
          "Cookie": this.COOKIE,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async login(phone: string, password: string, countrycode: string = "86") {
    const url = "https://music.163.com/weapi/login/cellphone";
    const requestData = {
      phone,
      countrycode,
      password,
      rememberLogin: true,
    };
    return await this.sendRequest(url, MusicCrypto.encrypt(requestData));
  }

  async getUserDetail(uid: number | string) {
    const url = `https://music.163.com/weapi/v1/user/detail/${uid}`;
    return await this.sendRequest(url, MusicCrypto.encrypt({}));
  }

  async recommend() {
    const url = "https://music.163.com/weapi/v1/discovery/recommend/resource";
    const data = { csrf_token: "" };
    const json = await this.sendRequest(url, MusicCrypto.encrypt(data));
    return json.recommend.map((item: { id: any }) => item.id);
  }

  // 听音乐函数，playlistId 是播放列表的 ID，time 是播放次数
  async listen(playlistId: number, time: number = 1) {
    const logs: any[] = [];
    let count = 0;
    let t = 1;

    // 构造日志数据
    const constructLogs = (trackIds: number[]) => {
      for (const trackId of trackIds) {
        logs.push({
          action: "play",
          json: {
            download: 0,
            end: "playend",
            id: trackId,
            sourceId: "",
            time: 120,
            type: "song",
            wifi: 0,
          },
        });
        count++;
      }
    };

    // 主逻辑
    while (t <= time) {
      const songIds = await this.getPlaylistSongIds(playlistId);
      constructLogs(songIds);
      t++;
    }

    // 将日志数据转换为 JSON 字符串
    const data = JSON.stringify(logs);

    // 发送播放日志数据到服务器
    const url = "http://music.163.com/weapi/feedback/weblog";
    await this.sendRequest(url, MusicCrypto.encrypt({ logs: data }));

    // 返回结果
    return { code: 200, count };
  }

  // 获取歌单中的歌曲 ID 列表
  async getSongIds(playlistId: number) {
    const url = `https://music.163.com/weapi/v6/playlist/detail?csrf_token=`;
    const requestData = {
      id: playlistId,
      n: 1000,
      csrf_token: "",
    };
    const response = await this.sendRequest(url, MusicCrypto.encrypt(requestData));
    return response.playlist.trackIds;
  }

  // 获取歌单中的歌曲 ID 列表，并返回只包含 ID 的数组
  async getPlaylistSongIds(playlistId: number) {
    const trackIds = await this.getSongIds(playlistId);
    return trackIds.map((item: any) => item.id);
  }
}
