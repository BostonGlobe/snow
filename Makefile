clean_all:

	make clean dir=input
	make clean dir=output



clean:

	rm -rf ${dir};
	mkdir ${dir};



download:

	# Download a GeoTiff of the last 24 hours of snowfall.
	curl 'http://mapserv.wxinfoicebox.com/cgi-bin/mapserv?map=/data/mapserver/mapfiles/eventimage.map&SRS=EPSG%3A4326&SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=snow&STYLES=&FORMAT=image%2Ftiff&TRANSPARENT=true&HEIGHT=2000&WIDTH=2000&PERIOD=24&BBOX=-85.5,31.0,-67.0,47.5' > input/snow.tif;

	# Download total snowfall reports for the last 24 hours.
	curl 'http://www.weather.gov//source/erh/hydromet/stormTotalv3_24.point.snow.kml' > input/snow.kml;



preprocess:

	# Using raster arithmetic, join the RGB bands into one.
	# This creates a unique color.
	# Note that this 'hack' works because the R+G+B combination is unique;
	# it wouldn't work if two different colors added up to the same color.
	cd input; \
		gdal_calc.py -A snow.tif -B snow.tif -C snow.tif --A_band=1 --B_band=2 --C_band=3 --outfile=../output/integered.tif --calc="A+B+C"



polygonize:

	# Convert the GeoTiff into polygons.
	gdal_polygonize.py output/integered.tif -f "ESRI Shapefile" output/snowtotals.shp;



presimplify:

	# Convert the snowtotals shapefile to GeoJSON,
	# convert the GeoJSON to newline-delimited JSON,
	# use d3.scaleOrdinal to convert the original snowfall colors (calculated
	# above as R+G+B) to a snowfall number (in inches),
	# and gather up the newline-delimited JSON stream to GeoJSON.
	shp2json output/snowtotals.shp | \
	ndjson-split 'd.features' | \
	ndjson-map -r d3 'd.properties.DN = d3.scaleOrdinal().domain([0,64,229,167,11,142,208,247,192,148,169,216]).range([0,0.1,1,2,4,6,8,10,15,20,25,30])(d.properties.DN), d' | \
	ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' \
	> output/allSnowtotals.geojson;

	# Validate fields with ogr2ogr
	cd output; \
		ogr2ogr -f "GeoJSON" snowtotals-valid.geojson allSnowtotals.geojson \
		-dialect sqlite -sql "select ST_MakeValid(geometry) as geometry, * from allSnowtotals where DN > 0"

	# Dissolve fields with mapshaper
	cd output; \
		mapshaper snowtotals-valid.geojson snap -dissolve DN -o snowtotals.geojson;



reports:

	npm run reports
	cd output; \
		cat reports.json | \
		in2csv -f json | \
		csvjson --lat lat --lon lon > reports.geojson;



topojsonize:

	# Topojsonize and simplify the GeoJSON
	geo2topo output/reports.geojson output/snowtotals.geojson | \
		toposimplify -s 0.00000001 -f | \
		topoquantize 10000 \
		> output/snowtotals.topojson;



deploy:

	cp output/snowtotals.topojson src/assets/snowtotals.topojson



color:

	# Color with pre-integer palette
	gdaldem color-relief input/snow.tif data/color_ramp.txt output/input-colored.tif -alpha;
	convert output/input-colored.tif output/input-colored.png;



input: clean_all download



output:
	make clean dir=output
	make preprocess
	make polygonize
	make presimplify
	make reports
	make topojsonize
	make deploy



all: input output
