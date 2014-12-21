(function ($) {
  console.log('here comes annotator');
  Drupal.behaviors.annotatorSidebar = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'AnnotatorViewer');
    }
  };
})(jQuery);
