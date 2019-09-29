import { NowRequest, NowResponse } from '@now/node';

export default async (req: NowRequest, res: NowResponse) => {

  const content = 'Badges Service.';

  res.setHeader('Accept-Encoding', 'gzip');
  return res.status(200).send(content);
};
