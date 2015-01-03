(function ($) {
  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Tags', {
        onInit: function(that){
	  jQuery(that.field).find(':input').autocomplete({
 	      source: Drupal.settings.autocomplete_terms,
	      delay: 0,
	      position: { my : "right top", at: "left bottom" },
	  });
	}

	});
    }
  };
})(jQuery);
