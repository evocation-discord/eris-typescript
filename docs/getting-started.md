# Getting Started as an Eris Developer

### Prerequisites
Eris is built to run on any kind of environment or operating system.

### Style Guide
Eris follows most of the **[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)**.
We expect all of our developers to follow this style guide.
Before you either push a commit or create a Pull Request, please check if there are no linter errors present. We recommend using Visual Studio Code (or [VSCodium](https://vscodium.com), if you're concerned about your privacy) with the ESLint plugin installed for automatic linting.

### Before Committing
We have adopted **[Conventional Commits](https://www.conventionalcommits.org)** as a ruleset for commit messages. In short, commit messages *must* be formatted using one the following prefixes:

- `build` – for changes made to the build system
- `chore` – for changes that do not change production code
- `ci` – for changes made to Continuous Integration (CI) configuration
- `docs` – for updates made to the documentation
- `feat` – for newly introduced features
- `fix` – for bug fixes and patches
- `improvement` – for overall made improvements
- `perf` – for changes optimizing the overall performance
- `refactor` – for refactored code that does not change the public API
- `revert` – for when reverting back to a previous commit
- `style` – for code style changes (such as indentation)
- `test` – for when adding tests or assertions

**Examples**:

`feat: add support for removing tags`

`chore: add moment as dependency`

You may also specify a scope. We **strongly** encourage you to use scopes, because it's an excellent way of determining what part of the codebase has been changed.

**Example**:

`feat(groups): add ability to remove a group`

### Rules
> Before you get started, **please read the following rules**.
1. **NEVER** share the bot token, your password, repository contents or the repository link with others.
2. Make sure to create a new branch while working on a new feature. This is due to the fact that we'd like to review the code before it gets released.
3. Make sure you've read all of the above and the contents in [#non-disclosure-agreement]() in the development server.

### Installation
1. If you are using Windows, enable [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
2. Install [Docker](https://www.docker.com/get-started), [docker-compose](https://docs.docker.com/compose/install/), [Yarn](https://yarnpkg.com/en/docs/install) and [Git](https:/git-scm.com).
3. [Generate a SSH key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).
4. [Add the SSH key to your GitHub account](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account).
5. Install Node.js v12, if possible through [Node Version Manager](https://github.com/nvm-sh/nvm#installation-and-update) ([windows](https://github.com/coreybutler/nvm-windows#installation--upgrades) click here).
6. Clone this repository to your local drive by running `git clone git@github.com:Evocation-Discord/Eris.git Eris` in the directory you wish to clone Eris in.
7. Fill in the .env file with the required variables.
8. Run `yarn install` to install all dependencies.
9. Run `docker-compose up -d redis mysql`. This will start the MySQL database and Redis. 
10. Run `yarn lint:tsc:watch` to start the typescript code checking.
11. Now open a second terminal using the `Split Terminal` button (Windows: CTRL + SHIFT + S) and run `yarn build:watch`. This will start the build in watch mode.
12. Now open another terminal using the `Split Terminal` button (Windows: CTRL + SHIFT + S) and run `yarn dev`. This will start the bot.
13. Now you have three terminals open, RTL: typescript linter, code builder, bot.

### Useful Commands
The following commands might come in handy:

| Command                    | Description                                                                     |
|----------------------------|---------------------------------------------------------------------------------|
| `yarn dev`                 | Spins up the bot in development mode.                                           |
| `yarn build`               | Builds the bots source.                                                         |
| `yarn build:watch`         | Builds the bots source in watch mode.                                           |
| `yarn start`               | Starts the bot in production mode.                                              |
| `yarn deps`                | Upgrade dependencies.                                                           |
| `yarn lint`                | Runs ESLint.                                                                    |
| `yarn lint:tsc`            | Runs the typescript code checker.                                               |
| `yarn lint:tsc:watch`      | Runs the typescript code checker in watch mode.                                 |
| `yarn lint:fix`            | Runs ESLint & automatically fix linter errors.                                  |
