
// Set default annotation style, overridable with drupal_add_js().
Drupal.settings.annotationBtStyle = jQuery.extend({
  width: 250,
  fill: '#fff',
  strokeStyle: '#777',
  spikeLength: 8,
  spikeGirth: 6,
  positions: ['bottom'],
  postShow: function () {
    $('.bt-content').each(function () {
      Drupal.attachBehaviors(this);
    });

    var source = $(this);
    source.annotationBox = $(source.data('bt-box'));
    source.annotationForm = $('form', source.annotationBox);

    if (source.annotationForm.length) {
      // Disable submit button when there is empty content.
      var $submit = $('#edit-submit', source.annotationForm);
      var $edit = $('#edit-comment', source.annotationForm).focus().keyup(function () {
        if ($(this).attr('value') === '') {
          $submit.attr('disabled', 'disabled');
        }
        else {
          $submit.removeAttr('disabled');
        }
      });

      // Fill in comment being edited.
      var comment = source.data('annotationEditComment');
      if (comment !== undefined) {
        $edit.attr('value', comment.comment).keyup();
        $('#edit-cid', source.annotationForm).attr('value', comment.cid);
        $('#edit-pid', source.annotationForm).attr('value', comment.pid);
        $('#edit-uid', source.annotationForm).attr('value', comment.uid);
      }

      // Call back the submit event.
      source.annotationForm.submit(function () {
        source.submitAnnotate();
      });
    }

    // Remove annotation on cancel.
    $('a.cancel', source.annotationForm).click(function () {
      source.removeAnnotate().removeClass('annotation-processed');
      Drupal.behaviors.annotation(source.parent());
      return false;
    });

    // Highlight clicked comment.
    $('a[href*=#comment-]', source.annotationBox).click(function () {
      $('.annotation-active').removeClass('annotation-active');
      var $comment = $('' + $(this).attr('href').match(/#comment-\d*/));
      if ($comment.is('a')) {
        $comment = $comment.next();
      }
      $comment.addClass('annotation-active');
    });

    // Edit annotation link.
    $('a[href*=#annotation-]', source.annotationBox).click(function () {
      var match = $(this).attr('href').match(/#annotation-(edit|reply)-(\d+)\b/);
      var comment = Drupal.settings.annotationCommentsSource['cid-' + match[2]];
      switch (match[1]) {
        case 'edit':
          source.annotate(jQuery.extend({
            comment: comment
          }, Drupal[comment.annotation.options]));
          break;

        case 'reply':
          source.annotate(jQuery.extend({
            comment: {
              pid: comment.cid,
              comment: ''
            }
          }, Drupal[comment.annotation.options]));
          break;
      }
      return false;
    });
  }
}, Drupal.settings.annotationBtStyle);

$(document).ready(function () {
  // If the URL contains a fragment starting with image-annotate we define the cid of the note to highlight/show
  var url = document.location.toString().match(/#annotation-cid-(\d+)$/);
  if (url !== null) {
    Drupal.showAnnotation(url[1]);
  }
});

Drupal.behaviors.annotation = function (context) {
  var annotationRegExp = /\bannotation-(cid-\d+)\b/g,
    annotation;

  $('.annotation:not(.annontation-processed)', context).addClass('annotation-processed').each(function () {
    var $this = $(this),
      content = '';

    // Find the comments.
    while ((annotation = annotationRegExp.exec($this.attr('class'))) !== null) {
      content = content + Drupal.settings.annotationComments[annotation[1]];
    }

    // Count over & out for both annotation and beautytip for linked hovering.
    this.annotationOver = function (event) {
      var box = $this.data('bt-box');
      if (box === undefined) {
        this.btOn();
        box = $this.data('bt-box');
        box.annotationOverCount = 0;
        box.annotationOff = function () {
          $this.btOff();
        };
        box.hoverIntent({
          timeout: 500,
          over: this.annotationOver,
          out: this.annotationOut
        });
      }
      box.annotationOverCount += 1;
    };
    this.annotationOut = function (event) {
      var box = $this.data('bt-box');
      if (box !== undefined) {
        box.annotationOverCount -= 1;
        if (box.annotationOverCount === 0) {
          box.annotationOff();
        }
      }
    };

    // Add BT bubble containing comments.
    $this.bt(content, jQuery.extend({
    }, Drupal.settings.annotationBtStyle)).hoverIntent({
      timeout: 500,
      over: this.annotationOver,
      out: this.annotationOut
    });

    this.showAnnotation = function () {
      $this.parents().show();
      this.annotationOver();
      $this.data('bt-box').annotationOverCount = 0;
      // Hack with html & body scrolling so that it works in Safari
      $('html, body').scrollTop(Math.min($this.offset().top, $('html, body').scrollTop()));
    };
  });

  // Replace the target of the comment links.
  $('a.annotation-link:not(.annotation-processed)', context).addClass('annotation-processed').click(function () {
    Drupal.showAnnotation($(this).attr('href').split(/#annotation-cid-(\d+)$/)[1]);
    return false;
  });
};

jQuery.fn.annotate = function (options) {
  var opts = jQuery.extend({}, jQuery.annotation.defaults, options);
  jQuery.annotation.active = true;

  if (opts.comment !== undefined) {
    this.data('annotationEditComment', opts.comment);
  }

  opts.preShow.apply(this);

  // Draw the beauty tip.
  this.bt(Drupal.settings.annotation.form, jQuery.extend({
    trigger: 'none',
    clickAnywhereToClose: false,
    closeWhenOthersOpen: false
  }, Drupal.settings.annotationBtStyle)).btOn()
  .bind('dragstart', Drupal.saveAnnotationState)
  .bind('resizestart', Drupal.saveAnnotationState)
  .bind('dragstop', Drupal.restoreAnnotationState)
  .bind('resizestop', Drupal.restoreAnnotationState);

  this.get(0).removeAnnotate = function () {
    opts.preHide.apply(this);
    this.btOff();
    jQuery.annotation.active = false;
    opts.postHide.apply(this);
    return this;
  };

  this.get(0).submitAnnotate = function () {
    $('#edit-submit', this.annotationForm).attr('disabled', 'disabled');
    opts.submit.apply(this);
  };

  return this;
};

jQuery.fn.removeAnnotate = function () {
  return this.each(function () {
    if ($.isFunction(this.removeAnnotate)) {
      this.removeAnnotate();
    }
  });
};

jQuery.fn.submitAnnotate = function () {
  return this.each(function () {
    if ($.isFunction(this.submitAnnotate)) {
      this.submitAnnotate();
    }
  });
};

jQuery.fn.showAnnotation = function () {
  return this.each(function () {
    if ($.isFunction(this.showAnnotation)) {
      this.showAnnotation();
    }
  });
};

Drupal.showAnnotation = function (cid) {
  $('.annotation-cid-' + cid).showAnnotation();
};

Drupal.saveAnnotationState = function () {
  var $this = $(this);
  $this.data('annotation-data', {
    '#edit-comment': $('#edit-comment', $this.data('bt-box')).attr('value')
  });
  this.btOff();
};

Drupal.restoreAnnotationState = function () {
  var $this = $(this);
  this.btOn();
  $('#edit-comment', $this.data('bt-box')).attr('value', $this.data('annotation-data')['#edit-comment']).keyup();
  $this.removeData('annotation-data');
};

jQuery.annotation = {
  active: false, // Is there is an active annotation?
  defaults: {
    submit:   function () { // Run on submit.
      return;
    },
    preShow:  function () { // run before popup is constructed.
      return;
    },
    preHide:  function () { // Run before popup is cancelled.
      return;
    },
    postHide: function () { // Run after popup is cancelled.
      return;
    }
  }
};
