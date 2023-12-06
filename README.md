# USAGE

The cli supports executing the program via cli with or without arguments.

The program also supports only adding certain arguments. In this case, the program will recognize which arguments are missing, and prompt the user to add the rest of them via cli.

During local development, you can take two approaches to running this cli program.

1. `npm link` to create a sim link on your local machine to emulate the npm registry (without having to publish the package itself)
2. Running via `package.json` directly as an npm script

## Option 1

In the project where you're testing the CLI tool (ie the root of this project):

`npm link create-radfish-app`

Then either

`create-radfish-app` and the program will prompt you to add in the required fields (region and type)

Or

`create-radfish-app --region=alaska --type=evtr`

## Option 2

In the root of the cli project run

`npm run create-radfish-app` and the program will prompt you to add in the required fields (region and type)

Or

`npm run create-radfish-app -- --region=alaska --type=evtr`
