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
          // that.elememt is the DOM element used to instantiate Annotaor with. So we know it has the 
          // attribute containing the metadata that need to find the annotations for this Annotator instance.
          target = jQuery(that.element).attr('data-annotator-target').split('/');
          // TODO Howvever, proper error handling would be good in cases where Annotator is going to be 
          //   instantiated on a "bad tag", not having the data-annotator-target attribute.
          
          return {
            entity_type    : target[0],
            entity_id      : target[1],
            field_name     : target[2],
            field_language : target[3],
            field_delta    : target[4],
          };
        },
      });
    }
    
  };
})(jQuery);
