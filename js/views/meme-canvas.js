/*
 * MemeCanvasView
 * Manages the creation, rendering, and download of the Meme image.
 */
MEME.MemeCanvasView = Backbone.View.extend({

    initialize: function () {
        $('#meme-editor-view :input').each(function(){
           if (!$(this).attr('name')) {
             $(this).attr('name', $(this).attr('id'));
           }
        });
        var canvas = document.createElement('canvas');
        var $container = MEME.$('#meme-canvas');

        // Display canvas, if enabled:
        if (canvas && canvas.getContext) {
            $container.html(canvas);
            this.canvas = canvas;
            this.setDownload();
            this.render();
        } else {
            $container.html(this.$('noscript').html());
        }

        // Listen to model for changes, and re-render in response:
        this.listenTo(this.model, 'change', this.render);
    },

    setDownload: function () {
        var a = document.createElement('a');
        if (typeof a.download == 'undefined') {
            this.$el.append('<p class="m-canvas__download-note">Right-click button and select "Download Linked File..." to save image.</p>');
        }
    },

    render: function () {
        // Return early if there is no valid canvas to render:
        if (!this.canvas) return;

        // Collect model data:
        var m = this.model;
        var d = this.model.toJSON();
        var ctx = this.canvas.getContext('2d');
        var padding = Math.round(d.width * d.paddingRatio);

        // Reset canvas display:
        this.canvas.width = d.width;
        this.canvas.height = d.height;
        ctx.clearRect(0, 0, d.width, d.height);

        function renderBackground(ctx) {
            // Base height and width:
            var bh = m.background.height;
            var bw = m.background.width;

            if (bh && bw) {
                // Transformed height and width:
                // Set the base position if null
                var th = bh * d.imageScale;
                var tw = bw * d.imageScale;
                var cx = d.backgroundPosition.x || d.width / 2;
                var cy = d.backgroundPosition.y || d.height / 2;

                ctx.drawImage(m.background, 0, 0, bw, bh, cx - (tw / 2), cy - (th / 2), tw, th);
            }
        }

        function renderOverlay(ctx) {
            if (d.overlayColor) {
                ctx.save();
                ctx.globalAlpha = d.overlayAlpha;
                ctx.fillStyle = d.overlayColor;
                ctx.fillRect(0, 0, d.width, d.height);
                ctx.globalAlpha = 1;
                ctx.restore();
            }
        }

        function renderHeadline(ctx) {
            if (d.headline) {
                var maxWidth = Math.round(d.width * 0.75);
                if(d.callout){
                    maxWidth = Math.round(d.width * 0.4);
                }
                var x = padding;
                var y = padding;
                var vx = padding;
                var vy = padding;
                var bw, bh, tw, th;
                if (d.viewAllShow) {
                    // Base & transformed height and width:
                    bh = th = m.viewAll.height;
                    bw = tw = m.viewAll.width;

                    if (bh && bw) {
                        // Calculate view all maximum width:
                        var mw = d.width * d.viewAllMaxWidthRatio;

                        // Constrain transformed height based on maximum allowed width:
                        if (mw < bw) {
                            th = bh * (mw / bw);
                            tw = mw;
                        }
                    } else {
                        d.viewAllShow = false;
                    }
                }

                ctx.font = d.fontSize + 'pt ' + d.fontFamily;
                if (d.textColorRGB) ctx.fillStyle = d.textColorRGB;
                else ctx.fillStyle = d.textColorRGB;
                ctx.textBaseline = 'top';

                // Text shadow:
                if (d.textShadow) {
                    ctx.shadowColor = "#666";
                    ctx.shadowOffsetX = -2;
                    ctx.shadowOffsetY = 1;
                    ctx.shadowBlur = 10;
                }

                // Text alignment:
                if (d.textAlign == 'center') {
                    ctx.textAlign = 'center';
                    x = d.width / 2;
                    y = d.height - d.height / 1.5;
                    maxWidth = d.width - d.width / 3;
                } else if (d.textAlign == 'b-right') {
                    ctx.textBaseline = 'bottom';
                    ctx.textAlign = 'right';
                    x = d.width - padding;
                    y = d.height - padding;
                    if (d.viewAllShow) {
                        y -= (th + 10);
                    }
                } else if (d.textAlign == 'b-left') {
                    ctx.textBaseline = 'bottom';
                    ctx.textAlign = 'left';
                    y = d.height - padding;
                    if (d.viewAllShow) {
                        y -= (th + 10);
                    }
                } else if (d.textAlign == 'right') {
                    ctx.textAlign = 'right';
                    x = d.width - padding;
                } else if (d.textAlign == 'usp_bottom') {
                    ctx.textAlign = 'left';
                    y = d.height - padding * 7;
                } else {
                    ctx.textAlign = 'left';
                }

                var words = d.headline.split(' ');
                var line = '';

                for (var n = 0; n < words.length; n++) {
                    var testLine = line + words[n] + ' ';
                    var metrics = ctx.measureText(testLine);
                    var testWidth = metrics.width;

                    if (testWidth > maxWidth && n > 0) {
                        ctx.fillText(line, x, y);
                        line = words[n] + ' ';
                        y += Math.round(d.fontSize * 1.5);
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, x, y);
                if (d.viewAllShow) {
                    vy = y;
                    vx = x;
                    if (ctx.textBaseline != 'bottom')
                        vy = vy + Math.round(d.fontSize * 1.8);
                    if (ctx.textAlign == 'right')
                        vx = vx - tw;
                    ctx.drawImage(m.viewAll, 0, 0, bw, bh, vx, vy, tw, th);
                }

                if(d.callout){
                    y += Math.round(d.fontSize * 1.8);
                    ctx.font = 'normal 12pt ' + d.fontFamily;
                    ctx.fillStyle = d.calloutColorRGB;
                    var width = ctx.measureText(d.callout).width;
                    ctx.roundRect(x,y,width+10,parseInt(ctx.font, 10)+12,{upperLeft:5,upperRight:5, lowerRight: 5, lowerLeft: 5},true,false);
                    ctx.fillStyle = ctx.strokeStyle;
                    ctx.fillText(d.callout, x+5, y+5);
                }
                ctx.shadowColor = 'transparent';
            }
        }

        function renderCredit(ctx) {
            if (d.creditText) {
                ctx.textBaseline = 'bottom';
                ctx.textAlign = 'left';
                if (d.textColorRGB) ctx.fillStyle = d.textColorRGB;
                else ctx.fillStyle = d.textColorRGB;
                ctx.font = 'normal ' + d.creditSize + 'pt ' + d.fontFamily;
                ctx.fillText(d.creditText, padding, d.height - padding);
            }
        }

        function renderCTA(ctx) {
            if (d.cta) {
                ctx.fillStyle = d.textColorRGB;
                ctx.strokeStyle = d.textColorRGB

                ctx.rect(80,400,200,70);
                ctx.font = "20pt sans-serif";
                ctx.fillText(d.cta, 95, 420);
                ctx.stroke();
            }
        }

        function renderUspText(ctx) {
            if (d.uspText1 || d.uspText2 || d.uspText3) {
                ctx.textBaseline = 'bottom';
                ctx.textAlign = 'left';
                ctx.fillStyle = d.textColorRGB;
                ctx.font = 'normal ' + d.creditSize + 'pt ' + d.fontFamily;
                if (d.textAlign == 'usp_top') {
                    ctx.fillText(d.uspText1, padding, padding * 4);
                    ctx.fillText(d.uspText2, padding, padding * 5);
                    ctx.fillText(d.uspText3, padding, padding * 6);
                }
                if (d.textAlign == 'usp_bottom') {
                    ctx.fillText(d.uspText1, padding, d.height - padding * 4);
                    ctx.fillText(d.uspText2, padding, d.height - padding * 3);
                    ctx.fillText(d.uspText3, padding, d.height - padding * 2);
                }
            }
        }

        function renderBrandImage(ctx) {
            // Base height and width:
            var bh = m.background.height;
            var bw = m.background.width;

            if (bh && bw) {
                // Transformed height and width:
                // Set the base position if null
                var th = bh * d.imageScale;
                var tw = bw * d.imageScale;
                var cx = d.backgroundPosition.x || d.width / 2;
                var cy = d.backgroundPosition.y || d.height / 2;

                ctx.drawImage(m.background, 0, 0, bw, bh, cx - (tw / 2), cy - (th / 2), tw, th);
            }
        }

        function getImageScale(index) {
            switch (index){
                case 0: return d.brandImage1Scale;
                case 1: return d.brandImage2Scale;
                case 2: return d.brandImage3Scale;
                case 3: return d.brandImage4Scale;
            }
        }

        function getBrandImageX(index) {
            switch (index){
                case 0: return d.brandImage1X;
                case 1: return d.brandImage2X;
                case 2: return d.brandImage3X;
                case 3: return d.brandImage4X;
            }
        }

        function getBrandImageY(index) {
            switch (index){
                case 0: return d.brandImage1Y;
                case 1: return d.brandImage2Y;
                case 2: return d.brandImage3Y;
                case 3: return d.brandImage4Y;
            }
        }

        function renderBrandImages(ctx) {
            if(m.brandImages && m.brandImages.length){
                var mw = Math.round(d.width * 0.25);
                var vx = 0, vy = 0, bw, bh, tw, th;
                for(var i=0;i<m.brandImages.length;i++){
                    bh = th = m.brandImages[i].height;
                    bw = tw = m.brandImages[i].width;
                    if (bh && bw) {
                        var imageScale = getImageScale(i);
                        if(imageScale){
                            th = bh * imageScale;
                            tw = bw * imageScale;
                        }
                        // Constrain transformed height based on maximum allowed width:
                        else if (mw < bw) {
                            th = bh * (mw / bw);
                            tw = mw;
                        }
                        vy = d.height - th;
                        var x = getBrandImageX(i);
                        var y = getBrandImageY(i);
                        if(x && y){
                            vx = x;
                            vy = y;
                        }
                        ctx.drawImage(m.brandImages[i], 0, 0, bw, bh, vx, vy, tw, th);
                    }
                    vx += mw;
                }
            }
        }

        function renderWatermark(ctx) {
            if (m.watermark) {
                // Base & transformed height and width:
                var bw, bh, tw, th;
                bh = th = m.watermark.height;
                bw = tw = m.watermark.width;

                if (bh && bw) {
                    // Calculate watermark maximum width:
                    var mw = d.width * d.watermarkMaxWidthRatio;

                    // Constrain transformed height based on maximum allowed width:
                    if (mw < bw) {
                        th = bh * (mw / bw);
                        tw = mw;
                    }

                    ctx.globalAlpha = d.watermarkAlpha;
                    ctx.drawImage(m.watermark, 0, 0, bw, bh, d.width - padding - tw, d.height - padding - th, tw, th);
                    ctx.globalAlpha = 1;
                }
            }
        }

        renderBackground(ctx);
        renderOverlay(ctx);
        renderHeadline(ctx);
        renderCredit(ctx);
        renderUspText(ctx);
        renderWatermark(ctx);
        renderBrandImages(ctx);
        renderCTA(ctx);

        var data = this.canvas.toDataURL(); //.replace('image/png', 'image/octet-stream');
        this.$('#meme-download').attr({
            'href': data,
            'download': (d.downloadName || 'share') + '.png'
        });

        // Enable drag cursor while canvas has artwork:
        this.canvas.style.cursor = this.model.background.width ? 'move' : 'default';
    }

    ,

    events: {
        'mousedown canvas': 'onDrag',
        'click #meme-download': 'onDownload'
    }
    ,

    // Performs drag-and-drop on the background image placement:
    onDrag: function (evt) {
        evt.preventDefault();

        // Return early if there is no background image:
        if (!this.model.hasBackground()) return;

        // Configure drag settings:
        var model = this.model;
        var d = model.toJSON();
        var iw = model.background.width * d.imageScale / 2;
        var ih = model.background.height * d.imageScale / 2;
        var origin = {x: evt.clientX, y: evt.clientY};
        var start = d.backgroundPosition;
        start.x = start.x || d.width / 2;
        start.y = start.y || d.height / 2;

        // Create update function with draggable constraints:
        function update(evt) {
            evt.preventDefault();
            model.set('backgroundPosition', {
                x: Math.max(d.width - iw, Math.min(start.x - (origin.x - evt.clientX), iw)),
                y: Math.max(d.height - ih, Math.min(start.y - (origin.y - evt.clientY), ih))
            });
        }

        // Perform drag sequence:
        var $doc = MEME.$(document)
            .on('mousemove.drag', update)
            .on('mouseup.drag', function (evt) {
                $doc.off('mouseup.drag mousemove.drag');
                update(evt);
            });
    },
    
  onDownload: function(evt) {
      var d = this.model.toJSON();
      var formData = $('#meme-editor-view').serializeArray();
      var result = {};
      
      for (var i = 0; i < formData.length; ++i) {
          result[formData[i].name] = formData[i].value;
      }
      
      result.backgroundPosition = d.backgroundPosition;
      result.background = this.model.background.src;
      localStorage.setItem(d.downloadName, JSON.stringify(result));
  }
});
