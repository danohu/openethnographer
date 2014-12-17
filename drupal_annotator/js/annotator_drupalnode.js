
Annotator.Plugin.DrupalNode = (function(_super) {
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


    _super.DrupalNode = DrupalNode;
    return DrupalNode;

  })(Annotator.Plugin);
