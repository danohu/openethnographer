(function ($) {
  console.log('here comes annotator');
  Drupal.behaviors.annotatorSidebar = {
    attach: function (context, settings) {
        var propietary = 'demoUser';
      Drupal.Annotator.annotator('addPlugin', 'Permissions', {
                        user: propietary,
                        permissions: {
                            'read': [propietary],
                            'update': [propietary],
                            'delete': [propietary],
                            'admin': [propietary]},
	  showViewPermissionsCheckbox: true,
          showEditPermissionsCheckbox: false
      });
      Drupal.Annotator.annotator('addPlugin', 'AnnotatorViewer');
    }
  };
})(jQuery);
