import fs from 'fs'
import moment from 'moment'
import { argv } from 'yargs'

const filename = argv.filename
const filepath = `${process.cwd()}/output/${filename}.geojson`
const geojson = JSON.parse(fs.readFileSync(filepath, 'utf8'))
const fileArray = filename.split('_')
const type = fileArray[0]
const datetime = fileArray[1]


geojson.properties = {
  type,
  datetime
}

fs.writeFile(filepath, JSON.stringify(geojson), err => {
  if (err) throw err;
})
