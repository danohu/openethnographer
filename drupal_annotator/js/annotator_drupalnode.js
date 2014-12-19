
var _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Annotator.Plugin.DrupalNode = (function(_super) {
      __extends(DrupalNode, _super);
    function DrupalNode(element) {
        this.element = element;
        this.nid = jQuery(element).parents('.node').attr('about').split('/').slice(-1).pop();
        this.pluginSubmit = __bind(this.pluginSubmit, this);
      return DrupalNode.__super__.constructor.apply(this, arguments);
    } 

      
    DrupalNode.prototype.pluginSubmit = function(field, annotation){
        annotation.uri = window.location.origin + '/node/' + this.nid;      
        return annotation.nid = this.nid;
        };

    DrupalNode.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }

        this.field = this.annotator.editor.addField({
          submit: this.pluginSubmit,
      });
    };
    return DrupalNode;

  })(Annotator.Plugin);

(function ($) {
  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'DrupalNode');
    }
  };
})(jQuery);
