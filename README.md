# Voodoo Dashboard - Spending and Revenue

## Installation

Accessing the external APIs requires (unversioned) keys. You need to initialize them, either with a local unversioned json file or with environment variables.

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
