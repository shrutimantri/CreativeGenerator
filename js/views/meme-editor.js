/*
 * MemeEditorView
 * Manages form capture, model updates, and selection state of the editor form.
 */
MEME.MemeEditorView = Backbone.View.extend({

    initialize: function () {
        this.buildForms();
        this.listenTo(this.model, 'change', this.render);
        this.render();
        //this.deserializeFormData();
    },

    // Builds all form options based on model option arrays:
    buildForms: function () {
        var d = this.model.toJSON();

        function buildOptions(opts) {
            return _.reduce(opts, function (memo, opt) {
                return memo += ['<option value="', opt.hasOwnProperty('value') ? opt.value : opt, '">', opt.hasOwnProperty('text') ? opt.text : opt, '</option>'].join('');
            }, '');
        }

        //$('.colorpicker-default').colorpicker({
        //        format: 'hex'
        //});

        if (d.textShadowEdit) {
            $('#text-shadow').parent().show();
        } else {
            $('#text-shadow').parent().hide();
        }

        if (d.viewAllEdit) {
            $('#view-all').parent().show();
        } else {
            $('#view-all').parent().hide();
        }

        // Build text alignment options:
        if (d.textAlignOpts && d.textAlignOpts.length) {
            $('#text-align').append(buildOptions(d.textAlignOpts)).show();
        }

        // Build font size options:
        if (d.fontSizeOpts && d.fontSizeOpts.length) {
            $('#font-size').append(buildOptions(d.fontSizeOpts)).show();
        }

        // Build font family options:
        if (d.fontFamilyOpts && d.fontFamilyOpts.length) {
            $('#font-family').append(buildOptions(d.fontFamilyOpts)).show();
        }

        // Build watermark options:
        if (d.watermarkOpts && d.watermarkOpts.length) {
            $('#watermark').append(buildOptions(d.watermarkOpts)).show();
        }

        // Build overlay color options:
        if (d.overlayColorOpts && d.overlayColorOpts.length) {
            var overlayOpts = _.reduce(d.overlayColorOpts, function (memo, opt) {
                var color = opt.hasOwnProperty('value') ? opt.value : opt;
                return memo += '<li><label><input class="m-editor__swatch" style="background-color:' + color + '" type="radio" name="overlay" value="' + color + '"></label></li>';
            }, '');

            $('#overlay').show().find('ul').append(overlayOpts);
        }
    },

    render: function () {
        var d = this.model.toJSON();
        this.$('#headline').val(d.headline);
        this.$('#credit').val(d.creditText);
        this.$('#cta').val(d.cta);
        this.$('#watermark').val(d.watermarkSrc);
        this.$('#textColorRGB').val(d.textColorRGB);
        this.$('#uspText1').val(d.uspText1);
        this.$('#uspText2').val(d.uspText2);
        this.$('#uspText3').val(d.uspText3);
        this.$('#callout').val(d.callout);
        this.$('#calloutColorRGB').val(d.calloutColorRGB);
        this.$('#image-scale').val(d.imageScale);
        this.$('#brand-image-scale-1').val(d.brandImage1Scale);
        this.$('#brand-image-scale-2').val(d.brandImage2Scale);
        this.$('#brand-image-scale-3').val(d.brandImage3Scale);
        this.$('#brand-image-scale-4').val(d.brandImage4Scale);
        this.$('#brand-image-1-x').val(d.brandImage1X);
        this.$('#brand-image-1-y').val(d.brandImage1Y);
        this.$('#brand-image-2-x').val(d.brandImage2X);
        this.$('#brand-image-2-y').val(d.brandImage2Y);
        this.$('#brand-image-3-x').val(d.brandImage3X);
        this.$('#brand-image-3-y').val(d.brandImage3Y);
        this.$('#brand-image-4-x').val(d.brandImage4X);
        this.$('#brand-image-4-y').val(d.brandImage4Y);
        this.$('#font-size').val(d.fontSize);
        this.$('#font-family').val(d.fontFamily);
        this.$('#text-align').val(d.textAlign);
        this.$('#text-shadow').prop('checked', d.textShadow);
        this.$('#view-all').prop('checked', d.viewAllShow);
        this.$('#overlay').find('[value="' + d.overlayColor + '"]').prop('checked', true);
    },

    events: {
        'input #headline': 'onHeadline',
        'input #uspText1': 'onUspText1',
        'input #uspText2': 'onUspText2',
        'input #uspText3': 'onUspText3',
        'input #call_out': 'onCalloutText',
        'input #calloutColorRGB': 'onCalloutColorRGB',
        'input #credit': 'onCredit',
        'input #cta': 'onCTA',
        'input #textColorRGB': 'onTextColorRGB',
        'input #image-scale': 'onScale',
        'input #brand-image-scale-1': 'onBrandScale1',
        'input #brand-image-scale-2': 'onBrandScale2',
        'input #brand-image-scale-3': 'onBrandScale3',
        'input #brand-image-scale-4': 'onBrandScale4',
        'input #brand-image-1-x': 'onBrandImageX1',
        'input #brand-image-2-x': 'onBrandImageX2',
        'input #brand-image-3-x': 'onBrandImageX3',
        'input #brand-image-4-x': 'onBrandImageX4',
        'input #brand-image-1-y': 'onBrandImageY1',
        'input #brand-image-2-y': 'onBrandImageY2',
        'input #brand-image-3-y': 'onBrandImageY3',
        'input #brand-image-4-y': 'onBrandImageY4',
        'change #font-size': 'onFontSize',
        'change #font-family': 'onFontFamily',
        'change #watermark': 'onWatermark',
        'change #text-align': 'onTextAlign',
        'change #text-shadow': 'onTextShadow',
        'change #view-all': 'onViewAll',
        'change [name="overlay"]': 'onOverlayColor',
        'dragover #dropzone': 'onZoneOver',
        'dragleave #dropzone': 'onZoneOut',
        'drop #dropzone': 'onZoneDrop',
        'dragover #viewAll': 'onViewAllOver',
        'dragleave #viewAll': 'onViewAllOut',
        'drop #viewAll': 'onViewAllDrop',
        'dragover #brand_img': 'onBrandImageOver',
        'dragleave #brand_img': 'onBrandImageOut',
        'drop #brand_img': 'onBrandImageDrop',
        'click #load-old-banner': 'deserializeFormData'
    },

    onCredit: function () {
        this.model.set('creditText', this.$('#credit').val());
    },

    onCTA: function () {
        this.model.set('cta', this.$('#cta').val());
    },

    onHeadline: function () {
        this.model.set('headline', this.$('#headline').val());
    },

    onUspText1: function () {
        this.model.set('uspText1', this.$('#uspText1').val());
    },

    onUspText2: function () {
        this.model.set('uspText2', this.$('#uspText2').val());
    },

    onUspText3: function () {
        this.model.set('uspText3', this.$('#uspText3').val());
    },

    onCalloutText: function () {
        this.model.set('callout', this.$('#callout').val());
    },

    onCalloutColorRGB: function () {
        this.model.set('calloutColorRGB', this.$('#calloutColorRGB').val());
    },

    onTextAlign: function () {
        this.model.set('textAlign', this.$('#text-align').val());
    },

    onTextShadow: function () {
        this.model.set('textShadow', this.$('#text-shadow').prop('checked'));
    },

    onTextColorRGB: function () {
        this.model.set('textColorRGB', this.$('#textColorRGB').val());
    },

    onViewAll: function () {
        this.model.set('viewAllShow', this.$('#view-all').prop('checked'));
    },

    onFontSize: function () {
        this.model.set('fontSize', this.$('#font-size').val());
    },

    onFontFamily: function () {
        this.model.set('fontFamily', this.$('#font-family').val());
    },

    onWatermark: function () {
        this.model.set('watermarkSrc', this.$('#watermark').val());
        if (localStorage) localStorage.setItem('meme_watermark', this.$('#watermark').val());
    },

    onBrandImageX1: function () {
        this.model.set('brandImage1X', this.$('#brand-image-1-x').val());
    },

    onBrandImageY1: function () {
        this.model.set('brandImage1Y', this.$('#brand-image-1-y').val());
    },

    onBrandImageX2: function () {
        this.model.set('brandImage2X', this.$('#brand-image-2-x').val());
    },

    onBrandImageY2: function () {
        this.model.set('brandImage2Y', this.$('#brand-image-2-y').val());
    },

    onBrandImageX3: function () {
        this.model.set('brandImage3X', this.$('#brand-image-3-x').val());
    },

    onBrandImageY3: function () {
        this.model.set('brandImage3Y', this.$('#brand-image-3-y').val());
    },

    onBrandImageX4: function () {
        this.model.set('brandImage4X', this.$('#brand-image-4-x').val());
    },

    onBrandImageY4: function () {
        this.model.set('brandImage4Y', this.$('#brand-image-4-y').val());
    },

    onScale: function () {
        this.model.set('imageScale', this.$('#image-scale').val());
    },

    onBrandScale1: function () {
        this.model.set('brandImage1Scale', this.$('#brand-image-scale-1').val());
    },

    onBrandScale2: function () {
        this.model.set('brandImage2Scale', this.$('#brand-image-scale-2').val());
    },

    onBrandScale3: function () {
        this.model.set('brandImage3Scale', this.$('#brand-image-scale-3').val());
    },

    onBrandScale4: function () {
        this.model.set('brandImage4Scale', this.$('#brand-image-scale-4').val());
    },

    onOverlayColor: function (evt) {
        this.model.set('overlayColor', this.$(evt.target).val());
    },

    getDataTransfer: function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        return evt.originalEvent.dataTransfer || null;
    },

    onZoneOver: function (evt) {
        var dataTransfer = this.getDataTransfer(evt);
        if (dataTransfer) {
            dataTransfer.dropEffect = 'copy';
            this.$('#dropzone').addClass('pulse');
        }
    },

    onZoneOut: function (evt) {
        this.$('#dropzone').removeClass('pulse');
    },

    onZoneDrop: function (evt) {
        var dataTransfer = this.getDataTransfer(evt);
        if (dataTransfer) {
            this.model.loadBackground(dataTransfer.files[0]);
            this.$('#dropzone').removeClass('pulse');
        }
    },
    onViewAllOver: function (evt) {
        var dataTransfer = this.getDataTransfer(evt);
        if (dataTransfer) {
            dataTransfer.dropEffect = 'copy';
            this.$('#viewAll').addClass('pulse');
        }
    },

    onViewAllOut: function (evt) {
        this.$('#viewAll').removeClass('pulse');
    },

    onViewAllDrop: function (evt) {
        var dataTransfer = this.getDataTransfer(evt);
        if (dataTransfer) {
            this.model.loadViewAll(dataTransfer.files[0]);
            this.$('#viewAll').removeClass('pulse');
            $('#view-all').parent().show();
        }
    },

    onBrandImageOver: function (evt) {
        var dataTransfer = this.getDataTransfer(evt);
        if (dataTransfer) {
            dataTransfer.dropEffect = 'copy';
            this.$('#brand_img').addClass('pulse');
        }
    },

    onBrandImageOut: function (evt) {
        this.$('#brand_img').removeClass('pulse');
    },

    onBrandImageDrop: function (evt) {
        var dataTransfer = this.getDataTransfer(evt);
        if (dataTransfer) {
            this.model.loadBrandImages(dataTransfer.files);
            this.$('#brand_img').removeClass('pulse');
        }
    },

  deserializeFormData: function() {
    var d = this.model;
    var serializedString = localStorage.getItem(d.toJSON().downloadName);
    
    if (!serializedString) 
      return;
      
      try {
          var json = JSON.parse(serializedString);
          
          Object.keys(json).map(function(key) {
            var name = key;
            var value = json[name];

            if (name === 'backgroundPosition') {
                d.set(json, value);
            }
              
            if (name === 'background') {
                d.background.src = value;
            }

            d.set(name.toCamelCase(), value);
        });
      } catch(e) {
          console.error('Invalid json: ', e);
      }
      this.render();
  }
});
