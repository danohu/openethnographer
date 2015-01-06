(function ($) {
  var add_tags_to_autocomplete = function(editor, annotation){
      // check an annotation being submitted.
      // if any tags being submitted are not in the autocomplete list, add them
      for(i in annotation.tags){
	  if(Drupal.settings.autocomplete_terms.indexOf(annotation.tags[i]) == -1){
	      Drupal.settings.autocomplete_terms.push(annotation.tags[i]);
	      }
      }
      }
  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Tags', {
        onInit: function(that){
	  that.annotator.subscribe('annotationEditorSubmit', add_tags_to_autocomplete)
	  jQuery(that.field).find(':input').autocomplete({
 	      source: Drupal.settings.autocomplete_terms,
	      delay: 0,
	      position: { my : "left top", at: "left bottom" },
	  });
	}

	});
    }
  };
})(jQuery);
