clean_all:

	make clean dir=input
	make clean dir=output

clean:

	rm -rf ${dir};
	mkdir ${dir};

download:

	# curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > input/snow.tif;
	curl 'http://www.nohrsc.noaa.gov/snowfall/data/201612/snfl_2016093012_to_2016121512.tif' > input/snow.tif;

preprocess:

	gdal_calc.py -A input/snow.tif --outfile=output/temp.tif --calc="(A+1)*(A>0)" --NoDataValue=0;
	gdal_calc.py -A output/temp.tif --outfile=output/snow.tif --calc="(A+1)*(A>=1.1) + (A)*(A<1.1)";

to_shapefile:

	gdal_polygonize.py output/snow.tif -f "ESRI Shapefile" output/snow.shp;
	ogr2ogr -f "GeoJSON" output/snow.geojson output/snow.shp;
	cp output/snow.geojson src/assets/snow.geojson;

# to_topojson:

# 	geo2topo output/snow.geojson | \
# 		toposimplify \
# 		> output/snow.json

color:

	# gdaldem color-relief output/snow.tif data/color_ramp_default.txt output/output.tif -alpha;
	gdaldem color-relief input/snow.tif data/color_ramp_season.txt output/input-colored.tif -alpha;
	convert output/input-colored.tif output/input-colored.png;

# all: clean_all download preprocess to_shapefile to_topojson color
# all: clean_all download preprocess to_shapefile color
all: clean_all download color

test:
	make clean dir=output
	make preprocess
	make to_shapefile
	make to_topojson
	# make color
