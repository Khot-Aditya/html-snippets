#! /usr/bin/env node

import * as fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { execSync } from "child_process";
const __dirname = dirname(fileURLToPath(import.meta.url));
const CURR_DIR = process.cwd();

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: `inherit` });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    return false;
  }
  return true;
};

const copyDirectoryContents = (templatePath, newProjectPath) => {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = `${templatePath}/${file}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, "utf8");

      // Rename
      if (file === ".npmignore") file = ".gitignore";

      const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

      // recursive call
      createDirectoryContents(
        `${templatePath}/${file}`,
        `${newProjectPath}/${file}`
      );
    }
  });
};

inquirer
  .prompt([
    {
      name: "project_name",
      type: "input",
      message: `${chalk.blue("Enter Project Name:")}`,
      default: "html-project",
      validate: function (input) {
        if (/^([A-Za-z\-\\_\d])+$/.test(input)) return true;
        else
          return "Project name may only include letters, numbers, underscores and hashes.";
      },
    },
    {
      name: "framework",
      type: "list",
      message: `${chalk.blue("Select CSS Frame Work:")}`,
      choices: ["Tailwind", "Bootstrap", "none"],
      default: "Tailwind",
    },
  ])
  .then((answers) => {
    const projectName = answers["project_name"];
    const framework = answers["framework"];

    fs.mkdirSync(`${CURR_DIR}/${projectName}`);

    if (framework === "Tailwind") {
      copyDirectoryContents(`${__dirname}/template/tailwind`, projectName);
      runCommand(`cd ${projectName} && npm install`);

      console.log(
        `\n${chalk.green(
          "Congratulations🥳🎉."
        )} Now to run project use ${chalk.blue("'npm run start'")} command.\n`
      );
    } else if (framework === "Bootstrap") {
      copyDirectoryContents(`${__dirname}/template/bootstrap`, projectName);
    } else {
      copyDirectoryContents(`${__dirname}/template/none`, projectName);
    }

    console.log(
      `\n${chalk.green(
        "Congratulations🥳🎉."
      )} Project created, have fun coding...\n`
    );
  })
  .catch((error) => {
    console.log(error);
  });
