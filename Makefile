clean_all:

	make clean dir=input
	make clean dir=output

clean:

	rm -rf ${dir};
	mkdir ${dir};

download:

	curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > input/snow.tif;

preprocess:

	gdal_calc.py -A input/snow.tif --outfile=output/snow.tif \
		--calc="(A+1)*(A>=0.1)" --NoDataValue=0

to_shapefile:

	gdal_polygonize.py output/snow.tif -f "ESRI Shapefile" output/snow.shp;
	# python ~/Desktop/gdal_polygonize.py input/snow.tif -f "ESRI Shapefile" -p output/snow.shp;
	ogr2ogr -where 'DN >= 0' -f "GeoJSON" output/snow.geojson output/snow.shp;

to_topojson:

	geo2topo output/snow.geojson | \
		toposimplify \
		> output/snow.json

color:

	gdaldem color-relief output/snow.tif color_ramp_default.txt output/output.tif -alpha;
	convert output/output.tif output/output.png;

all: clean_all download preprocess to_shapefile to_topojson color

test:
	make clean dir=output
	make preprocess
	make to_shapefile
	make to_topojson














