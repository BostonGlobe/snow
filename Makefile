# This Makefile is meant to run every 15 minutes.
# It requests weather data, both snow depth polygons and snow depth station
# reports, and updates `src/assets/snowtotals.topojson`.



clean_all:

	make clean dir=input
	make clean dir=output



clean:

	rm -rf ${dir};
	mkdir ${dir};



download:
	# Download a GeoTiff of the last 24 hours of snowfall.
	npm run geotiff;
	#
	# # Download total snowfall reports for the last 24 hours as a KML file.
	curl 'http://www.weather.gov//source/erh/hydromet/stormTotalv3_24.point.snow.kml' > input/snow.kml;
	#http://mapserv.wxinfoicebox.com/cgi-bin/mapserv?map=/data/mapserver/mapfiles/eventimage.map&SRS=EPSG%3A4326&SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=snow&STYLES=&FORMAT=image%2Ftiff&TRANSPARENT=true&HEIGHT=2000&WIDTH=2000&PERIOD=24&BBOX=-133.4,23.7,-67.0,47.5
	# # Download a GeoTiff of the forecast (TODO).
	# curl 'http://digital.weather.gov/wms.php?LAYERS=ndfd.conus.totalsnowamt&FORMAT=image%2Ftiff&TRANSPARENT=TRUE&VERSION=1.3.0&VT=2017-02-10T06%3A00&EXCEPTIONS=INIMAGE&SERVICE=WMS&REQUEST=GetMap&STYLES=&CRS=EPSG%3A3857&BBOX=-9517816.46282,3632749.14338,-7458405.88315,6024072.11937&WIDTH=2000&HEIGHT=2000' > input/forecast.tif;

convert:
	gdal_translate -ot UInt16 -of PNG input/snow.tiff output/snow.png

georeference:

	gdal_translate -of GTiff -a_ullr -9517816.46282 6024072.11937 -7458405.88315 3632749.14338 -a_srs EPSG:3857 input/forecast.tif output/forecast_3857.tif;
	gdalwarp -t_srs "EPSG:4326" output/forecast_3857.tif output/forecast_4326.tif;



preprocess:

	# Using raster arithmetic, join the RGB bands into one.
	# This creates a unique color.
	# Note that this 'hack' works because the R+G+B combination is unique;
	# it wouldn't work if two different colors added up to the same color.
	cd input; \
		gdal_calc.py -A snow.tif -B snow.tif -C snow.tif --A_band=1 --B_band=2 --C_band=3 --outfile=../output/integered.tif --calc="A+B+C"



polygonize:
	# Convert the GeoTiff into polygons.
	for file in $(basename $(notdir $(wildcard input/*.tiff))); do \
		echo $$file; \
		python ./python/gdal_polygonize.py input/$$file.tiff -p -f "ESRI Shapefile" output/$$file.shp; \
	done;
	# gdal_polygonize.py output/forecast_4326.tif -f "ESRI Shapefile" output/forecast.shp;
	# python ./python/gdal_polygonize.py input/snow.tif -p -f "ESRI Shapefile" output/snowtotals.shp;

presimplify:
	# Convert the snowtotals shapefile to GeoJSON,
	# convert the GeoJSON to newline-delimited JSON,
	# use d3.scaleOrdinal to convert the original snowfall colors (calculated
	# above as R+G+B) to a snowfall number (in inches),
	# and gather up the newline-delimited JSON stream to GeoJSON.
	# npm run date -- --filename=$$shapefile;
	for shapefile in $(basename $(notdir $(wildcard output/*.shp))); do \
		shp2json output/$$shapefile.shp | \
		ndjson-split 'd.features' | \
		ndjson-map -r d3 'd.properties.DN = d3.scaleQuantile().domain([0,0.1,1,2,4,6,8,10,15,20,25,30]).range([0,0.1,1,2,4,6,8,10,15,20,25,30])(d.properties.DN), d' | \
		ndjson-filter 'd.properties.DN > 0' | \
		ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", name: "allSnowtotals", features: []}' \
		> output/$$shapefile.geojson; \
		cd output; \
		mapshaper $$shapefile.geojson snap -dissolve DN -o force $$shapefile.geojson; \
		cd ../; \
	done;

	# Use ogr2ogr to validate geometries and remove polygons with no snowfall.
	# cd output; \
	# 	ogr2ogr -f "GeoJSON" snowtotals-valid.geojson allSnowtotals.geojson \
	# 	-dialect sqlite -sql "select ST_MakeValid(geometry) as geometry, * from OGRGeoJSON where DN > 0"

	# Use mapshaper to merge polygons of same snowfall value.
	# cd output; \
	# 	mapshaper allSnowtotals.geojson snap -dissolve DN -o snowtotals.geojson;



reports:

	# Parse downloaded XML reports into JSON,
	# and use csvkit to convert to GeoJSON.
	npm run reports
	cd output; \
		cat reports.json | \
		in2csv -f json | \
		csvjson --lat lat --lon lon > reports.geojson;



topojsonize:
	# Combine reports and snowfall polygons into one topojson file,
	# and simplify and quantize them.
	geo2topo $$(ls output/*.geojson) | \
		toposimplify -s 0.00000001 -f | \
		topoquantize 10000 \
		> output/snowtotals.topojson;



deploy:

	# Copy final topojson file to src/assets.
	cp output/snowtotals.topojson src/assets/snowtotals.topojson



input: clean_all download



output:
	make clean dir=output
	# make preprocess
	make polygonize
	make presimplify
	# make reports
	make topojsonize
	make deploy



all: input output
