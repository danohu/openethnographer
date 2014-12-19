(function ($) {
  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Tags');
    }
  };
})(jQuery);

jQuery(document).ready(function(){
  jQuery('#annotator-field-2').autocomplete({source: Drupal.settings.autocomplete_terms});
    });
