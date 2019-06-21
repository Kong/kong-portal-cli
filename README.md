# Kong Developer Portal CLI
[![License](https://img.shields.io/github/license/kong/kong-portal-cli.svg)][cli-license]

The Kong Developer Portal CLI is used to manage your Developer Portals from the 
command line. It is built using [clipanion][clipanion].

## Overview

This is the next generation TypeScript based Developer Portal CLI. The goals of 
this project were to make higher quality CLI tool over the initial sync script.

This project is built for Kong Enterprise `>= 0.36`.

For Kong Enterprise `<= 0.35`, [use the legacy sync script][sync-script].

## Install

```
> npm install -g kong-portal-cli
```

## Contributing

For problems directly related to the CLI, [add an issue on GitHub][cli-support].

For other issues, [submit a support ticket][kong-support].

[Contributors][cli-contributors]

[clipanion]: https://github.com/arcanis/clipanion
[sync-script]: https://github.com/Kong/kong-portal-templates/blob/81382f2c7887cf57bb040a6af5ca716b83cc74f3/bin/sync.js
[cli-support]: https://github.com/Kong/kong-portal-cli/issues/new
[cli-license]: https://github.com/Kong/kong-portal-cli/blob/master/LICENSE
[cli-contributors]: (https://github.com/Kong/kong-portal-cli/contributors)
[kong-support]: https://support.konghq.com/support/s/
