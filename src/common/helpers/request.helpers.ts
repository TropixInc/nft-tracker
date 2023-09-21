import axios, { AxiosInstance } from 'axios';
import http from 'http'; // If making HTTP calls
import https from 'https'; // If making HTTPS calls

const randomUserAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
];

export class RequestHelpers {
  private static instance: RequestHelpers;
  private axiosInstance: AxiosInstance;

  private constructor() {
    const agentOptions = {
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: 60000,
      keepAliveMsecs: 30000,
    };

    const httpAgent = new http.Agent(agentOptions);
    const httpsAgent = new https.Agent(agentOptions);

    this.axiosInstance = axios.create({
      httpAgent,
      httpsAgent,
      headers: {
        'User-Agent': this.getRandomUserAgent(),
      },
    });
  }

  private getRandomUserAgent() {
    const randomIndex = Math.floor(Math.random() * randomUserAgents.length);
    return randomUserAgents[randomIndex];
  }

  public static getInstance(): RequestHelpers {
    if (!RequestHelpers.instance) {
      RequestHelpers.instance = new RequestHelpers();
    }
    return RequestHelpers.instance;
  }

  public getAxiosInstance(): AxiosInstance {
    this.axiosInstance.defaults.headers['User-Agent'] = this.getRandomUserAgent();
    return this.axiosInstance;
  }
}
