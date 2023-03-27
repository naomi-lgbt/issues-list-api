import { AggregateData } from "../interfaces/AggregateData";
import { FilteredIssue } from "../interfaces/FilteredIssue";
import { logHandler } from "../utils/logHandler";

/**
 * Checks for new opportunities to contribute.
 *
 * @param {AggregateData} cache The cached GitHub Data.
 */
export const postNewIssues = async (cache: AggregateData) => {
  logHandler.log("info", "Posting new issues that are ready for contribution.");
  const allIssues: FilteredIssue[] = Object.values(cache).reduce(
    (acc, val) => acc.concat(val.issues),
    []
  );
  const unassignedIssues = allIssues.filter((el) => !el.assignee);
  const readyForDevIssues = unassignedIssues.filter((el) =>
    el.labels.find((label) => label.name === "🏁 status: ready for dev")
  );
  const openForContributionIssues = readyForDevIssues.filter(
    (el) =>
      el.labels.find((label) => label.name === "good first issue") ||
      el.labels.find((label) => label.name === "help wanted")
  );
  const newIssues = openForContributionIssues.filter(
    (el) => !el.labels.find((label) => label.name === "posted to discord")
  );

  logHandler.log("info", `Found ${newIssues.length} new issues.`);
  for (const issue of newIssues) {
    const [owner, repo] = issue.repository_url.split("/").slice(-2);
    const isFirstTimers = !!issue.labels.find(
      (label) => label.name === "good first issue"
    );
    logHandler.log(
      "info",
      `Processing issue #${issue.number} on ${owner}/${repo}.`
    );
    // add label
    const addLabel = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/labels`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
        method: "POST",
        body: JSON.stringify({
          labels: ["posted to discord"],
        }),
      }
    );
    const addLabelResponse = await addLabel.json();
    console.log(addLabelResponse);

    // post to discord
    const discordMessage = await fetch(process.env.DISCORD_WEBHOOK as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        content: `Heya <@&1090040102090190909>~! [Issue #${issue.number}](${
          issue.url
        }) on ${owner}/${repo} is ready for contribution!\n\n${
          isFirstTimers
            ? "This issue is for first-time contributors only. If you have contributed to this project before, please stay tuned for additional opportunities.\n\n"
            : ""
        }Please be sure to follow our [contributing guidelines](https://contribute.nhcarrigan.com)`,
      }),
    });
    console.log(`Posted to Discord? ${discordMessage.ok}`);
  }
};
