<?php

/**
 * DrupalNode plugin
 */
class DrupalNodeAnnotatorPlugin extends AnnotatorPlugin {
  public function setup() {
    drupal_add_js(drupal_get_path('module', 'annotator') . '/js/annotator_drupalnode.js');
  }
}