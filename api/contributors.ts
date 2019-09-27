import urllib from 'urllib';
import { NowRequest, NowResponse } from '@now/node';

const calc = (width: number, size: number, padding: number, length: number) => {
  if (!width) {
    return [null, 1];
  }

  const cols = Math.floor(width / (size + padding));
  const rows = Math.ceil(length / cols);

  return [cols, rows];
};

export default async (req: NowRequest, res: NowResponse) => {
  const { org = 'eggjs', type = 'flat', width = 216, size = 64, padding = 8 } = req.query;
  const users = ['thonatos', 'atian25', 'dead-horse', 'fengmk2', 'gxcsoccer', 'popomore', 'okoala'];
  // const { data: list } = await urllib.request('https://api.github.com/repos/eggjs/egg/stats/contributors', {
  //   timeout: 60000,
  //   contentType: 'json',
  //   dataType: 'json',
  // });

  // console.log(list);

  // const users = list.map(({ author }) => {
  //   const { login, avatar_url } = author;
  //   return {
  //     name: login,
  //     avatar: avatar_url,
  //   };
  // });

  const w = Number(width);
  const p = Number(padding);
  const s = Number(size);

  const [cols, rows] = calc(w, s, p, users.length);

  const h = rows * (s + p);

  const links: Array<any> = await Promise.all(
    users.map(async name => {
      const avatar = `https://github.com/${name}.png`;
      const { data } = await urllib.request(avatar, { followRedirect: true });
      return {
        name,
        data: `data:image/png;base64,${data.toString('base64')}`,
      };
    })
  );

  const hrefs = links.map(({ name, data }, index) => {
    const x = index % cols;
    const y = Math.floor(index / cols);

    const px = s * x + p * (x + 1);
    const py = s * y + p * (y + 1);
    // <a xlink:href="https://github.com/dependabot[bot]" class="opencollective-svg" target="_blank" id="dependabot[bot]"><image x="626" y="74" width="64" height="64" xlink:href="" /></a>
    return `
    <a xlink:href="https://github.com/${name}" class="badges-contributor-svg" target="_blank" id="${name}">
      <image x="${px}" y="${py}" width="${s}" height="${s}" xlink:href="${data}" />
    </a>`;
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
