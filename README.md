# RADFish CLI

![test and build workflow](https://github.com/NMFS-RADFish/cli/actions/workflows/run-tests.yml/badge.svg)

![radfish_logo](https://github.com/NMFS-RADFish/boilerplate/assets/11274285/f0c1f78d-d2bd-4590-897c-c6ec87522dd1)

# USAGE

The cli supports executing the program via cli with or without arguments.

The program also supports only adding certain arguments. In this case, the program will recognize which arguments are missing, and prompt the user to add the rest of them via cli.

In the project root:

`npx create-radfish-app` and the program will prompt you to add in the required fields (region and type)

Or

`npx create-radfish-app --region=alaska --type=evtr`
