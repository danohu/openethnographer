(function ($) {
  Drupal.behaviors.annotatorSidebar = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'AnnotatorViewer');
    }
  };
})(jQuery);
