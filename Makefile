all: minify

minify:
	cat \
	 lib/flatui/js/jquery-1.8.2.min.js \
	 lib/flatui/js/jquery-ui-1.10.0.custom.min.js \
	 lib/flatui/js/jquery.dropkick-1.0.0.js \
	 lib/flatui/js/custom_checkbox_and_radio.js \
	 lib/flatui/js/custom_radio.js \
	 lib/flatui/js/jquery.tagsinput.js \
	 lib/flatui/js/bootstrap.js \
	 lib/flatui/js/jquery.placeholder.js \
	 | uglifyjs > assets/js/flatui-deps.js
