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

    AnnotatorViewer.prototype.events = {
      'annotationsLoaded': 'onAnnotationsLoaded',
      'annotationCreated': 'onAnnotationCreated',
      'annotationDeleted': 'onAnnotationDeleted',
      'annotationUpdated': 'onAnnotationUpdated',
      ".annotator-viewer-delete click": "onDeleteClick",
      ".annotator-viewer-edit click": "onEditClick",
      ".annotator-viewer-delete mouseover": "onDeleteMouseover",
      ".annotator-viewer-delete mouseout": "onDeleteMouseout",
    };


    AnnotatorViewer.prototype.field = null;

    AnnotatorViewer.prototype.input = null;

    AnnotatorViewer.prototype.options = {
      AnnotatorViewer: {}
    };


    function AnnotatorViewer(element, options) {
	if($('.annotations-list-uoc').length == 0){
	  $( "body" ).append( this.createAnnotationPanel() );

	  $(".container-anotacions").toggle();
	  $("#annotations-panel").click(function(event) {
	    $(".container-anotacions").toggle("slide");       
	  });
	 }

    };

    AnnotatorViewer.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      
      $('#type_share').click(this.onFilter);
      $('#type_own').click(this.onFilter);
     
    };

    /*
    Check the checkboxes filter to search the annotations to show.
    Shared annotations have the class shared
    My annotations have the me class
    */
    AnnotatorViewer.prototype.onFilter = function(event) {
    };

    AnnotatorViewer.prototype.onDeleteClick = function(event) {
    };

     AnnotatorViewer.prototype.onEditClick = function(event) {
    };

    AnnotatorViewer.prototype.onButtonClick = function(event, type) {
    };

    //Textarea editor controller
    AnnotatorViewer.prototype.textareaEditor = function(annotator_textArea,item) {
    };

      AnnotatorViewer.prototype.tinymceActivation = function(selector) {
    }

    //Event triggered when save the content of the annotation
    AnnotatorViewer.prototype.onSavePanel = function(event) {
       var current_annotation = event.data.annotation;
       var textarea =  $('li#annotation-'+current_annotation.id).find('textarea.panelTextArea');
       current_annotation.text =  textarea.val();
       this.annotator.updateAnnotation(current_annotation);
       this.normalEditor(current_annotation,textarea);
    };

     //Event triggered when save the content of the annotation
    AnnotatorViewer.prototype.onCancelPanel = function(event) {
        var current_annotation = event.data.annotation;
        var textarea =  $('li#annotation-'+current_annotation.id).find('textarea.panelTextArea');
        this.normalEditor(current_annotation,textarea);

    };

    //Annotator in a non editable state
    AnnotatorViewer.prototype.normalEditor = function(annotation,editableTextArea) {
    };

     AnnotatorViewer.prototype.onDeleteMouseover = function(event) {
    };

     AnnotatorViewer.prototype.onDeleteMouseout = function(event) {
    };

    AnnotatorViewer.prototype.onAnnotationCreated = function(annotation) { 
    };

    AnnotatorViewer.prototype.onAnnotationUpdated = function(annotation) {
    };

    AnnotatorViewer.prototype.onAnnotationsLoaded = function(annotations) {      
    };

    
    AnnotatorViewer.prototype.onAnnotationDeleted = function(annotation) {
    };

    AnnotatorViewer.prototype.mascaraAnnotation = function(annotation) {
	return '';
    };

    AnnotatorViewer.prototype.createAnnotationPanel = function(annotation) {     

	var sidebar_label = 'OPEN SIDEBAR';
	var panel_content = 'YOUR CONTENT HERE';
      var annotation_layer =  '<div  class="annotations-list-uoc" style="background-color:#ddd;"><div id="annotations-panel"><span class="rotate" title="'+ sidebar_label +'" style="padding:5px;background-color:#ddd;position: absolute; top:10em;left: -50px; width: 155px; height: 110px;cursor:pointer">'+ sidebar_label +'<span class="label-counter" style="padding:0.2em 0.3em;float:right" id="count-anotations">0</span></span></div><div id="anotacions-uoc-panel" style="height:80%"><ul class="container-anotacions"><li class="filter-panel">'+panel_content+'</li></ul></div></div>';
      return annotation_layer;
    };

   
    AnnotatorViewer.prototype.createReferenceAnnotation = function(annotation) {
    };

    AnnotatorViewer.prototype.uniqId = function() {
      return Math.round(new Date().getTime() + (Math.random() * 100));
    } 

 
    return AnnotatorViewer;

  })(Annotator.Plugin);

}).call(this);
