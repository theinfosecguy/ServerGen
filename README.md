<h1 align=center>
ServerGen - Setup Server & MVC within seconds<br>
<a href> <img src="https://user-images.githubusercontent.com/33570148/110940836-89153e00-835d-11eb-9fa7-2cc1e46834ff.png" height=350/></a>
</h1>

# Get your Node/Express Server Ready within seconds

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [Future Scope](#future-scope)
- [License](#license)

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

```bash
npm install servergen
```

**NPM Package**: [ServerGen](https://www.npmjs.com/package/servergen)

## Features

- MVC Directory Structure
- Multiple View Engine Support (Pug, EJS, HBS)
- Gitignore and Docker Support
- Express/Node Server Boilerplate
- Mongoose Boilerplate for MongoDB

## Usage

Usage: `servergen [options]`

### Options

```
  -V, --version           output the version number
  -f, --framework <type>  Enter Name of Framework: Node | Express
  -n, --name <type>       Enter Name of App
  -v, --view <type>       Name of View Engine: Pug | EJS | HBS
  -p, --port <number>     Set the port for the generated app (default: 3000)
  --db                    Install Mongoose & the Folder Directory for it
  --skip-install          Skip the npm install step
  --debug                 Enable debug logging
  -h, --help              display help for command
```

## Future Scope

- Add Swagger Documentation
- Add Passport Authentication
- Sequelize ORM for MySQL and PostgreSQL

## License

[MIT](LICENSE)
