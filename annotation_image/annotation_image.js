Drupal.behaviors.imageAnnotation = function(context) {
  $('.image-annotate-canvas:not(image-annotate-processed)', context).addClass('image-annotate-processed').each(function() {
    var $this = $(this);
    $this.siblings('img').hide();
    $this.hoverIntent({
      timeout: 500,
      // Add the behavior: hide/show the notes when hovering the picture
      over: function() {
        $this.children('.image-annotate-view').show();
      },
      out: function() {
        $this.children('.image-annotate-view').hide();
      }
    })
    // Add the "Add a note" button
    .siblings('.image-annotate-add').click(function() {
      if (!jQuery.annotation.active) {
        $this.children('.image-annotate-edit').show().children('.image-annotate-edit-area').annotate(Drupal.imageAnnotationOptions);
      }
    });
  });
};

Drupal.imageAnnotationOptions = {
  preShow: function() {
    var $this = $(this);
    var $canvas = $this.parents('.image-annotate-canvas');
    $this.find('>div').hide();
    $this.resizable({
      handles: 'all',
  	  resize: function(e, ui) {
        // Set the area as a draggable/resizable element contained in the image canvas.
        // Would be better to use the containment option for resizable but buggy.
        var canvasHeight = parseInt($canvas.height());
        var canvasWidth = parseInt($canvas.width());
        var areaPosition = $this.position();
        if (areaPosition.top + parseInt($this.height()) + 2 > canvasHeight) {
          $this.height(canvasHeight - areaPosition.top - 2);
        }
        if (areaPosition.left + parseInt($this.width()) + 2 > canvasWidth) {
          $this.width(canvasWidth - areaPosition.left - 2);
        }
        if (areaPosition.top < 0) {
          $this.height(canvasHeight).css('top', 0);
        }
        if (areaPosition.left < 0) {
          $this.width(canvasWidth).css('left', 0);
        }
      }
    })
    .draggable({
      containment: $canvas,
    })
    .data('imageAnnotationOriginalPosition', $this.position());
  },
  submit: function() {
    var $this = $(this);
    $('#edit-annotation-image-field', this.annotationForm).attr('value', $this.parents('.field-item').find('>a.image-annotate-add').attr('id').match(/[^-]*$/));
    $('#edit-annotation-image-top', this.annotationForm).attr('value', $this.position().top);
    $('#edit-annotation-image-left', this.annotationForm).attr('value', $this.position().left);
    $('#edit-annotation-image-width', this.annotationForm).attr('value', $this.width());
    $('#edit-annotation-image-height', this.annotationForm).attr('value', $this.height());
  },
  postHide: function() {
    var $this = $(this);
    var position = $this.data('imageAnnotationOriginalPosition');
    $this.resizable('destroy')
    .draggable('destroy')
    .css('height', '')
    .css('width', '')
    .css('left', position.left + 'px')
    .css('top', position.top + 'px')
    .parents('.image-annotate-edit').hide();
    $this.find('>div').show();
  }
};
