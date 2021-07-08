<?php

/**
 * Implementation of StoreAnnotatorPlugin.
 *
 * StoreAnnotatorPlugin is a plugin for Drupal module "annotator", using the CTools plugin mechanism. In turn, this 
 * CTools plugin contains an Annotator JS plugin "Store", in file js/annotator_store.js. Annotator JS is a library 
 * used in Drupal module "annotator", and comes with its own plugin mechanism. Sorry for the confusion.
 */
class StoreAnnotatorPlugin extends AnnotatorPlugin {

  /**
   * Settings form for this CTools plugin.
   * 
   * The form can be found at admin/config/content/annotator, section "Store".
   */
  public function settingsForm() {
    $defaults = $this->settings();
    $form['prefix'] = array(
      '#type' => 'textfield',
      '#title' => t('Prefix'),
      '#default_value' => $defaults['prefix'],
      '#description' => t('The store endpoint.'),
    );
    $form['urls'] = array(
      '#type' => 'fieldset',
      '#title' => t('URLs'),
      '#default_value' => '',
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    );
    $form['urls']['create'] = array(
      '#type' => 'textfield',
      '#title' => t('Create'),
      '#default_value' => $defaults['urls']['create'],
    );
    $form['urls']['read'] = array(
      '#type' => 'textfield',
      '#title' => t('Read'),
      '#default_value' => $defaults['urls']['read'],
    );
    $form['urls']['update'] = array(
      '#type' => 'textfield',
      '#title' => t('Update'),
      '#default_value' => $defaults['urls']['update'],
    );
    $form['urls']['destroy'] = array(
      '#type' => 'textfield',
      '#title' => t('Destroy'),
      '#default_value' => $defaults['urls']['destroy'],
    );
    $form['urls']['search'] = array(
      '#type' => 'textfield',
      '#title' => t('Search'),
      '#default_value' => $defaults['urls']['search'],
    );
    return $form;
  }

  /**
   * Initialize the settings form of this CTools plugin.
   *
   * @see settingsForm()
   */
  public function settings($defaults = array()) {
    $defaults = array(
      'prefix' => base_path() . 'annotation/api',
      'showViewPermissionsCheckbox' => FALSE,
      'showEditPermissionsCheckbox' => FALSE,
      'urls' => array(
        'create' => '/annotations',
        'read'   => '/annotations/:id',
        'update' => '/annotations/:id',
        'destroy' => '/annotations/:id',
        'search' => '/search',
      ),
    );
    return parent::settings($defaults);    
  }

  public function setup() {
    $settings = $this->settings();
    drupal_add_js(array('annotator_store' => (array) $settings), 'setting');

    // Make the Annotator JS plugin "Store" available.
    drupal_add_js(drupal_get_path('module', 'annotation') . '/js/annotator_store.js');
  }
}

