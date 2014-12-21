<?php

/**
 * Sidebar plugin
 */
class SidebarAnnotatorPlugin extends AnnotatorPlugin {
  public function setup() {
    watchdog('oeth', 'annotator setup');
    drupal_add_js(drupal_get_path('module', 'annotator') . '/annotator_view/src/view_annotator.js');
    drupal_add_js(drupal_get_path('module', 'annotator') . '/annotator_view/src/categories.js');
    drupal_add_js(drupal_get_path('module', 'annotator') . '/annotator_view/lib/jquery-i18n-master/jquery.i18n.js');
    drupal_add_js(drupal_get_path('module', 'annotator') . '/annotator_view/locale/en/annotator.js');
    drupal_add_js(drupal_get_path('module', 'annotator') . '/js/annotator_view.js');
    drupal_add_css(
	drupal_get_path('module', 'annotator') . '/annotator_view/src/css/style.css',
	array('type' => 'file', 'basename' => 'annotator_view_style.css'));
  }
  }
