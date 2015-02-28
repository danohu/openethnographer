<?php

/**
 * Annotator Store API
 * 
 * TODO Since this storage API is tied to the Annotator JS library, it should be in the StoreAnnotatorPlugin, 
 * not here in the main module.
 *
 * @see https://github.com/okfn/annotator/wiki/Storage
 */

/**
 * Annotation API main endpoint
 */
function annotation_api_endpoint($id = NULL) {
  $method = $_SERVER['REQUEST_METHOD'];

  switch ($method) {
    case 'GET':
      if (isset($id) && is_numeric($id)) {
        annotation_api_read($id);
      }
      else {
        annotation_api_index();
      }
      break;
    case 'POST':
      annotation_api_create();
      break;
    case 'PUT':
      annotation_api_update($id);
      break;
    case 'DELETE':
      annotation_api_destroy($id);
      break;
  }
}

/**
 * API for tags, to populate the sidebar
 */
function visible_tags($nid){
    $vocabulary = taxonomy_vocabulary_machine_name_load('openethnographer');
    $tree = taxonomy_get_tree($vocabulary->vid);
    // XXX this needs to handle public/private tags
    if(!user_access('view any annotations') ) {
        $tree = array_filter($tree, function($k){
            return $k->uid != $USER->uid;});
    }
    //$parents = array_filter($tree, function($k){
    return $tree;
}


function annotation_api_quotation_list(){
    $tid = $_GET['tid'];
    $term = taxonomy_term_load($tid);
    print("<h2>Content tagged $term->name</h2><br/>");# " + $term->name + "</h2>");
    print(annotation_quotation_list($term));
}



function annotation_api_tags(){
    //XXX filter tags to those present on a page
    // -- complication is that we also need all their ancestors
    if(!empty($_GET['nid'])){
        $nid = $_GET['nid'];
    }

    $vocabulary = taxonomy_vocabulary_machine_name_load('openethnographer');
    $tree = taxonomy_get_tree($vocabulary->vid);
    watchdog('oeth', 'I am a teapot');
    return drupal_json_output(visible_tags());
}
        

/**
 * Annotation API index
 */
function annotation_api_index() {
  if (annotation_access('view')) {
    $records = entity_load_multiple_by_name('annotation', FALSE);
    foreach ($records as $rid => $record) {
      $records[$rid] = annotation_api_entity_prepare($record, 'read');
    }

    // Send response
    return drupal_json_output(array_values($records));
  }
  return FALSE;
}

/**
 * Annotation API create
 */
function annotation_api_create() {
  if (annotation_access('create')) {
    global $user;

    $entity = annotation_api_from_stdin();
    $entity->user = $user->uid;
    $entity->created = REQUEST_TIME;
    $entity->updated = REQUEST_TIME;

    $entity = annotation_api_entity_prepare($entity, 'create');
    entity_save('annotation', $entity);

    // Send response
    return drupal_json_output($entity);
  }
  return FALSE;
}

/**
 * Annotation API read
 */
function annotation_api_read($id) {
  if ($annotation = entity_object_load($id, 'annotation')) {
    if (annotation_access('view', $annotation)) {
      $record = entity_load_single('annotation', $id);
      $record = annotation_api_entity_prepare($record, 'read');
      // Send response
      return drupal_json_output($record);
    }
  }
  return FALSE;
}

/**
 * Annotation API update
 */
function annotation_api_update($id) {
  if ($annotation = entity_object_load($id, 'annotation')) {
    if (annotation_access('edit', $annotation)) {
      $entity = annotation_api_from_stdin();
      $entity->updated = REQUEST_TIME;
      $entity = annotation_api_entity_prepare($entity, 'update');
      entity_save('annotation', $entity);
      // Send response
      drupal_goto('annotation/api/annotations/' . $id, array(), 303);
      return TRUE;
    }
  }
  return FALSE;
}

/**
 * Annotation API destroy
 */
function annotation_api_destroy($id) {
  if ($annotation = entity_object_load($id, 'annotation')) {
    if (annotation_access('delete', $annotation)) {
      entity_delete('annotation', $id);
      // Send response
      drupal_add_http_header('Status', '204 NO CONTENT');
      return drupal_json_output(NULL);
    }
  }
  return FALSE;
}

