import sharp = require('sharp');

const COLORS = {
  WHITE: {
    r: 255,
    g: 255,
    b: 255,
  },
  BLACK: {
    r: 0,
    g: 0,
    b: 0,
  },
};

export const convertFormat = async (src: string, type: string, bg: string) => {
  const buf = Buffer.from(src);

  let data = buf;

  if (type === 'png') {
    data = await sharp(buf)
      .png()
      .toBuffer();
  }

  if (type === 'jpeg') {
    const flattenOptions = bg === 'white' ? { background: COLORS.WHITE } : { background: COLORS.BLACK };

    data = await sharp(buf)
      .flatten(flattenOptions)
      .jpeg()
      .toBuffer();
  }

  return data;
};

export const validateHead = (head: any) => {
  if (!head || !head.meta || !head.meta.pid) {
    return;
  }

  const created = head.meta.pid;
  const current = Date.now();
  const duration = (current - created) / 1000;

  if (duration > 3000) {
    return;
  }

  return true;
};

export const calcGrid = (width: number, size: number, padding: number, length: number) => {
  if (!width) {
    return [ 1, 1 ];
  }
  const cols = Math.floor(width / (size + padding));
  const rows = Math.ceil(length / cols);
  return [ cols, rows ];
};

export const render = (links: Array<any>, pos: IPosition) => {
  const { w, s, p } = pos;
  const [ cols, rows ] = calcGrid(w, s, p, links.length);
  const h = rows * (s + p) + p;

  const hrefs = links.map(({ name, avatar_data }, index) => {
    const x = index % cols;
    const y = Math.floor(index / cols);
    const px = s * x + p * (x + 1);
    const py = s * y + p * (y + 1);

    // <a xlink:href="https://github.com/dependabot[bot]" class="opencollective-svg" target="_blank" id="dependabot[bot]"><image x="626" y="74" width="64" height="64" xlink:href="" /></a>
    return `
    <a xlink:href="https://github.com/${name}" class="badges-contributor-svg" target="_blank" id="${name}">
      <image x="${px}" y="${py}" width="${s}" height="${s}" xlink:href="${avatar_data}" />
    </a>
    `;
  });

  // render
  const content = `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Badges Services - https://badges.implements.io -->
    <style>.badges-contributor-svg { cursor: pointer; }</style>
    ${hrefs.join('')}
  </svg>
  `;

  return content;
};

interface IPosition {
  w: number;
  s: number;
  p: number;
}
