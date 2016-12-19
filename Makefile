clean_all:

	make clean dir=input
	make clean dir=output



clean:

	rm -rf ${dir};
	mkdir ${dir};



download:

	curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > input/snow.tif;



preprocess:

	gdal_calc.py -A input/snow.tif --outfile=output/temp.tif --calc="(A+1)*(A>0)" --NoDataValue=0;
	gdal_calc.py -A output/temp.tif --outfile=output/integered.tif --calc="(A+1)*(A>=1.1) + (A)*(A<1.1)";

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



to_shapefile:

	gdal_polygonize.py output/integered.tif -f "ESRI Shapefile" output/snowtotals.shp;
	ogr2ogr -f "GeoJSON" output/snowtotals.geojson output/snowtotals.shp;



color:

	# Color with pre-integer palette
	gdaldem color-relief input/snow.tif data/color_ramp_default.txt output/input-colored.tif -alpha;
	convert output/input-colored.tif output/input-colored.png;

	# Color with post-integer palette
	gdaldem color-relief output/integered.tif data/color_ramp_default_integered.txt output/integered-colored.tif -alpha;
	convert output/integered-colored.tif output/integered-colored.png;



all: clean_all download preprocess to_shapefile color



testA: clean_all download



testB:
	make clean dir=output
	make preprocess
	make to_shapefile
	make color