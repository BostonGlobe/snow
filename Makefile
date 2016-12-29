clean_all:

	make clean dir=input
	make clean dir=output



clean:

	rm -rf ${dir};
	mkdir ${dir};



download:

	# Download specified day's 24 hours of snowfall
	curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > input/snow.tif;



preprocess:

	# Use raster arithmetic to 'promote' less-than-1 values to their own integer
	gdal_calc.py -A input/snow.tif --outfile=output/integered.tif --calc="(A*1000)";



polygonize:

	# Polygonize the raster tif
	gdal_polygonize.py output/integered.tif -f "ESRI Shapefile" output/snowtotals.shp;



presimplify:

	# Simplify the shapefile by using a threshold scale
	shp2json output/snowtotals.shp | \
	ndjson-split 'd.features' | \
	ndjson-map -r d3 'd.properties.DN = d3.scaleThreshold().domain([0*1000,0.001*1000,0.1*1000,1*1000,2*1000,3*1000,4*1000,6*1000,8*1000,10*1000,12*1000,15*1000,18*1000,21*1000,24*1000,30*1000,36*1000]).range([0,0,0.001,0.1,1,2,3,4,6,8,10,12,15,18,21,24,30,36])(d.properties.DN), d' | \
	ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' \
	> output/allSnowtotals.geojson;

	# Validate fields with ogr2ogr
	cd output; \
		ogr2ogr -f "GeoJSON" snowtotals-valid.geojson allSnowtotals.geojson \
		-dialect sqlite -sql "select ST_MakeValid(geometry) as geometry, * from allSnowtotals where DN > 0"

	# Dissolve fields with mapshaper
	cd output; \
		mapshaper snowtotals-valid.geojson snap -dissolve DN -o snowtotals.geojson;
		# mapshaper snowtotals-valid.geojson snap -dissolve DN -filter-slivers -o snowtotals.geojson;



reports:

	# Grab latest reports
	curl 'http://cache.boston.com/partners/snowfallscraper/snowfall_scraper.json' | \
		in2csv -f json | \
		csvjson --lat Latitude --lon Longitude > output/allReports.geojson;

	# Clip reports to snowfall
	cd output; \
		mapshaper allReports.geojson -clip snowtotals.geojson -o reports.geojson;



topojsonize:

	# Topojsonize and simplify the GeoJSON
	geo2topo output/reports.geojson output/snowtotals.geojson | \
		toposimplify -s 0.0000001 -f | \
		topoquantize 10000 \
		> output/snowtotals.topojson;



deploy:

	cp output/snowtotals.topojson src/assets/snowtotals.topojson



color:

	# Color with pre-integer palette
	gdaldem color-relief input/snow.tif data/color_ramp_default.txt output/input-colored.tif -alpha;
	convert output/input-colored.tif output/input-colored.png;



all: clean_all download preprocess polygonize presimplify reports topojsonize deploy



input: clean_all download



output:
	make clean dir=output
	make preprocess
	make polygonize
	make presimplify
	make reports
	make topojsonize
	make deploy
	make color



post-lite:
	make presimplify
	make topojsonize
