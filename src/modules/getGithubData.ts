import fetch from "node-fetch";

import { orgList } from "../configs/Organisations";
import { AggregateData } from "../interfaces/AggregateData";
import { Issue } from "../interfaces/Issue";
import { Pull } from "../interfaces/Pull";
import { Repository } from "../interfaces/Repository";
import { logHandler } from "../utils/logHandler";

/**
 * Updates the cached data.
 *
 * @param {AggregateData} cache The cached GitHub Data.
 */
export const getGithubData = async (cache: AggregateData) => {
  logHandler.log("info", "Updating GitHub data!");
  for (const org of orgList) {
    logHandler.log("info", `Getting data for ${org}`);
    cache[org].issues = [];
    cache[org].pulls = [];

    const orgUrl =
      org === "naomi-lgbt"
        ? `https://api.github.com/users/${org}/repos?type=owner&per_page=100`
        : `https://api.github.com/orgs/${org}/repos?type=public&per_page=100`;

    const rawRepos = await fetch(orgUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
    const repos = (await rawRepos.json()) as Repository[];

    for (const repo of repos) {
      const rawIssues = await fetch(
        `https://api.github.com/repos/${org}/${repo.name}/issues?state=open&per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        }
      );

      const issues = (await rawIssues.json()) as Issue[];
      cache[org].issues.push(
        ...issues
          .filter((el) => !el.pull_request && el.user.login !== "renovate[bot]")
          .map(
            ({
              html_url,
              repository_url,
              number,
              state,
              title,
              labels,
              user,
              assignee,
            }) => ({
              url: html_url,
              repository_url,
              number,
              state,
              title,
              labels,
              user,
              assignee,
            })
          )
      );

      const rawPulls = await fetch(
        `https://api.github.com/repos/${org}/${repo.name}/pulls?state=open&per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        }
      );

      const pulls = (await rawPulls.json()) as Pull[];
      cache[org].pulls.push(
        ...pulls.map(
          ({ html_url, number, state, title, labels, user, assignee }) => ({
            url: html_url,
            number,
            state,
            title,
            labels,
            user,
            assignee,
          })
        )
      );
    }
  }
};
