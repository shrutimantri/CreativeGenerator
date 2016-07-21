var MEME_SETTINGS = {
  creditSize: 12,
  downloadName: 'mobileUSP', // The name of the downloaded image file (will have a ".png" extension added).
  fontColor: 'white', // Universal font color.

  // Universal font family for texts:
  // Note that you'll need to included quoted font names as you would in CSS, ie: '"Knockout 28 B"'.
  fontFamily: 'Helvetica Neue',
  // Font family options: set to empty array to disable font selector.
  // These options may also be formatted as {text:'Knockout', value:'"Knockout 28 B"'}.
  fontFamilyOpts: ['Arial', 'Helvetica Neue', 'Comic Sans MS'],
  
  // Font size of main headline:
  fontSize: 24,
  // Font size options: set to empty array to disable font-size selector.
  fontSizeOpts: [
    {text: 'Medium text', value: 24},
    {text: 'Large text', value: 36}
  ],

  headlineText: 'Write your own title', // Default headline text.
  height: 600, // Canvas rendering height.
  imageScale: 1, // Background image scale.
  imageSrc: '', // Default background image path. MUST reside on host domain, or use base64 data.
  overlayAlpha: 0.5, // Opacity of image overlay.

  // Image overlay color, or blank ('') for no overlay:
  overlayColor: '#000',
  // Overlay color options: set to empty array to disable overlay options selector.
  overlayColorOpts: ['#000', '#777', '#2980b9'],
  paddingRatio: 0.05, // Percentage of canvas width to use as edge padding.
  
  uspText1: 'USP Text 1',
  uspText2: 'USP Text 2',
  uspText3: 'USP Text 3',
  // Text alignment: valid settings are "left", "center", and "right".
  textAlign: 'usp_top',
  // Text alignment options: set to empty array to disable alignment picker.
  textAlignOpts: [
    {text: 'Align top', value: 'usp_top'}, 
    {text: 'Align bottom', value: 'usp_bottom'}
  ],

  textShadow: false, // Text shadow toggle.
  textShadowEdit: true, // Toggles text shadow control within the editor.
  viewAllShow: false, // Show view all
  viewAllEdit: true, // Can show all can be edit
  viewAll: 'image/viewAll.png',

  width: 600 // Canvas rendering width.
};
