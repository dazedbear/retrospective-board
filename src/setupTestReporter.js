const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { IncomingWebhook } = require('@slack/client');
const packageJSON = require('../package.json');

class CustomTestReporter {
	constructor(globalConfig, options) {
		this._globalConfig = globalConfig;
		this._options = options;

		// utils
		this.nodeVersionFormat = this.nodeVersionFormat.bind(this);
		this.sanitizeThreshold = this.sanitizeThreshold.bind(this);

		// for slack
		this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
		this.gitCommitHash = process.env.REACT_APP_COMMITHASH;
		this.gitBranch = process.env.REACT_APP_BRANCH;
		this.setting = {
			threshold: this.sanitizeThreshold(packageJSON.coverageThreshold),
			result: {
				pass: { text: 'passed', color: '#36a64f' },
				fail: { text: 'failed', color: '#dc5547' },
			},
		};
	}

	// '>=6.9' -> '>= 6.9'
	nodeVersionFormat(nodeVersion) {
		const splitPoint = nodeVersion.search(/\d/);
		const version = nodeVersion.substr(splitPoint);
		return nodeVersion.replace(/ /g, '').replace(version, ` ${version}`);
	}

	sanitizeThreshold(threshold) {
		if (typeof threshold === 'undefined') {
			return 80;
		} else if (threshold > 100) {
			return 100;
		} else if (threshold < 0) {
			return 0;
		}
		return threshold;
	}

	onRunComplete(test, report) {
		if (!report.coverageMap) {
			console.log(
				chalk.grey(
					'Bypass update test badges in README due to coverageMap not found.'
				)
			);
			return report;
		}

		// NOTE: 更新測試狀態 & node 版本到 README
		const coverageSummary = report.coverageMap.getCoverageSummary();
		const statementsCoverage = Math.floor(coverageSummary.statements.pct);
		const linesCoverage = Math.floor(coverageSummary.lines.pct);
		const branchesCoverage = Math.floor(coverageSummary.branches.pct);
		const functionsCoverage = Math.floor(coverageSummary.functions.pct);
		const totalCoverage = parseFloat(
			(
				(statementsCoverage +
					linesCoverage +
					branchesCoverage +
					functionsCoverage) /
				4
			).toFixed(2)
		);
		const readmePath = path.join(__dirname, '../README.md');
		const colors = {
			0: 'red',
			1: 'red',
			2: 'red',
			3: 'red',
			4: 'red',
			5: 'orange',
			6: 'yellow',
			7: 'yellowgreen',
			8: 'green',
			9: 'brightgreen',
			10: 'brightgreen',
		};
		const coverageColor = colors[Math.floor(totalCoverage / 10)];
		const coverageBadge = `![Coverage Status](https://img.shields.io/badge/coverage-${totalCoverage}%25-${coverageColor}.svg)`;
		const testsBadge = `![Tests Status](https://img.shields.io/badge/tests-${
			report.numPassedTests
		}%20passed,%20${report.numFailedTests}%20failed,%20${
			report.numPendingTests
		}%20skipped-orange.svg)`;
		const nodeBadge = `![Node version](https://img.shields.io/badge/node-${encodeURIComponent(
			packageJSON.engines.node
		)}-brightgreen.svg)`;

		let readme = fse.readFileSync(readmePath, { encoding: 'utf-8' });

		readme = readme
			.replace(/!\[Coverage Status\]\(\S*\.svg\)/gi, coverageBadge)
			.replace(/!\[Tests Status\]\(\S*\.svg\)/gi, testsBadge)
			.replace(/!\[Node version\]\(\S*\.svg\)/gi, nodeBadge)
			.replace(
				/\* node.*\n/i,
				`* node ${this.nodeVersionFormat(packageJSON.engines.node)}\n`
			);

		fse.writeFileSync(readmePath, readme);

		// NOTE: 發送 test coverage 資訊到 slack
		if (!this.webhookUrl) {
			console.log(
				chalk.grey(
					'Bypass send test coverage to slack due to SLACK_WEBHOOK_URL not found in env.'
				)
			);
			return report;
		}
		const webhook = new IncomingWebhook(this.webhookUrl);
		let thresholdResult =
			totalCoverage >= this.setting.threshold
				? this.setting.result.pass
				: this.setting.result.fail;

		let payload = {
			username: 'Test Coverage',
			text: '*Test Coverage Notification*',
			mrkdwn: true,
			attachments: [
				{
					color: thresholdResult.color,
					mrkdwn_in: ['text', 'title'],
					text: `Check test coverage ${thresholdResult.text} of ${
						packageJSON.name
					}.`,
					fields: [
						{
							title: 'Total Coverage',
							value: `${totalCoverage}%`,
							short: true,
						},
						{
							title: 'Threshold',
							value: `${this.setting.threshold}%`,
							short: true,
						},
						{
							title: 'Statements',
							value: `${statementsCoverage}%`,
							short: true,
						},
						{
							title: 'Functions / Methods',
							value: `${functionsCoverage}%`,
							short: true,
						},
						{
							title: 'Branches',
							value: `${branchesCoverage}%`,
							short: true,
						},
						{
							title: 'Lines',
							value: `${linesCoverage}%`,
							short: true,
						},
					],
				},
			],
		};

		const isValidRepoUrl = /github:[\w\-_]+\/[\w\-_]+/i.test(
			packageJSON.repository
		);
		if (isValidRepoUrl && this.gitCommitHash && this.gitBranch) {
			const projectIdentifier = packageJSON.repository.replace('github:', '');

			payload.attachments[0].text = `Check ${
				thresholdResult.text
			} of <https://github.com/${projectIdentifier}/commits/${
				this.gitCommitHash
			}|#${this.gitCommitHash}> at ${projectIdentifier}@${this.gitBranch}.`;
		}

		// Send simple text to the webhook channel
		return webhook
			.send(payload)
			.then(res => {
				console.log(
					chalk.white('Send test coverage message to slack success.')
				);
				return report;
			})
			.catch(e => {
				console.log(chalk.red(e));
				console.log(chalk.red('Send test coverage message to slack Faild.'));
				return report;
			});
	}
}

module.exports = CustomTestReporter;
