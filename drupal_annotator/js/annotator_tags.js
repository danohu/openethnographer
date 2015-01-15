(function ($) {

  // Function to add new tags from the given annotation to the tag autocomplete list.
  var add_tags_to_autocomplete = function(editor, annotation){
    for(i in annotation.tags){
      // If the tag is not yet in the autocomplete list, add it.
      if(Drupal.settings.autocomplete_terms.indexOf(annotation.tags[i]) == -1){
	      Drupal.settings.autocomplete_terms.push(annotation.tags[i]);
      }
    }
  };

  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {

      Drupal.Annotator.annotator('addPlugin', 'Tags', {
        parseTags: function(string) {
          return [$.trim(string)];
        },
        stringifyTags: function(array) {
          if(array.length > 1){
            console.log('stringifyTags unexpectedly received multiple tags: ');
            console.log(array);
          }
          return array.join(",");
        },
        onInit: function(that){
          that.annotator.subscribe('annotationEditorSubmit', add_tags_to_autocomplete);
          jQuery(that.field).find(':input').autocomplete({
            source: Drupal.settings.autocomplete_terms,
            delay: 0,
            position: { my : "left top", at: "left bottom" },
            autoFocus: true
          });
        }
	    });

    }
  };

})(jQuery);

