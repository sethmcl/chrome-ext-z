output_file = extension.zip

.PHONY: clean build

build:
	grunt

clean:
	rm -rf build
	rm -f $(output_file)

$(output_file): clean build
	cd build && zip -r ../$(@) *
