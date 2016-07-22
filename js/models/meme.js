/*
 * MemeModel
 * Manages rendering parameters and source image datas.
 */
MEME.MemeModel = Backbone.Model.extend({
    defaults: {
        backgroundPosition: {x: null, y: null},
        //creditText: 'Source:',
        //creditSize: 12,
        downloadName: 'share',
        fontColor: 'white',
        fontFamily: 'Helvetica Neue',
        fontFamilyOpts: ['Helvetica', 'Helvetica Neue', 'Comic Sans MS'],
        fontSize: 24,
        fontSizeOpts: [14, 24, 36],
        headline: 'Write your own headline',
        height: 378,
        imageScale: 1,
        imageSrc: '',
        overlayAlpha: 0.5,
        overlayColor: '#000',
        overlayColorOpts: ['#000', '#777', '#2980b9'],
        paddingRatio: 0.05,
        textAlign: 'left',
        textAlignOpts: ['left', 'center', 'right'],
        textShadow: true,
        viewAllShow: false,
        viewAllEdit: false,
        watermarkAlpha: 0.75,
        watermarkMaxWidthRatio: 0.25,
        viewAllMaxWidthRatio: 0.15,
        watermarkSrc: '',
        watermarkOpts: [],
        viewAllSrc: '',
        textColorRGB: '',
        callout: '',
        calloutColorRGB: '',
        brandImage1Scale: 1,
        brandImage2Scale: 1,
        brandImage3Scale: 1,
        brandImage4Scale: 1,
        brandImage1X: 0,
        brandImage1Y: 0,
        brandImage2X: 0,
        brandImage2Y: 0,
        brandImage3X: 0,
        brandImage3Y: 0,
        brandImage4X: 0,
        brandImage4Y: 0,
        width: 755
    },

    // Initialize with custom image members used for background and watermark:
    // These images will (sort of) behave like managed model fields.
    initialize: function () {
        this.background = new Image();
        this.watermark = new Image();
        this.viewAll = new Image();
        this.brandImagesIndex = 0;
        this.brandImages = [new Image(), new Image(), new Image(), new Image()];
        //this.viewAll.setAttribute('crossOrigin', 'anonymous');

        // Set image sources to trigger "change" whenever they reload:
        this.background.onload = this.watermark.onload = this.viewAll.onload =
            this.brandImages[0].onload = this.brandImages[1].onload = this.brandImages[2].onload = this.brandImages[3].onload =
                _.bind(function () {
            this.trigger('change');
        }, this);

        // Set initial image and watermark sources:
        if (this.get('imageSrc')) this.background.src = this.get('imageSrc');
        if (this.get('watermarkSrc')) this.setWatermarkSrc(this.get('watermarkSrc'));
        if (this.get('viewAllSrc')) this.viewAll.src = this.get('viewAllSrc');

        // Update image and watermark sources if new source URLs are set:
        this.listenTo(this, 'change:imageSrc', function () {
            this.background.src = this.get('imageSrc');
        });
        this.listenTo(this, 'change:watermarkSrc', function () {
            this.setWatermarkSrc(this.get('watermarkSrc'));
        });
        this.listenTo(this, 'change:viewALlSrc', function () {
            this.viewAll.src = this.get('viewAllSrc');
        });
    },

    // Specifies if the background image currently has data:
    hasBackground: function () {
        return this.background.width && this.background.height;
    },

    // Loads a file stream into an image object:
    loadFileForImage: function (file, image) {
        var reader = new FileReader();
        reader.onload = function () {
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    },

    // Loads a file reference into the background image data source:
    loadBackground: function (file) {
        this.loadFileForImage(file, this.background);
    },

    // Loads a file reference into the view all image data source:
    loadViewAll: function (file) {
        this.loadFileForImage(file, this.viewAll);
    },

    // Loads a file reference into the brand images image data source:
    loadBrandImages: function (files) {
        for(var i = 0; i < files.length; i++) {
            this.loadFileForImage(files[i], this.brandImages[this.brandImagesIndex]);
            this.brandImagesIndex++;
        }
    },

    // Loads a file reference into the watermark image data source:
   // loadWatermark: function (file) {
   //     this.loadFileForImage(file, this.watermark);
    //},

    // When setting a new watermark "src",
    // this method looks through watermark options and finds the matching option.
    // The option's "data" attribute will be set as the watermark, if defined.
    // This is useful for avoiding cross-origin resource loading issues.
    setWatermarkSrc: function (src) {
        var opt = _.findWhere(this.get('watermarkOpts'), {value: src});
        var data = (opt && opt.data) || src;

        // Toggle cross-origin attribute for Data URI requests:
        if (data.indexOf('data:') === 0) {
            this.watermark.removeAttribute('crossorigin');
        } else {
            this.watermark.setAttribute('crossorigin', 'anonymous');
        }

        this.watermark.src = data;
        this.set('watermarkSrc', src);
    }
});
