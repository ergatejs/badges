import { NowRequest, NowResponse } from '@now/node';
import { render, validateHead } from '../lib/utils';
import { fetchAvatar, fetchUsers, putObject, headObject, getObject } from '../lib/curl';

const STORAGE_PREFIX = process.env.STORAGE_PREFIX || 'contributors';

export default async (req: NowRequest, res: NowResponse) => {
  const { repo = 'egg', org = 'eggjs', owner = 'eggjs', size = 64, width = 216, padding = 8 } = req.query;

  if (!owner || !org || !repo) {
    res.status(401).send('owner | organization | repo is missing!');
  }

  const prefix = org || owner;
  const key = `${STORAGE_PREFIX}/${prefix}/${repo}.svg`;
  const head = await headObject(key);

  let content;
  let cached = false;

  if (validateHead(head)) {
    const badge = await getObject(key);

    cached = true;
    content = badge && badge.content;
  } else {
    const w = Number(width);
    const s = Number(size);
    const p = Number(padding);

    const users = await fetchUsers(prefix as string, repo as string);
    const links = await fetchAvatar(users, s);

    content = render(links, { w, s, p });

    await putObject(key, Buffer.from(content));
  }

  res.setHeader('content-type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Accept-Encoding', 'gzip');
  res.setHeader('x-ergatejs-cache', cached ? 'HIT' : 'MISSING');

  return res.status(200).send(content);
};
