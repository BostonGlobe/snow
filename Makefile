clean_all:

	make clean dir=input
	make clean dir=output

clean:

	rm -rf ${dir};
	mkdir ${dir};

download:

	curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > input/snow.tif;

to_shapefile:

	gdal_polygonize.py input/snow.tif -f "ESRI Shapefile" output/snow.shp;
	ogr2ogr -where 'DN >= 0' -f "GeoJSON" output/snow.geojson output/snow.shp;

to_topojson:

	geo2topo output/snow.geojson | \
		toposimplify \
		> output/snow.json

color:

	gdaldem color-relief input/snow.tif color_ramp_default.txt output/output.tif -alpha;
	convert output/output.tif output/output.png;

all: clean_all download to_shapefile to_topojson color

