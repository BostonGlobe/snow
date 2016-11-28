clean_all:

	make clean dir=input
	make clean dir=output

clean:

	rm -rf ${dir};
	mkdir ${dir};

download:

	curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > input/snow.tif;

to_shapefile:

	gdal_polygonize.py input/snow.tif -f "GeoJSON" output/snow.geojson;

to_topojson:

	geo2topo output/snow.geojson | \
		toposimplify \
		> output/snow.topojson

all: clean_all download to_shapefile to_topojson