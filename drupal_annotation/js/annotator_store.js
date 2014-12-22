(function ($) {
  Drupal.behaviors.annotatorStore = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Store', {
        prefix: settings.annotator_store.prefix,
        urls: settings.annotator_store.urls,
        showViewPermissionsCheckbox: settings.annotator_store.showViewPermissionsCheckbox,
        showEditPermissionsCheckbox: settings.annotator_store.showEditPermissionsCheckbox,
        annotationData: {
          'type': 'annotator'
        },
	loadFromSearch: function(that){
	    	return {
			'nid': jQuery(that.element).parents('.node').attr('id').split('-')[1]};
	    },
      });
    }
  };
})(jQuery);
