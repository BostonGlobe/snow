clean:

	rm -rf tmp;
	mkdir tmp;

download:

	curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > tmp/snow.tif;

color:

	gdalwarp -te -83 24 -66 50 tmp/snow.tif tmp/clipped_snow.tif;
	gdaldem color-relief tmp/clipped_snow.tif color_ramp.txt tmp/output.tif -alpha;
	convert tmp/output.tif tmp/output.png;

all: clean download color
