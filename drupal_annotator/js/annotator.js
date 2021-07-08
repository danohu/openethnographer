(function ($) {
  Drupal.behaviors.annotator = {
    attach: function (context, settings) {
      if($(context).find('.preview').length == 0){
	  Drupal.Annotator = $(Drupal.settings.annotator.element).annotator();
      }
      else{
	  // plugins are written to assume annotator exists on the page
	  // this hack is easier than rewriting them all
	  Drupal.Annotator = Drupal.Annotator || {'annotator': function(){}}
	  }

    }
  };
})(jQuery);
