<?php
/**
 * Builds the annotation types admin page at admin/structure/annotation.
 */
function annotation_admin_types() {
  $annotation_entity = entity_get_info('annotation');
  $bundles = $annotation_entity['bundles'];
  //dpm($bundles);
  $field_ui = module_exists('field_ui');
  $header = array(t('Name'), array('data' => t('Operations'), 'colspan' => $field_ui ? '4' : '2'));
  $rows = array();

  foreach ($bundles as $key => $bundle) {
    $type = check_plain($key);
    $name = check_plain($bundle['label']);
    $row = array($name . ' <small>' . t('(Machine name: @type)', array('@type' => $type)) . '</small><div class="description">' . filter_xss_admin($bundle['description']) . '</div>');
    // Set the edit column.
    $row[] = array('data' => l(t('edit'), $bundle['admin']['real path']));
    /*
    if ($field_ui) {
      // Manage fields.
      $row[] = array('data' => l(t('manage fields'), 'admin/annotation/annotation_types/manage/' . check_plain($type) . '/fields'));
      // Display fields.
      $row[] = array('data' => l(t('manage display'), 'admin/annotation/annotation_types/manage/' . check_plain($type) . '/display'));
    }*/
    // Set the delete operation column only if it's a deletable (user-generated) annotation type.
    if ($bundle['custom']) {
      $row[] = array('data' => l(t('delete'), 'admin/annotation/annotation_types/manage/' . check_plain($type) . '/delete'));
    }
    else {
      $row[] = array('data' => '');
    }

    $rows[] = $row;
  }

  $build['node_table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
    //'#empty' => t('No annotation types available. <a href="@link">Add an annotattion type</a>.', array('@link' => url('admin/structure/annotation/add'))),
  );

  return $build;
}

/**
 * Builds the annotation admin overview at admin/content/annotation.
 *
 * Modeled after the example given in modules/node/node.admin.inc.
 */
function annotation_admin_content($form, $form_state) {
  $admin_access = user_access('administer annotations');

  // Bulk action form disabled because the only option is "delete", and it is unfinished.
  // TODO For batch deletion to work, functions annotation_multiple_delete_confirm() and 
  // annotation_multiple_delete_confirm_submit() still have to be implemented. See the example 
  // given in modules/node/node.admin.inc.
  /*
  // Build the 'Update options' form with bulk operations on annotations.
  $form['options'] = array(
    '#type' => 'fieldset',
    '#title' => t('Operations'),
    '#attributes' => array('class' => array('container-inline')),
    '#access' => $admin_access,
  );
  $form['options']['operation'] = array(
    '#type' => 'select',
    '#title' => t('Operation'),
    '#title_display' => 'invisible',
    '#options' => array('delete' => ('Delete')),
    '#default_value' => 'approve', // TODO Taken from the node module demo code. Probably should be "delete" here.
  );
  $form['options']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Execute'),
    '#validate' => array('annotation_admin_annotations_validate'),
    '#submit' => array('annotation_admin_annotations_submit'),
  );
  */

  // Build the sortable table header.
  $header = array(
    'id' => array('data' => t('ID'), 'field' => 'a.id', 'sort' => 'asc'),
    'type' => array('data' => t('Type'), 'field' => 'a.type'),
    'nid' => array('data' => t('Node ID'), 'field' => 'a.nid'),
    'quote' => array('data' => t('Quote'), 'field' => 'a.quote'),
    'text' => array('data' => t('Text'), 'field' => 'a.text'),
    'tid' => array('data' => t('Tag ID'), 'field' => 'a.tid'),
    'author' => t('Author'),
    'timestamp' => array('data' => t('Updated'), 'field' => 'a.updated'),
    'operations' => array('data' => t('Operations')),
  );

  // Get the annotation objects to display in the table.
  $query = db_select('annotation', 'a')->extend('PagerDefault')->extend('TableSort');
  //file_entity_build_filter_query($query);
  $result = $query
    ->fields('a', array('id', 'uid'))
    ->limit(50)
    ->orderByHeader($header)
    //->addTag('annotation_access')
    ->execute()
    ->fetchAllKeyed();
  $annotations = entity_load_multiple_by_name('annotation', array_keys($result));
  $accounts = user_load_multiple(array_unique($result));
  
  $destination = drupal_get_destination();
  $options = array();

  // Build the data structure to display the table content.
  foreach ($annotations as $annotation) {
    $annotation_type = annotation_type_load($annotation->type);
    $options[$annotation->id] = array(
      'id' => $annotation->id,
      'type' => $annotation_type->label,
      'nid' => $annotation->nid,
      'quote' => $annotation->quote,
      'text' => $annotation->text,
      'tid' => $annotation->tid != NULL ? l($annotation->tid, "taxonomy/term/$annotation->tid") : 'NULL',
      'author' => theme('username', array('account' => $accounts[$annotation->uid])),
      'timestamp' => format_date($annotation->updated, 'short'),
      'operations' => array(),
    );
    $operations = array();
    if ($admin_access) {
      $operations['view'] = array(
        'title' => t('view'),
        'href' => 'annotation/' . $annotation->id,
      );
      $operations['delete'] = array(
        'title' => t('delete'),
        'href' => 'annotation/' . $annotation->id . '/delete',
        'query' => $destination,
      );
    }
    if (count($operations) > 1) {
      // Render an unordered list of operations links.
      $options[$annotation->id]['operations'] = array(
        'data' => array(
          '#theme' => 'links__file_entity_operations',
          '#links' => $operations,
          '#attributes' => array('class' => array('links', 'inline')),
        ),
      );
    }
    elseif (!empty($operations)) {
      // Render the first and only operation as a link.
      $link = reset($operations);
      $options[$annotation->id]['operations'] = array(
        'data' => array(
          '#type' => 'link',
          '#title' => $link['title'],
          '#href' => $link['href'],
          '#options' => array('query' => $link['query']),
        ),
      );
    }
  }

  if ($admin_access) {
    // Use a table with selectable rows for admins, to support admin's bulk operations.
    // See: https://api.drupal.org/api/drupal/developer!topics!forms_api_reference.html/7#tableselect
    $form['annotations'] = array(
      '#type' => 'tableselect',
      '#header' => $header,
      '#options' => $options,
      '#empty' => t('No annotation available.'),
    );
  }
  else {
    // Use a simple table for non-admins, as they do not get the bulk-operations options.
    $form['annotations'] = array(
      '#theme' => 'table',
      '#header' => $header,
      '#rows' => $options,
      '#empty' => t('No annotation available.'),
    );
  }

  $form['pager'] = array('#markup' => theme('pager'));
  return $form;
}

