import * as urllib from 'urllib';
import { NowRequest, NowResponse } from '@now/node';

const calcGrid = (width: number, size: number, padding: number, length: number) => {
  if (!width) {
    return [ null, 1 ];
  }
  const cols = Math.floor(width / (size + padding));
  const rows = Math.ceil(length / cols);
  return [ cols, rows ];
};

const fetchUsers = async (owner: string | string[], repo: string | string[]) => {
  // const users = ['thonatos', 'atian25', 'dead-horse', 'fengmk2', 'gxcsoccer', 'popomore', 'okoala'];
  // return users.map(name => {
  //   return {
  //     name,
  //     avatar: `https://github.com/${name}.png`,
  //   };
  // });

  const { data } = await urllib.request(`https://api.github.com/repos/${owner}/${repo}/stats/contributors`, {
    timeout: 600000,
    contentType: 'json',
    dataType: 'json',
  });

  return data.map(({ author }) => {
    const { login, avatar_url } = author;
    return {
      name: login,
      avatar: avatar_url,
    };
  });
};

const fetchAvatar = async (users: Array<any>) => {
  const links: Array<any> = await Promise.all(
    users.map(async ({ name, avatar }) => {
      // const { data } = await urllib.request(avatar, { followRedirect: true });
      return {
        name,
        // data: `data:image/png;base64,${data.toString('base64')}`,
        data: avatar,
      };
    })
  );

  return links;
};

export default async (req: NowRequest, res: NowResponse) => {
  const {
    org = 'eggjs',
    repo = 'egg',
    owner = 'eggjs',
    width = 216,
    padding = 8,
    size = 64,
  } = req.query;

  const w = Number(width);
  const p = Number(padding);
  const s = Number(size);

  const users = await fetchUsers(org || owner, repo);
  const links = await fetchAvatar(users);
  const [ cols, rows ] = calcGrid(w, s, p, users.length);

  const h = rows * (s + p);

  const hrefs = links.map(({ name, data }, index) => {
    const x = index % cols;
    const y = Math.floor(index / cols);
    const px = s * x + p * (x + 1);
    const py = s * y + p * (y + 1);

    // <a xlink:href="https://github.com/dependabot[bot]" class="opencollective-svg" target="_blank" id="dependabot[bot]"><image x="626" y="74" width="64" height="64" xlink:href="" /></a>
    return `
    <a xlink:href="https://github.com/${name}" class="badges-contributor-svg" target="_blank" id="${name}">
      <image x="${px}" y="${py}" width="${s}" height="${s}" xlink:href="${data}" />
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
