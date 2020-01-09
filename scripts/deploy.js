const { promisify } = require('util')
const { publish } = require('gh-pages')
const ghpublish = promisify(publish)

/* fix for "Unhandled promise rejections" */
process.on('unhandledRejection', err => { throw err })

const branch = 'gh-pages'
const org = 'status-im'
const repo = 'liquid-funding'
/* use SSH auth by default */
const repoUrl = `git@github.com:${org}/${repo}.git`

/* alternative auth using GitHub user and API token */
if (process.env.GH_USER != undefined) {
  repoUrl = ( 
    'https://' + process.env.GH_USER +
    ':' + process.env.GH_TOKEN +
    '@' + `github.com/${org}/${repo}.git`
  )
}

const main = async (url, branch)=> {
  console.log(`Pushing to: ${url}`)
  console.log(`On branch: ${branch}`)
  await ghpublish('build', {
    repo: url,
    branch: branch,
    dotfiles: true,
    silent: false
  })
}

main(repoUrl, branch)
