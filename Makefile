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
	gdal_calc.py -A input/snow.tif --outfile=output/temp.tif --calc="(A+1)*(A>0)" --NoDataValue=0;
	gdal_calc.py -A output/temp.tif --outfile=output/integered.tif --calc="(A+1)*(A>=1.1) + (A)*(A<1.1)";

	# gdal_calc.py -A input/snow.tif --outfile=output/integered.tif --calc="(A*1000)";


	# original              first pass                             second pass
	# ------------------------------------------------------------------------
	#        0             (A+1)*(A>0)            (A+1)*(A>=1.1) + (A)*(A<1.1)
	#      0.1             (A+1)*(A>0)            (A+1)*(A>=1.1) + (A)*(A<1.1)
	#      1.1             (A+1)*(A>0)            (A+1)*(A>=1.1) + (A)*(A<1.1)
	#      2.1             (A+1)*(A>0)            (A+1)*(A>=1.1) + (A)*(A<1.1)
  
  # original              first pass                             second pass
	# ------------------------------------------------------------------------
	#        0                       0                                       0
	#    0.001                   1.001                                   1.001
	#      0.1                     1.1                                     2.1
	#      1.1                     2.1                                     3.1
	#      2.1                     3.1                                     4.1



polygonize:

	# Polygonize the raster tif
	gdal_polygonize.py output/integered.tif -f "ESRI Shapefile" output/snowtotals.shp;
	ogr2ogr -f "GeoJSON" output/snowtotals.geojson output/snowtotals.shp;



	# # Convert GeoJSON to TopoJSON
	# geo2topo output/snowtotals.geojson | \
	# 	toposimplify -s 0.0000001 -f > output/snowtotals.topojson; \
	# 	cp output/snowtotals.topojson src/assets/snowtotals.topojson;
	# ndjson-split 'd.features' > test.ndjson;
	# ndjson-map 'd.DN = d.DN / 1000' \

# topomerge states=counties -k 'd.id.slice(0, 2)' < us-counties.json > us-states.json

# var color = d3.scaleThreshold()
# 	.domain([0.001*1000,0.1*1000,1*1000,2*1000,3*1000,4*1000,6*1000,8*1000,10*1000,12*1000,15*1000,18*1000,21*1000,24*1000,30*1000,36*1000])
# 	.range([0,0.001,0.1,1,2,3,4,6,8,10,12,15,18,21,24,30,36])

# console.log(color(0.1))



topojsonize:

	shp2json output/snowtotals.shp | \
	ndjson-split 'd.features' | \
	ndjson-map -r d3 'd.properties.name = "gabriel", d' | \
	ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' | \
	geo2topo | \
	topomerge snowtotals=- -k 'd.properties.name' | \
	topo2geo snowtotals=output/snowtotals.geojson;


no:
	> output/final-topo.json;

	geo2topo > output/final-topo.json;

color:

	# Color with pre-integer palette
	gdaldem color-relief input/snow.tif data/color_ramp_default.txt output/input-colored.tif -alpha;
	convert output/input-colored.tif output/input-colored.png;

	# Color with post-integer palette
	gdaldem color-relief output/integered.tif data/color_ramp_default_integered.txt output/integered-colored.tif -alpha;
	convert output/integered-colored.tif output/integered-colored.png;



all: clean_all download preprocess polygonize topojsonize color



testA: clean_all download



testB:
	make clean dir=output
	make preprocess
	make polygonize
	# make color