/**
 * Annotation API search
 */
function annotation_api_search() {
  $total = 0;
  $records = array();

  // Set the $uid query parameter only if the user has the permission to view others' annotations.
  if (user_access('view any annotations') ) {
    if (isset($_GET['user'])) {
      $username = $_GET['user'];
      $account = user_load(array('name' => check_plain($username)));
      $uid = $account->uid;
    }
  }
  else {
    global $user;
    if (isset($user->name)) {
      $uid = $user->uid;
    }
    else {
      $output = array(
        'total' => 0,
        'rows' => array(),
      );
      return drupal_json_output($output);
    }
  }

  // Set all the other query parameters from GET request input.
  // TODO Do we need check_plain here? Or does Drupal do it?

  $limit           = isset($_GET['limit'])           ? $_GET['limit']          : 20;
  $offset          = isset($_GET['offset'])          ? $_GET['offset']         : 0;

  $id              = isset($_GET['id'])              ? $_GET['id']             : NULL;
  $entity_type     = isset($_GET['entity_type'])     ? $_GET['entity_type']    : NULL;
  $entity_id       = isset($_GET['entity_id'])       ? $_GET['entity_id']      : NULL;
  $field_name      = isset($_GET['field_name'])      ? $_GET['field_name']     : NULL;
  $field_delta     = isset($_GET['field_delta'])     ? $_GET['field_delta']    : NULL;
  $field_language  = isset($_GET['field_language'])  ? $_GET['field_language'] : NULL;

  $quote           = isset($_GET['quote'])           ? $_GET['quote']          : NULL;
  $text            = isset($_GET['text'])            ? $_GET['text']           : NULL;
  $language        = isset($_GET['language'])        ? $_GET['language']       : NULL;
  $created         = isset($_GET['created'])         ? $_GET['created']        : NULL;
  $updated         = isset($_GET['updated'])         ? $_GET['updated']        : NULL;

  // Initiate query.
  $query = new EntityFieldQuery();
  $query->entityCondition('entity_type', 'annotation'); // Not related to the annotaton.entity_type field name, but to the Drupal concept.

  if (isset($uid) && $uid) {
    // Use uid instead of user
    $query->propertyCondition('uid', $uid);
  }
  if ($id) {
    $query->propertyCondition('id', $id);
  }
  if ($entity_type) {
    $query->propertyCondition('entity_type', $entity_type, 'LIKE');
  }
  if ($entity_id) {
    $query->propertyCondition('entity_id', $entity_id);
  }
  if ($field_name) {
    $query->propertyCondition('field_name', $field_name, 'LIKE');
  }
  if ($field_delta) {
    $query->propertyCondition('field_delta', $field_delta);
  }
  if ($field_language) {
    $query->propertyCondition('field_language', $field_language, 'LIKE');
  }
  if ($quote) {
    $query->propertyCondition('quote', $quote, 'LIKE');
  }
  if ($text) {
    $query->propertyCondition('text', $text, 'LIKE');
  }
  if ($language) {
    $query->propertyCondition('language', $language, 'LIKE');
  }
  if ($created) {
    $query->propertyCondition('created', $created);
  }
  if ($updated) {
    $query->propertyCondition('updated', $updated);
  }

  

  // Get the total.
  $count_query = clone $query;
  $total = $count_query->count()->execute();
  
  // Set query range.
  if ($limit > 0) {
    $query->range($offset, $limit);
  }
  $result = $query->execute();

  if (isset($result['annotation'])) {
    $annotation_items_nids = array_keys($result['annotation']);
    $records = entity_load_multiple_by_name('annotation', $annotation_items_nids);
  }

  foreach ($records as $rid => $record) {
    $records[$rid] = annotation_api_entity_prepare($record, 'read');
  }

  $output = array(
    'total' => $total,
    'rows' => array_values($records),
  );
  return drupal_json_output($output);
}

/**
 * Obtain an annotation entity object in JSON format from stdin.
 *
 * @see http://php.net/manual/en/features.file-upload.put-method.php
 */
