import * as urllib from 'urllib';
import { Octokit } from 'octokit';

import sharp = require('sharp');
import OSS = require('ali-oss');

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID || '';
const ACCESS_KEY_SECRET = process.env.ACCESS_KEY_SECRET || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';
const BUCKET_DOMAIN = process.env.BUCKET_DOMAIN;
const BUCKET_REGION = process.env.BUCKET_REGION;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_OCKOKIT;

console.log('GITHUB_TOKEN', GITHUB_TOKEN);

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const client = new OSS({
  accessKeyId: ACCESS_KEY_ID,
  accessKeySecret: ACCESS_KEY_SECRET,
  bucket: BUCKET_NAME,
  region: BUCKET_REGION,
});

export const fetchAvatar = async (users: Array<any>, size: number) => {
  return Promise.all(
    users.map(async ({ name, avatar_url }) => {
      const { data } = await urllib.request(avatar_url, { timeout: 60000 });
      const resized = await sharp(data).resize(size, size).png()
        .toBuffer();
      const avatar_data = `data:image/png;base64,${resized.toString('base64')}`;

      return {
        name,
        avatar_url,
        avatar_data,
      };
    })
  );
};

export const fetchUsers = async (owner: string, repo: string) => {
  const per_page = 100;
  let page = 1;
  let more = true;
  let users: Array<any> = [];

  while (more) {
    const { data } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      page,
      per_page,
    });
    users = users.concat(data);

    if (data.length === 0) {
      more = false;
    } else {
      page++;
    }
  }

  return users
    .sort((a, b) => {
      return b.contributions - a.contributions;
    })
    .map((contributor: any) => {
      const { login, avatar_url } = contributor;
      return {
        name: login,
        avatar_url,
      };
    });
};

export const headObject = async (key: string) => {
  try {
    const cache = await client.head(key);
    return cache;
  } catch (error) {
    return null;
  }
};

export const generateObjectUrl = async (key: string, baseUrl: string | undefined = BUCKET_DOMAIN) => {
  try {
    const url = await client.generateObjectUrl(key, baseUrl);
    return url;
  } catch (error) {
    return null;
  }
};

export const putObject = async (key: string, data: string | Buffer, mime: string) => {
  try {
    const info = await client.put(key, data, {
      mime,
      meta: {
        uid: 0,
        pid: Date.now(),
      },
    });

    return info;
  } catch (error) {
    return null;
  }
};

export const getObject = async (key: string) => {
  try {
    const data = await client.get(key);
    return data;
  } catch (error) {
    return null;
  }
};
