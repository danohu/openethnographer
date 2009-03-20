Drupal.behaviors.annotationText = function (context) {
  // Set default annotation style, overridable with drupal_add_js().
  if (typeof Drupal.settings.annotationBtStyle === 'undefined') {
    Drupal.settings.annotationBtStyle = jQuery.extend({
      width: 250,
      fill: '#fff',
      strokeStyle: '#777',
      spikeLength: 8,
      spikeGirth: 6,
      positions: ['bottom'],
      postShow: function() {
        $('.bt-content').each(function() {
          Drupal.attachBehaviors(this);
        });
      }
    }, Drupal.settings.annotationBtStyle);
  }

  // Annotate link.
  $('a.annotation-text-selected-link:not(.processed)').addClass('processed').click(function() {
    // Attach BT bubble to first selected span.
    $('.annotation-text-selected:first').bt(Drupal.settings.annotation_text.form, jQuery.extend({
      trigger: 'none',
      clickAnywhereToClose: false,
      closeWhenOthersOpen: true,
    }, Drupal.settings.annotationBtStyle)).btOn();

    return false;
  });

  // Annotation form.
  $annotationForm = $('#annotation-form:not(.processed)');
  if ($annotationForm.length > 0) {
    $annotationForm.addClass('processed');
    // Fill hidden form elements with offset data.
    var $selection = $('.annotation-text-selected');
    var offset = $selection.data('annotationTextOffset');
    var $submit = $('#edit-submit', $annotationForm);
    $('#edit-annotation-text-offset', $annotationForm).attr('value', offset.offset);
    $('#edit-annotation-text-length', $annotationForm).attr('value', offset.length);
    $('#edit-annotation-text-string', $annotationForm).attr('value', $selection.text());
    $('#edit-comment', $annotationForm).focus().keyup(function() {
      if ($(this).attr('value') === '') {
        $submit.attr('disabled', 'disabled');
      }
      else {
        $submit.removeAttr('disabled');
      }
    });
    $('a.cancel', $annotationForm).click(annotationTextRemove);
  }

  if (Drupal.settings.annotation_text && Drupal.settings.annotation_text.sections) {
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
 * Attach click handling to annotated text.
 */
function annotation_text_attach_click(e) {
  var annotationClass = /^annotation-text-(cid-\d+)$/;

  $('.annotation-text', e).each(function () {
    var $this = $(this);

    // Find the comments.
    var content = '';
    jQuery.each($this.attr('class').split(' '), function(n, class) {
      var annotation_text = annotationClass.exec(class);
      if (annotation_text && annotation_text.length) {
        content = content + Drupal.settings.annotationComments[annotation_text[1]];
      }
    });

    // Add BT bubble containing comments.
    $this.bt(content, jQuery.extend({
      trigger: 'click',
      closeWhenOthersOpen: true
    }, Drupal.settings.annotationBtStyle));
  });
}

/**
 * Attach mouseup handling to text body
 */
function annotation_text_attach_mouseup(e) {
  $(e).bind('mouseup', function(){
    localContext = this;

    // Wrap selection in span, so it is selectable with jQuery.
    var $sel = $(this).wrapSelection().addClass('annotation-text-selected');

    // Remove previous selections
    annotationTextRemove($sel);

    // Don't try to go further is no selection.
    if ($sel.length === 0) {
      return;
    }

    // Create a BT with annotate link we have to set it on a timer due
    // to timing issues.
    var annotate = setTimeout(function() {
      $('.annotation-text-selected:last').bt(Drupal.settings.annotation_text.prompt, jQuery.extend({
        trigger: 'none',
        closeWhenOthersOpen: true
      }, Drupal.settings.annotationBtStyle, {width: 70})).btOn();
    }, 5);

    // If the new selection cross the spans from an old selection the new spans
    // could be broken up into small pieces, so we collapse split selections.
    annotation_text_collapse(localContext);

    // Wrapping the selection in spans, clears the selection. Recreate the
    // selection now that we are done modifying the DOM.
    annotation_text_select_node($sel);

    // Calculate offset data for each selection span.
    $('.annotation-text-selected').each(function() {
      $(this).data('annotationTextOffset', annotationTextOffset(this, localContext));
    });
  });
}

/**
 * Remove unused annotation tips.
 */
function annotationTextRemove($keep) {
  $elements = $('.annotation-text-selected');
  if (typeof $keep !== 'undefined') {
    $elements = $elements.not($keep);
  }
  $elements.each(function() {
    var $this = $(this);
    $this.btOff().after($this.html()).remove();
  });

  return false;
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
 * Calculates offset data for e. Offsets are based upon context.
 */
function annotationTextOffset(e, context) {
  var $curr = $(e);
  var offset = {
    offset: 0,
    length: $curr.text().length,
  }

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
