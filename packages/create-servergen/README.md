# create-servergen

`create-servergen` is the npm create wrapper for the `servergen` CLI.

After this package is published, users can scaffold interactively with:

```sh
npm create servergen@latest
```

Pass arguments after `--` to use the direct CLI path:

```sh
npm create servergen@latest -- my-api --skip-install
```

The wrapper delegates to the installed `servergen` CLI and passes all arguments through unchanged.
