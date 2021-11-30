import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {

  const content = 'Badges Service.';

  res.setHeader('Accept-Encoding', 'gzip');
  return res.status(200).send(content);
};