/**
 * Validate an annotation_admin_content form submissions.
 *
 * Checks whether any annotations have been selected to perform the chosen bulk 'Operation' on.
 * Modeled after the example given in modules/node/node.admin.inc.
 *
 * @see annotation_admin_content()
 * @see annotation_admin_annotations_submit()
 */
function annotation_admin_annotations_validate($form, &$form_state) {
  // Error if there are no items to select.
  if (!is_array($form_state['values']['annotations']) || !count(array_filter($form_state['values']['annotations']))) {
    form_set_error('', t('No items selected.'));
  }
}

/**
 * Process an annotation_admin_content form submission.
 *
 * Executes the chosen 'Operation' on the selected annotations.
 * Modeled after the example given in modules/node/node.admin.inc.
 *
 * @see annotation_admin_content()
 * @see annotation_admin_annotations_validate()
 */
function annotation_admin_annotations_submit($form, &$form_state) {
  $operations = module_invoke_all('annotation_operations'); // TODO This hook does not exist yet for module annotation.
  $operation = $operations[$form_state['values']['operation']];
  // Filter out unchecked nodes
  $nodes = array_filter($form_state['values']['nodes']);

  // If the operation has a callback, it is a single-step operation to execute immediately.
  if ($function = $operation['callback']) {
    // Add in callback arguments if present.
    if (isset($operation['callback arguments'])) {
      $args = array_merge(array($nodes), $operation['callback arguments']);
    }
    else {
      $args = array($nodes);
    }
    call_user_func_array($function, $args);

    cache_clear_all();
  }
  else {
    // We need to rebuild the form to go to a second step. For example, to
    // show the confirmation form for the deletion of nodes.
    $form_state['rebuild'] = TRUE;
  }
}

/**
 * Builds the annotation types creation form at admin/structure/annotation/add.
 *
 * NOTE: This form is currently still disabled, probably it is still work in progress. To enabled it, 
 * uncomment the corresponding section in annotation_menu(), file annotation.module.
 */
function annotation_type_form($form, &$form_state, $type = NULL) {
  if (!isset($type)) {
    // This is a new type.
    $type = (object) array(
      'type' => '',
      'label' => '',
      'description' => '',
      'custom' => TRUE,
      'plugin' => '',
      'path' => '',
      'area' => '',
    );
  }
  $form['#annotation_type'] = $type;

  $form['label'] = array(
    '#type' => 'textfield',
    '#title' => t('Name'),
    '#description' => t('This is the human readable name of the file type.'),
    '#required' => TRUE,
    '#default_value' => $type->label,
  );

  $form['type'] = array(
    '#type' => 'machine_name',
    '#default_value' => $type->type,
    '#maxlength' => 255,
    '#disabled' => (bool) $type->type,
    '#machine_name' => array(
      'exists' => 'file_type_load',
      'source' => array('label'),
    ),
    '#description' => t('A unique machine-readable name for this file type. It must only contain lowercase letters, numbers, and underscores.'),
  );

  $form['description'] = array(
    '#type' => 'textarea',
    '#title' => t('Description'),
    '#description' => t('This is the description of the file type.'),
    '#default_value' => $type->description,
  );
  $form['plugin'] = array(
    '#type' => 'select',
    '#title' => t('Annotation plugin'),
    '#description' => t('This is the plugin to make annotation.'),
    '#options' => array(
      'annotator' => t('Annotator'),
      'textus' => t('Textus'),
    ),
    '#default_value' => $type->plugin,
  );
  if (!($type->custom)) {
    $form['plugin']['#disabled'] = TRUE;
  }

  return $form;
}

/**
 * Handles view / delete operations on the annotation types admin page at admin/structure/annotation.
 *
 * NOTE: This function is still work in progress, since it was derived from a "file_types" handling plugin 
 * and not yet properly adapted. However, since own annotation types cannot be created anyway so far (function 
 * annotation_type_form() being disabled), this does not hurt, since the unfinished "annotation type delete" 
 * operation will not be executed this way.
 */
function annotation_type_submit($form, &$form_state) {
  if (!empty($form['#file_type']->type)) {
    $type = file_type_load($form['#file_type']->type);
  }
  else {
    $type = (object) array(
      'type' => $form_state['values']['type'],
    );
  }
  if ($form_state['values']['op'] == t('Delete')) {
    $form_state['redirect'] = 'admin/structure/file-types/manage/' . $type->type . '/delete';
    return;
  }
  $type->label = $form_state['values']['label'];
  $type->description = $form_state['values']['description'];
  $type->mimetypes = array_filter(array_map('trim', explode("\n", $form_state['values']['mimetypes'])));

  file_type_save($type);

  drupal_set_message(t('The annotation type %type has been updated.', array('%type' => $type->label)));
  $form_state['redirect'] = 'admin/structure/annotation';
}

