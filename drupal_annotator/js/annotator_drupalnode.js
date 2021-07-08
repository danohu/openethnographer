
var _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { 
    for (var key in parent) { 
      if (__hasProp.call(parent, key)) child[key] = parent[key];       
    } 
    function ctor() { this.constructor = child; } 
    ctor.prototype = parent.prototype; 
    child.prototype = new ctor(); 
    child.__super__ = parent.prototype; 
    return child;
  };

Annotator.Plugin.DrupalNode = (function(_super) {
  __extends(DrupalNode, _super);
  
  function DrupalNode(element) {
    return DrupalNode.__super__.constructor.apply(this, arguments);
  } 

  DrupalNode.prototype.pluginInit = function() {
    if (!Annotator.supported()) {
      return;
    }
  
    this.annotator.subscribe(
      'annotationEditorSubmit', 
      function(editor, annotation) {
        // editor.element is the new artificial DOM element of the annotation being created. TODO Really so??
        target = editor.element.parents('[data-annotator-target]').attr('data-annotator-target').split('/');
        
        annotation.entity_type    = target[0];
        annotation.entity_id      = target[1];
        annotation.field_name     = target[2];
        annotation.field_language = target[3];
        annotation.field_delta    = target[4];
      }
    );

    this.annotator.subscribe(
      'annotationsLoaded', 
      function(annotations) {
        jQuery('.annotator-hl').each(function() {
	  tid = jQuery(this).data('annotation')['tid'];
	  jQuery(this).attr('data-tid', tid);
	 
          if (jQuery(this).data('annotation').user.uid == Drupal.settings.annotator_permissions.user.uid) {
            jQuery(this).addClass('annotator-own-annotation');
          }
          else {
            jQuery(this).addClass('annotator-others-annotation');
          }
        });
      }
    );
  };
  
  return DrupalNode;
})(Annotator.Plugin);

(function ($) {
  Drupal.behaviors.annotatorDrupalNode = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'DrupalNode');
    }
  };
})(jQuery);
