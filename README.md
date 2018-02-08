# Voodoo Dashboard - Spending and Revenue

This app is meant to be used in a development environment. It isn't ready for production yet, but could be made so quickly, with a few adjustments to the npm scripts and build process.

## Installation

Start by installing the dependencies with `npm install`.

Accessing the external APIs requires (unversioned) keys. You need to initialize them, either with a local unversioned json file or with environment variables. Other settings can be overridden in the same manner, such as the server's port number.

Note: the key for the monetization API should be entered without the expected "Bearer " prefix.

### Using local json file

You can either copy the `config/development.json.dist` and rename it to `config/development.json` then update the file with the appropriate keys.

### Environment variable

You can use an environment value when starting the server, as such:
```bash
$ export NODE_CONFIG='{"acquisitionApi":{"key":"your_key"},"monetizationApi":{"key":"your_key"}}' && npm start
# don't forget to unset it if you don't need it anymore in the current session
$ unset NODE_CONFIG
```

## Usage

Once the API keys are set, you can directly execute `npm start`, which will run the build process and start the express web server on the port defined in the `config/default.json` file (default is 8000).