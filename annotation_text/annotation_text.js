Drupal.behaviors.annotation_text = function (context) {
  if (Drupal.settings.annotation_text && Drupal.settings.annotation_text.sections) {
    // Set default annotation style, overridable with drupal_add_js().
    Drupal.settings.annotationBtStyle = jQuery.extend({
      width: 250,
      fill: '#fff',
      strokeStyle: '#777',
      spikeLength: 8,
      spikeGirth: 6,
      positions: ['bottom'],
    }, Drupal.settings.annotationBtStyle);

    for (idx in Drupal.settings.annotation_text.sections) {
      $(idx + ':not(.annotation-text-processed)', context).each(function () {
        $(this).addClass('annotation-text-processed');

        // add annotated text click handling
        annotation_text_attach_click(this);

        // add selection handling
        annotation_text_attach_mouseup(this);
      });
    }
  }
}

/**
 * Attach click handling to annotated text
 */
function annotation_text_attach_click(e) {
  $('.annotation-text', e).each(function () {
    // parse classes
    var classes = $(this).attr('class').split(' ');
    var color_class = 'annotation-text';
    var comments = [];
    for (idx in classes) {
      var text_color = classes[idx].match(/^annotation-text-(\d+)$/i);
      if (text_color && text_color.length) {
        color_class = color_class + ' annotation-text-' + text_color[1];
      }

      var annotation_text = classes[idx].match(/^annotation-text-cid-(\d+)$/i);
      if (annotation_text && annotation_text.length) {
        comments.push(annotation_text[1]);
      }
    }

    // build selector for appropriate comments
    var selector = '';
    for (idx in comments) {
      // create selector
      if (selector.length) {
        selector = selector + ', ';
      }
      selector = selector + "#comment-" + comments[idx] + " + .comment";
    }

    // add BT bubble containing comments
    $(this).data('annotation_text_comments', comments).bt(jQuery.extend({
      trigger: 'click',
      contentSelector: "$('" + selector + "')",
      closeWhenOthersOpen: true,
      postShow: function() {
        $(selector, $('.bt-content')).addClass(color_class);
      }
    }, Drupal.settings.annotationBtStyle));
  });
}

/**
 * Attach mouseup handling to text body
 */
function annotation_text_attach_mouseup(e) {
  $(e).bind("mouseup", function(){
    localContext = this;

    // wrap selection in span, so it's selectable with jquery
    var sel = $(this).wrapSelection().addClass('annotation-text-selected');

    // empty selection?
    if (!sel.length) {
      // remove previous selections
      $('.annotation-text-selected').each(function() {
        $(this).btOff()
        annotation_text_unwrap(this, localContext);
      });

      // don't try to go further is no selection
      return;
    }
    else {
      // remove previous selections
      $('.annotation-text-selected').not(sel).each(function() {
        $(this).btOff()
        annotation_text_unwrap(this, localContext);
      });
    }

    // create a BT bubble with annotate link
    // we have to set it on a timer due to timing issues
    var annotate = setTimeout('$(".annotation-text-selected:last").bt("<a class=\'annotation-text-selected-link\' onClick=\'annotation_text_annotate();\'>Annotate</a>", {trigger: "none",closeWhenOthersOpen: true, width: 70}).btOn();', 5);

    // If the new selection cross the spans from an old selection the new spans
    // could be broken up into small pieces, so we collapse split selections.
    annotation_text_collapse(localContext);

    // Wrapping the selection in spans, clears the selection. Recreate the
    // selection now that we are done modifying the DOM.
    annotation_text_select_node(sel);

    // Calculate offset data for each selection span.
    $('.annotation-text-selected').each(function() {
      $(this).data('annotationTextOffset', annotationTextOffset(this, localContext));
    });
  });
}

/**
 * Recreate selection based upon passed element(s). If more than one element is
 * passed, the beginning is the first element, and the end is the last.
 *
 * TODO: This needs cross-browser lovin'
 */
function annotation_text_select_node(e) {
  var selection, textRange, range, doc, win;

  if ((doc = e[0].ownerDocument) && (win = doc.defaultView) && typeof win.getSelection != 'undefined' && typeof doc.createRange != 'undefined' && (selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined') {
    selection.removeAllRanges();
    $(e).each(function() {
      range = doc.createRange();
      range.selectNode(this);
      selection.addRange(range);
    });
  }
  else if (document.body && typeof document.body.createTextRange != 'undefined' && (textRange = document.body.createTextRange())) {
    var start = document.body.createTextRange();
    var end = start.duplicate();

    start.moveToElementText(e[0]);
    end.moveToElementText(e[e.length-1]);
    start.setEndPoint('EndToEnd', end);
    start.select();
  }
}

/**
 * Callback for the text annotate button
 */
function annotation_text_annotate() {
  // attach BT bubble to first selected span
  $('.annotation-text-selected:first').bt(jQuery.extend({
    trigger: 'none',
    clickAnywhereToClose: false,
    closeWhenOthersOpen: true,
    ajaxPath: Drupal.settings.annotation_text.url.form,
    postShow: function(a) {
      // Fill hidden form elements with offset data.
      var $form = $('.bt-content #annotation-form');
      var $selection = $('.annotation-text-selected');
      var offset = $selection.data('annotationTextOffset');
      $('#edit-annotation-text-offset', $form).attr('value', offset.offset);
      $('#edit-annotation-text-length', $form).attr('value', offset.length);
      $('#edit-annotation-text-string', $form).attr('value', $selection.text());
    }
  }, Drupal.settings.annotationBtStyle)).btOn();

  return false;
}

/**
 * Calculates offset data for e. Offsets are based upon context.
 */
function annotationTextOffset(e, context) {
  var $curr = $(e);
  var offset = {
    offset: 0,
    length: $curr.text().length,
  }
  console.log($(context).html());

  // Backtrack to parent context.
  while ($curr.length && ($curr.get(0) != context)) {
    offset.offset += annotationTextGetElementOffset($curr);
    $curr = $curr.parent();
  }

  return offset;
}

/**
 * Returns the character offset compared to parent
 *
 * TODO: This needs some cross-browser lovin'
 */
function annotationTextGetElementOffset(e) {
  var offset = 0;

  var parent = $(e).parent();
  if (parent[0]) {
    if (parent[0].childNodes) {
      for (i in parent[0].childNodes) {
        // break if we hit target node
        if (parent[0].childNodes[i] == $(e)[0]) {
          break;
        }
        
        // text node
        if (parent[0].childNodes[i].nodeType == 3) {
          offset += parent[0].childNodes[i].nodeValue.length;
        }
        // regular element
        else if (parent[0].childNodes[i].nodeType == 1) {
          offset += $(parent[0].childNodes[i]).text().length;
        }
      }
    }
  }

  return offset;
}

/**
 * The opposite of $.wrap()
 */
function annotation_text_unwrap(e, context) {
  $(e, context).after($(e, context).html());
  $(e, context).remove();
}

/**
 * Attempt to collapse selection spans that are right next to each other.
 */
function annotation_text_collapse(context) {
  $('.annotation-text-selected', context).each(function() {
    var first = this;
    var classes = $(first).attr('class').split(' ');

    // TODO: we need a better matching algorithm... as this just assumes it only contains identifying classes
    for (i in classes) {
      if (classes[i] != 'annotation-text-selected') {
        var next = $(first).next('.annotation-text-selected');
        if (next.length > 0) {
          if ($(next).hasClass(classes[i])) {
            $(first).append($(next).html());
            $(next).remove();
            return $(first);
          }
        }
      }
    }
  });
}
