// const fs = require('fs');
// const Octokit = require('@octokit/rest');
// const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// const octokit = new Octokit({
//   auth: GITHUB_TOKEN,
// });

// (async () => {
//   const owner = 'eggjs';
//   const repo = 'egg';
//   const per_page = 100;

//   let page = 1;
//   let more = true;
//   let users: Array<any> = [];

//   while (more) {
//     console.log('fetch', page);

//     const { data } = await octokit.repos.listContributors({
//       owner,
//       repo,
//       page,
//       per_page,
//     });

//     users = users.concat(data);

//     if (data.length === 0) {
//       more = false;
//     } else {
//       page++;
//     }
//   }

//   console.log('done');
//   fs.writeFileSync('a.json', JSON.stringify(users));
// })();
