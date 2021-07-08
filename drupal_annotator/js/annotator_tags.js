(function ($) {

  // Function to add new tags from the given annotation to the tag autocomplete list.
  var add_tags_to_autocomplete = function(editor, annotation) {
    for (i in annotation.tags) {
      // If the tag is not yet in the autocomplete list, add it.
      if (Drupal.settings.autocomplete_terms.indexOf(annotation.tags[i]) == -1) {
	      Drupal.settings.autocomplete_terms.push(annotation.tags[i]);
      }
    }
  };

  // Helper function for multiple substring search (str matching all strings in items).
  // Licence: CC-BY-SA 3.0 by musefan, from http://stackoverflow.com/revisions/15202003/1
  var contains_all = function(str, items) {
    for(var i in items){
      var item = items[i];
      if (str.indexOf(item) == -1) {
        return false;
      }
    }
    return true;
  };

  // Function for multiple substring search.
  var multi_substring_search = function(haystack, needles) {
    haystack = haystack.filter(function(element) {
      return contains_all(element, needles);
    });
    return haystack;
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
            // The elements to suggest are tag names passing a multi-substring search ("Firefox address bar" style).
            source: function(request, response) {
              var search_terms = request.term.split(' ');
              var data = multi_substring_search(Drupal.settings.autocomplete_terms, search_terms);
              response(data);
            },
            delay: 0,
            position: { my : "left top", at: "left bottom" },
            autoFocus: true
          });
        }
	    });

    }
  };

})(jQuery);

