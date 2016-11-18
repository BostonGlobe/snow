clean:

	rm -rf tmp;
	mkdir tmp;

download:

	curl 'http://www.nohrsc.noaa.gov/snowfall/data/${year}${month}/snfl_b2_${year}${month}${day}12_R150_L30_G0.20.tif' > tmp/snow.tif;

color:

	gdaldem color-relief tmp/snow.tif color_ramp.txt tmp/output.tif;

all: clean download color