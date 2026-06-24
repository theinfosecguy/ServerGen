# create-servergen

`create-servergen` is the npm create wrapper for the `servergen` CLI.

After this package is published, users can scaffold with:

```sh
npm create servergen@latest -- my-api --skip-install
```

The wrapper delegates to the installed `servergen` CLI and passes all arguments through unchanged.
