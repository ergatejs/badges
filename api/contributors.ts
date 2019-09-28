import Octokit = require('@octokit/rest');
import { NowRequest, NowResponse } from '@now/node';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const calcGrid = (width: number, size: number, padding: number, length: number) => {
  if (!width) {
    return [ 1, 1 ];
  }
  const cols = Math.floor(width / (size + padding));
  const rows = Math.ceil(length / cols);
  return [ cols, rows ];
};

const fetchUsers = async (owner: string, repo: string) => {
  // const users = ['thonatos', 'atian25', 'dead-horse', 'fengmk2', 'gxcsoccer', 'popomore', 'okoala'];
  // return users.map(name => {
  //   return {
  //     name,
  //     avatar: `https://github.com/${name}.png`,
  //   };
  // });
  // // avatar: `data:image/png;base64,${data.toString('base64')}`,
  // const { data } = await urllib.request(avatar, { followRedirect: true });

  const { data } = await octokit.repos.listContributors({
    owner,
    repo,
  });

  return data.map((contributor: any) => {
    const { login, avatar_url } = contributor;
    return {
      name: login,
      avatar: avatar_url,
    };
  });
};

const fetchAvatar = (users: Array<any>) => {
  return users.map(({ name, avatar }) => {
    return {
      name,
      avatar,
    };
  });
};

export default async (req: NowRequest, res: NowResponse) => {
  const { org = 'eggjs', repo = 'egg', owner = 'eggjs', width = 216, padding = 8, size = 64 } = req.query;

  if (!owner || !org || !repo) {
    res.status(401).send('owner | organization | repo is missing!');
  }

  const w = Number(width);
  const p = Number(padding);
  const s = Number(size);

  const users = await fetchUsers((org || owner) as string, repo as string);
  const links = await fetchAvatar(users);
  const [ cols, rows ] = calcGrid(w, s, p, users.length);

  const h = rows * (s + p);

  const hrefs = links.map(({ name, avatar }, index) => {
    const x = index % cols;
    const y = Math.floor(index / cols);
    const px = s * x + p * (x + 1);
    const py = s * y + p * (y + 1);

    // <a xlink:href="https://github.com/dependabot[bot]" class="opencollective-svg" target="_blank" id="dependabot[bot]"><image x="626" y="74" width="64" height="64" xlink:href="" /></a>
    return `
    <a xlink:href="https://github.com/${name}" class="badges-contributor-svg" target="_blank" id="${name}">
      <image x="${px}" y="${py}" width="${s}" height="${s}" xlink:href="${avatar}" />
    </a>
    `;
  });

  // render
  const content = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}">
    <style>.badges-contributors-svg { cursor: pointer; }</style>
    ${hrefs.join('')}
  </svg>
  `;

  res.setHeader('content-type', 'image/svg+xml; charset=utf-8');
  return res.status(200).send(content);
};
