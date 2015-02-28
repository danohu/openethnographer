/*
Annotator view panel Plugin v1.0 (https://https://github.com/albertjuhe/annotator_view/)
Copyright (C) 2014 Albert Juhé Brugué
License: https://github.com/albertjuhe/annotator_view/License.rst

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
*/

$ = jQuery;



(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  //constants
  var IMAGE_PATH = '/sites/all/modules/annotator/annotator_view/img';
  var IMAGE_DELETE =  IMAGE_PATH + '/icono_eliminar.png',
  IMAGE_DELETE_OVER = IMAGE_PATH + '/papelera_over.png',
  SHARED_ICON = IMAGE_PATH + '/shared-icon.png'; 

  Annotator.Plugin.AnnotatorViewer = (function(_super) {
    __extends(AnnotatorViewer, _super);

    AnnotatorViewer.prototype.field = null;

    AnnotatorViewer.prototype.input = null;

    AnnotatorViewer.prototype.options = {
      AnnotatorViewer: {}
    };


    function AnnotatorViewer(element, options) {
	if($('.annotations-list-uoc').length == 0){
	  $( "body" ).append( this.createAnnotationPanel() );
	  $('#annotator-tabs').tabs();


	  $(".container-anotacions").toggle();
	  $("#annotations-panel").click(function(event) {
	    $(".container-anotacions").toggle("slide");       
	  });

	    // set selected nodes according to the radio buttons
	    $('input[type=radio][name=showtags]').on('change', function(){
		selectors = {
		    'mine': '.annotator-taglist-mytag',
		    'all': '.annotator-taglist-mytag,.annotator-taglist-notmytag'}
		cls = selectors[$(this).val()];
		$tree = jQuery('.annotator-taglist');		
 		state = $tree.tree('getState');
		state['selected_node'] = jQuery(cls).map(
		    function(){
			return jQuery(this).data('id')
		    });
		// deselect all nodes
		while($tree.tree('getSelectedNode')){
		    $tree.tree('selectNode', null);
		    }
		$tree.tree('setState', state);

		// change which tags are highlighted
		AnnotatorViewer.prototype.showSelectedTags();
		});
    };

    AnnotatorViewer.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      
      $('#type_share').click(this.onFilter);
      $('#type_own').click(this.onFilter);
	this.annotator.subscribe(
	    'annotationViewerShown',
	    this.onAnnotationViewerShown);
    };

    AnnotatorViewer.prototype.onAnnotationViewerShown = function(event){
	  $('.annotator-tag a').click(function(){
	      tid = jQuery(this).attr('href').split('/').pop();
	      AnnotatorViewer.prototype.displayTag(tid);
	      return false;
	      });
	 }
	}




    AnnotatorViewer.prototype.createAnnotationPanel = function(annotation) {     

	var sidebar_label = 'Open Ethnographer';
	var radios = '<input type="radio" name="showtags" value="mine">Show my tags</br> <input type="radio" name="showtags" value="all">Show all tags</br>'
	var panel_content = '<h2>Open Ethnographer</h2><div id="annotator-tabs">  <ul>    <li><a href="#annotator-tabs-1">Tag list</a></li>    <li><a href="#annotator-tabs-2">Term Details</a></li>   </ul>  <div id="annotator-tabs-1">  ' + radios + '  <div class="annotator-taglist"></div>  </div>  <div id="annotator-tabs-2">    <div class="annotator-termdetail">Click a tag name to see where it has been used</div>  </div> </div>';
      var annotation_layer =  '<div  class="annotations-list-uoc" style="background-color:#ddd;"><div id="annotations-panel"><span class="rotate" title="'+ sidebar_label +'" style="padding:5px;background-color:#ddd;position: absolute; top:10em;left: -50px; width: 155px; height: 110px;cursor:pointer">'+ sidebar_label +'<span class="label-counter" style="padding:0.2em 0.3em;float:right" id="count-anotations"></span></span></div><div id="anotacions-uoc-panel" style="height:80%"><ul class="container-anotacions"><li class="filter-panel">'+panel_content+'</li></ul></div></div>';
	// nodeid is ignored on the backend for now,
	// but we may want to filter nodes present on the current node
	nodeid = window.location.pathname.split('/').pop()
	jQuery.get('/annotation/api/tags?node=' + nodeid, this.onTagJSON);
      return annotation_layer;
    };

    AnnotatorViewer.prototype.showSelectedTags = function(){
	tids = $('.annotator-taglist').tree('getState')['selected_node'];
	//disable all tags
	jQuery('.annotator-hl').addClass('annotator-hl-disabled').removeClass('annotator-hl');

	//then re-enable tags with the right ids
	for(i in tids){
	    selector = '[data-tid=' + tids[i] + ']';
	    jQuery(selector).addClass('annotator-hl');	    
	}
	}

    AnnotatorViewer.prototype.displayTag = function(tid){
	jQuery('.annotator-termdetail').load('/annotation/api/quotation_list?tid=' + tid);
	jQuery('#annotator-tabs').tabs({active: 1});
	jQuery(".container-anotacions").slideDown();
	}

    AnnotatorViewer.prototype.onTagJSON = function(data){
	var html = '';
	for(var i in data){
	    var tag = data[i];
	    var classes = ['annotator-tag'];
	    if( tag.uid == Drupal.settings.annotator_permissions.user.uid){
		classes.push('annotator-tag-mine');
		}
	    else {
		classes.push('annotator-tag-others');
		}
	    }
	//jQuery('.annotator-taglist').html(html);
	
	// make some tweaks to the tag data while it's still conveniently flat
	jQuery(data).each(function(i,v){
	    // tid -> id (for benefit of jqtree)
	    v['id'] = v['tid'];
	    // don't let long tag names mess up the layout
	    v['label'] = v['name'].substr(0,25);
	    // separate tags whether this user created them
	    v['is_mine'] = v['uid'] == Drupal.settings.annotator_permissions.user.uid;	
	});
	
	// recursively find a term, so we can give it children
	findNode = function(node, nid){
	    if(node['tid'] == nid)
		return node;
	    if(!node.hasOwnProperty('children')) return null;
	    for(cid in node['children']){
		found = findNode(node['children'][cid]);
		if(found)
		    return found;
		}
	    return null;
	    }
	
	// turn the taxonomy into a real tree
	for(var k = data.length-1; k >= 0; k--){
	    leaf = data[k];
	    parentid = leaf['parents'][0]; // ignore multiple inheritance
	    if(parentid == "0") // skip roots without parents
		continue;
	    // look for a node with the right id
	    for(var n in data){
		parent = findNode(data[n], parentid);
	    // add this node as a child
		if(parent){
		    if(!parent.hasOwnProperty('children')){
			parent['children'] = [];}
		    parent['children'].push(leaf);
		    data.splice(k, 1);
		}
	    }
	    }
	$tree = jQuery('.annotator-taglist')    
	$tree.tree(
	    {data: data,
	     autoOpen: true,
	     keyboardSupport: false, 
	     dragAndDrop: false,
	     onCreateLi: function(node, li){
		 li.attr('data-id', node.id);
		 li.addClass('annotator-taglist-tag');
		 if(node['is_mine'])
		    li.addClass('annotator-taglist-mytag');
		 else
		    li.addClass('annotator-taglist-notmytag');
		 }
	    });
	$tree.bind(
	    'tree.click',
	    function(e) {
		    // Disable single selection
		    e.preventDefault();
		    AnnotatorViewer.prototype.displayTag(e.node.id);
		    return;
		    var selected_node = e.node;
		    if (selected_node.id == undefined) {
			console.log('The multiple selection functions require that nodes have an id');
		    }
		    if ($tree.tree('isNodeSelected', selected_node)) {
			$tree.tree('removeFromSelection', selected_node);
		    }
		    else {
			$tree.tree('addToSelection', selected_node);
		    }
		AnnotatorViewer.prototype.showSelectedTags();
		}
	    );
	// use the radio button to select all
	jQuery('input[value=all]').click();
	} 

    return AnnotatorViewer;

  })(Annotator.Plugin);

}).call(this);
