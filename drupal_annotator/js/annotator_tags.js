(function ($) {
  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Tags');
    }
  };
})(jQuery);

jQuery(document).ready(function(){
    for(i in Annotator._instances){
	Annotator._instances[i].plugins.Tags.input.autocomplete({
 	 source: Drupal.settings.autocomplete_terms,
	 delay: 0,
	 position: { my : "right top", at: "left bottom" },
    });
	}
});
