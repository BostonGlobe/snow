# snow

This project was generated with [slush-globeapp](https://github.com/BostonGlobe/slush-globeapp). Consult its [README](https://github.com/BostonGlobe/slush-globeapp) for more information.

Please note: do not reproduce Boston Globe logos or fonts without written permission.

## Cronjob

### Setup

- Run `sudo pip install csvkit`
- Run `npm install -g shapefile d3 ndjson-cli mapshaper topojson-server topojson-simplify topojson-client`
- Run `brew install gdal`

### Run

- Every 15 minutes, run `make all`. This will generate `output/snowtotals.topojson`, if there is weather data. Publish this to production.
- If the make task errors out, it most likely means there is no snowfall data. Do nothing.

## Project setup
Clone repo and run `yarn`.

To start the local server, run `gulp`.

## Deploy
#### Step 1: make a project folder on apps
- Either connect to the apps server (`smb://legacydocroot.globe.com/web/bgapps/html/`) or connect to shell and navigate to your directory (`cd /web/bgapps/html/[section]/graphics/[year]/[month]/`).
- If you're using the finder, simply make a new folder in the correct directory with your project name (reference `config.json` for your project name).
- If you're using terminal, `mkdir [your-project-name]`

#### Step 2: gulp
- Run `gulp prod -u username` to deploy. Outputs files into `dist/prod` folder in root.
- Optional: Use the flag `--html` to only upload the index.html file (use this if you have no updates to assets and want faster upload)
- Your graphic is now internally visible at http://dev.apps.bostonglobe.com/[section]/graphics/[year]/[month]/[graphic-name].

#### Step 3: publish assets
- In Terminal, connect to shell (your username is usually first initial last name): `ssh rgoldenberg@shell.boston.com`.
- Navigate to your graphic directory: `cd /web/bgapps/html/[section]/graphics/[year]/[month]/[graphic-name]`.
- Run the command `upload *` in the root **and** each subdirectroy. (ex. `cd css`, then `upload *` to upload all files in that folder).

### Public url
- **https**://apps.bostonglobe.com/[section]/graphics/[year]/[month]/[graphic-name]
- A zipped archive is also pushed to apps. It has the full unminified code for the future when gulp and stuff are fossils.
