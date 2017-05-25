function onRun(context) {

  var document = context.document;
  var sketch = context.api();

  var copyAction = document.actionsController().actionForID("MSCopyAction");
  var pasteAction = document.actionsController().actionForID("MSPasteAction");

  var selectedLayers = [document findSelectedLayers];
  var selection = context.selection;
  var layersCount = selection.count();
  var clipboard = [];
  var originalLayers = [];
  var newLayers = [];

  if (layersCount > 0) {

    // Create indexes of original selected layers
    for (var i = 0; i < layersCount; i++) {

      var selection = context.selection;
      var layer = selection[i];
      originalLayers[i] = layer;
      layer.setIsSelected(false);

    }

    // Save bitmap data to indexed array
    for (var i = 0; i < originalLayers.length; i++) {

      originalLayers[i].setIsSelected(true);

      if(copyAction.validate()) {
        copyAction.performAction(null);
        var pasteboard = NSPasteboard.generalPasteboard();
        var pasteboardItems = pasteboard.pasteboardItems;
        var imgData = pasteboard.dataForType(NSPasteboardTypePNG);
        var imgTiffData = pasteboard.dataForType(NSPasteboardTypeTIFF);
        if(imgData) {
          image = [[NSImage alloc] initWithData:imgData];
        } else if (imgTiffData) {
          image = [[NSImage alloc] initWithData:imgTiffData];
        }
        clipboard[i] = image;
      }

      var selection = context.selection;
      var layer = selection[i];
      var layerRect = [layer rect];
      var layerFrame = [layer frame];
      var layerWidth = layerRect.size.width;
      var layerHeight = layerRect.size.height;
      var layerY = layerRect.origin.y;
      var layerX = layerRect.origin.x;
      var newRect = MSRectangleShape.new();
      newRect.frame = MSRect.rectWithRect(NSMakeRect(layerX, layerY, layerWidth, layerHeight));
      var rectGroup = MSShapeGroup.shapeWithPath(newRect);
      newLayers[i] = rectGroup;

      var selectedDoc = sketch.selectedDocument;
      var currentArtboard = document.currentPage().currentArtboard();
      [currentArtboard addLayers:[rectGroup]];

      layer.setIsSelected(false);
      layer.removeFromParent();

    }

    // Call bitmap data from array and set it as fill
    for (var i = 0; i < newLayers.length; i++) {

      var layer = newLayers[i];
      layer.style().addStylePartOfType(0);
      var fill = layer.style().fills().firstObject();
      fill.setFillType(4);
      var image = clipboard[i];
      fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(image, false));
      layer.style().fills().firstObject().setPatternFillType(1);

    }

    if (layersCount == 1 ) {
      sketch.message('Image2Fill: Image replaced with fill');
    }else{
      sketch.message('Image2Fill: Images replaced with fill');
    }

  }else{
    sketch.message('Please select some objects.');
  }

};
