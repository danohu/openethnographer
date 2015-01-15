<?php

// Configuration for loading this plugin, as expected by the CTools plugin mechanism.
$plugin = array(
  'name' => 'store',
  'label' => t('Store'),
  'module' => 'annotator',
  'handler' => array(
    'class' => 'StoreAnnotatorPlugin',
  ),
);

