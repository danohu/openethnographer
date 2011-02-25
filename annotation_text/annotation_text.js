
Drupal.behaviors.annotationText = function (context) {
  // Annotate link.
  $('a.annotation-text-selected-link:not(.processed)').addClass('processed').click(function () {
    // Attach BT bubble to last selected span.
    $('.annotation-text-selected:last').annotate(Drupal.textAnnotationOptions);

    return false;
  });

  if (Drupal.settings.annotation_text && Drupal.settings.annotation_text.sections) {
    for (idx in Drupal.settings.annotation_text.sections) {
      $(idx + ':not(.annotation-text-processed)', context).each(function () {
        $(this).addClass('annotation-text-processed');

        // add selection handling
        if (Drupal.settings.annotation.form !== undefined) {
          annotationTextAttachMouseup(this);
        }
      });
    }
  }
};

Drupal.textAnnotationOptions = {
  submit: function () {
    // Fill hidden form elements with offset data.
    var text = $('.annotation-text-selected').text();
    $('#edit-annotation-text-offset', this.annotationForm).attr('value', $(this).data('annotationTextOffset'));
    $('#edit-annotation-text-string', this.annotationForm).attr('value', text);
    $('#edit-annotation-text-length', this.annotationForm).attr('value', text.length);
  },
  postHide: annotationTextRemove
};

/**
 * Attach mouseup handling to text body
 */
function annotationTextAttachMouseup(e) {
  $(e).bind('mouseup', function () {
    // Do nothing if there is an active annotation.
    if (jQuery.annotation.active) {
      return;
    }

    // Remove previous selections
    $('.annotation-text-selected').btOff();

    // Wrap selection in span, so it is selectable with jQuery.
    var $sel = $(this).wrapSelection().addClass('annotation-text-selected');

    // Don't try to go further is no selection.
    if ($sel.length === 0) {
      return;
    }

    // Create a BT with annotate link we have to set it on a timer due
    // to timing issues.
    setTimeout(function () {
      $('.annotation-text-selected:last').bt(Drupal.settings.annotation_text.prompt, jQuery.extend({
        trigger: 'none',
        closeWhenOthersOpen: true,
        postHide: annotationTextRemove
      }, Drupal.settings.annotationBtStyle, {width: 70})).btOn();
    }, 5);

    // If the new selection cross the spans from an old selection the new spans
    // could be broken up into small pieces, so we collapse split selections.
    annotation_text_collapse(this);

    // Wrapping the selection in spans, clears the selection. Recreate the
    // selection now that we are done modifying the DOM.
    annotation_text_select_node($sel);

    // Calculate offset for the first span.
    $('.annotation-text-selected:last').data('annotationTextOffset', annotationTextOffset($('.annotation-text-selected:first'), this));
  });
}

/**
 * Remove unused annotation tips.
 */
function annotationTextRemove() {
  if (!jQuery.annotation.active) {
    $('.annotation-text-selected').each(function () {
      var $this = $(this);
      $this.after($this.html()).remove();
    });
  }
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
    $(e).each(function () {
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
function annotationTextOffset($curr, context) {
  var offset = 0;

  // Backtrack to parent context.
  while ($curr.length && ($curr.get(0) != context)) {
    offset += annotationTextGetElementOffset($curr);
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
 * Attempt to collapse selection spans that are right next to each other.
 */
function annotation_text_collapse(context) {
  $('.annotation-text-selected', context).each(function () {
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
