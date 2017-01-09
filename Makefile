clean_all:

	make clean dir=input
	make clean dir=output



clean:

	rm -rf ${dir};
	mkdir ${dir};



download:

	# Download last 24 hours of snowfall
	cd input; \
		curl 'http://mapserv.wxinfoicebox.com/cgi-bin/mapserv?map=/data/mapserver/mapfiles/eventimage.map&SRS=EPSG%3A4326&SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=snow&STYLES=&FORMAT=image%2Ftiff&TRANSPARENT=true&HEIGHT=2000&WIDTH=2000&PERIOD=24&BBOX=-85.5,31.0,-67.0,47.5' > snow.tif; \
		curl 'http://www.weather.gov//source/erh/hydromet/stormTotalv3_24.point.snow.kml' > snow.kml;



preprocess:

	# Use raster arithmetic to compute DN as R+G+B
	cd input; \
		gdal_calc.py -A snow.tif -B snow.tif -C snow.tif --A_band=1 --B_band=2 --C_band=3 --outfile=../output/integered.tif --calc="A+B+C"



polygonize:

	# Polygonize the raster tif
	gdal_polygonize.py output/integered.tif -f "ESRI Shapefile" output/snowtotals.shp;



presimplify:

	# Simplify the shapefile by using a threshold scale
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
	gdaldem color-relief input/snow.tif data/color_ramp_default.txt output/input-colored.tif -alpha;
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
