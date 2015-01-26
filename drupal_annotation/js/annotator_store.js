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
        loadFromSearch: function (that) {
          // TODO Rework this to also properly determine a comment ID.
          // TODO Rework this implementation to one where search parameters are handed by Drupal
          //   rather than being determined from the rendered content. Because that is an 
          //   "unprofessional" dependency on the presentation layer that easily breaks.
          //   Example code: https://lists.okfn.org/pipermail/annotator-dev/2014-November/001246.html
          return {
            // TODO Determine the proper values for entity_type, field_* to use for this query.
            'entity_type'    : 'node',
            'entity_id'      : jQuery(that.element).parents('.node').attr('id').split('-')[1],
            //'field_name'     : 'body',
            //'field_delta'    : '0',
            //'field_language' : 'en'
          };
        },
      });
    }
    
  };
})(jQuery);