function annotation_api_from_stdin() {
  $json = '';
  $put = fopen('php://input', 'r'); // PUT data comes in on the stdin stream.

  // Read the data, 1 kB at a time, and write it to the file.
  while ($chunk = fread($put, 1024)) {
    $json .= $chunk;
  }
  fclose($put);

  $entity = (object) drupal_json_decode($json);
  $entity = annotation_api_entity_prepare($entity); // TODO Second argument missing to indicate operation?
  return $entity;
}

/**
 * Get a Drupal taxonomy term object from a tag (taxonomy term) name.
 *
 * Finds and returns the first matching taxonomy term object matching the first supplied tag name. (Only the first 
 * supplied tag name is evaluated, all others are ignored!)
 *
 * @param tagarr Array Numeric array, values being tag name strings. Names are treated case-insensitive and ignoring leading 
 *   and trailing whitespace, as per https://api.drupal.org/api/function/taxonomy_get_term_by_name .
 * @param should_create Boolean If true and a tag by the same name does not exist yet, the 
 *   tag will be created and returned.
 * @param $uid ID of the user who must be the owner of the named tag. NULL to not filter by user.
 * @return The tag object, if found or created. Else, NULL.
 */
function get_tag($tagarr, $should_create, $uid=NULL) {
  if (!$tagarr) return NULL;
  $tag_name = $tagarr[0];    
  $vocabulary_name = 'openethnographer';
  $tags = taxonomy_get_term_by_name($tag_name, $vocabulary_name);

  // If the uid filter parameter is given, only consider the tags of the specified user.
  // (The PHP closure technique needs PHP 5.3+; see http://stackoverflow.com/a/10712844/1270008 )
  if ($uid != NULL) {
    $tags = array_filter($tags, function($tag) use($uid) { return $tag->uid == $uid; });
  }

  if ($tags) {
    // Multiple results are possible due to case insensitive search on the trimmed name.
    // But ignored as tags are created below only if they'll be the only result.
    return array_values($tags)[0]; 
  }

  if ($should_create) {
    // PRE: $tagtext is unique in this vocab, as else a tag would've been returned above.
    // (We have to ensure unique tag naming, as Annotator uses names as IDs.)
    global $user;
    $tag = new stdClass();
    $tag->name = $tag_name;
    $vocabulary = taxonomy_vocabulary_machine_name_load($vocabulary_name);
    $tag->vid = $vocabulary->vid;
    $tag->uid = $user->uid;
    taxonomy_term_save($tag);
    return $tag;
  }
  else {
    return NULL;
  }
}

/**
 * Prepare entity for API usage.
 *
 * Necessary because the data provided by a client (like the Annotator JS library) can differ from 
 * proper Drupal annotation entity objects, so these differences have to be fixed first.
 */
function annotation_api_entity_prepare($entity, $op) {
  switch ($op) {
    case 'read':
      // Convert author representation. Drupal uses $entity->uid but Annotator JS expects a descriptive array.
      $account = user_load($entity->uid);
      $entity->user = array(
        'uid' => $account->uid,
        'name' => format_username($account),
        'roles' => array_values($account->roles),
      );
      unset($entity->uid);

      $tag = taxonomy_term_load($entity->tid);
      if ($tag) $entity->tags = array($tag->name);
      // unset($entity->tid); // TODO Probably to activate, as Annotator should know tags only by name. But has to be tested.

      $entity->links[] = array(
        'href' => url('annotation/' . $entity->id),
        'rel' => 'alternate',
        'type' => 'text/html',
      );
      break;

    case 'create':
      $entity->uid = $entity->user; // TODO Isn't Annotator JS using an associative array as in the 'read' case?
      unset($entity->user);

      // The tag is given by name (coming from auto-completion), but annotation entities need a Drupal Taxonomy term ID (tid).
      $tag = get_tag($entity->tags, TRUE, $entity->uid);
      $entity->tid = is_null($tag) ? NULL : $tag->tid;
      unset($entity->tag);
      break;

    case 'update':
      unset($entity->user);

      // The tag is given by name (coming from auto-completion), but annotation entities need a Drupal Taxonomy term ID (tid).
      $tag = get_tag($entity->tags, TRUE, $entity->uid); // Uses the original annotation author's UID, which is correct. Not current user's!
      $entity->tid = is_null($tag) ? NULL : $tag->tid;
      unset($entity->tag);
      break;
  }
  return $entity;
}

