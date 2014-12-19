<?php

/**
 * Annotator ctools plugin
 */
class TagsAnnotatorPlugin extends AnnotatorPlugin {
  public function setup() {
   $vid = taxonomy_vocabulary_machine_name_load('openethnographer')->vid;
   $tags = array(); 
   $term_tree = taxonomy_get_tree($vid);
   foreach($term_tree as $term){
      $tags[] = $term->name;
   }
   drupal_add_js(array('autocomplete_terms' => $tags), 'setting');

    drupal_add_library('system', 'ui.autocomplete');
    drupal_add_js(drupal_get_path('module', 'annotator') . '/js/annotator_tags.js');
  }
}