# This Makefile is meant to run every 15 minutes.
# It requests weather data, both snow depth polygons and snow depth station
# reports, and updates `src/assets/snowtotals.topojson`.



clean_all:

	make clean dir=input
	make clean dir=output
	make setup_input


clean:

	rm -rf ${dir};
	mkdir ${dir};



setup_input:
	mkdir input/combine_6h



download:
	# Download a GeoTiff of the last 6 hours, 24 hours, and season totals of snowfall.
	# TODO: use gdal_calc.py to merge 6hr tiffs into a 24 hour tiff
	npm run geotiff;
	# Download total snowfall reports for the last 24 hours as a KML file.
	curl 'http://www.weather.gov//source/erh/hydromet/stormTotalv3_24.point.snow.kml' > input/snow.kml;
	# Download a GeoTiff of the forecast (TODO).
	# curl 'http://digital.weather.gov/wms.php?LAYERS=ndfd.conus.totalsnowamt&FORMAT=image%2Ftiff&TRANSPARENT=TRUE&VERSION=1.3.0&VT=2017-02-10T06%3A00&EXCEPTIONS=INIMAGE&SERVICE=WMS&REQUEST=GetMap&STYLES=&CRS=EPSG%3A3857&BBOX=-9517816.46282,3632749.14338,-7458405.88315,6024072.11937&WIDTH=2000&HEIGHT=2000' > input/forecast.tif;

6h_files := $(wildcard input/combine_6h/*.tiff)
24h_date := $(subst 6h_, ,$(basename $(notdir $(word 1, $(wildcard input/6h_*.tiff)))))
combine_6h:
	gdal_calc.py \
	-A $(word 1, $(6h_files)) \
	-B $(word 2, $(6h_files)) \
	-C $(word 3, $(6h_files)) \
	-D $(word 4, $(6h_files)) \
	--outfile=input/24h_$(word 1, $(24h_date)).tiff \
	--NoDataValue=0 \
	--calc="(A*(A >= 0)) + (((B*(B >= 0))-(A*(A >= 0)))*(((B*(B >= 0)) - (A*(A >= 0))) > 0)) + (((C*(C >= 0))-(B*(B >= 0)))*(((C*(C >= 0)) - (B*(B >= 0))) > 0)) + (((D*(D >= 0))-(C*(C >= 0)))*(((D*(D >= 0)) - (C*(C >= 0))) > 0))";



polygonize:
	# Convert the GeoTiffs into polygons.
	for file in $(basename $(notdir $(wildcard input/*.tiff))); do \
		echo $$file; \
		python ./python/gdal_polygonize.py input/$$file.tiff -p -f "ESRI Shapefile" output/$$file.shp; \
	done;


shapefiles := $(basename $(notdir $(wildcard output/*.shp)))
presimplify:
	# Convert the snowtotals shapefile to GeoJSON,
	# convert the GeoJSON to newline-delimited JSON,
	# use d3.scaleOrdinal to convert the original snowfall colors (calculated
	# above as R+G+B) to a snowfall number (in inches),
	# and gather up the newline-delimited JSON stream to GeoJSON.
	# Use mapshaper to merge polygons of same snowfall value.
	@echo $(findstring total, $(shapefiles));
	for shapefile in $(shapefiles); do \
		if [[ $$shapefile = *"total"* ]]; then \
			DOMAINRANGE='[0,6,12,18,24,30,36,42,48,54,60,66]'; \
		else \
			DOMAINRANGE='[0,0.1,1,2,4,6,8,10,15,20,25,30]'; \
		fi; \
		shp2json output/$$shapefile.shp | \
		ndjson-split 'd.features' | \
		ndjson-map -r d3 'd.properties.DN = d3.scaleQuantile().domain('"$$DOMAINRANGE"').range('"$$DOMAINRANGE"')(d.properties.DN), d' | \
		ndjson-filter 'd.properties.DN > 0' | \
		ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", name: "allSnowtotals", features: []}' \
		> output/$$shapefile.geojson; \
		cd output; \
		mapshaper $$shapefile.geojson snap -dissolve DN -o force $$shapefile.geojson; \
		cd ../; \
	done;

	# shp2json output/$$shapefile.shp | \
	# ndjson-split 'd.features' | \
	# ndjson-map -r d3 'd.properties.DN = d3.scaleQuantile().domain([0,0.1,1,2,4,6,8,10,15,20,25,30]).range([0,0.1,1,2,4,6,8,10,15,20,25,30])(d.properties.DN), d' | \
	# ndjson-filter 'd.properties.DN > 0' | \
	# ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", name: "allSnowtotals", features: []}' \
	# > output/$$shapefile.geojson; \
	# cd output; \
	# mapshaper $$shapefile.geojson snap -dissolve DN -o force $$shapefile.geojson; \
	# cd ../; \

reports:
	# Parse downloaded XML reports into JSON,
	# and use csvkit to convert to GeoJSON.
	# TODO: figure out a new datasource for reports
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



input: clean_all download combine_6h



output:
	make clean dir=output
	# make preprocess
	make polygonize
	make presimplify
	# make reports
	make topojsonize
	make deploy



all: input output
