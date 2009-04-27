// Set default annotation style, overridable with drupal_add_js().
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

    var source = $(this);
    source.annotationForm = $('form', source.data('bt-box'));

    // Disable submit button when there is empty content.
    var $submit = $('#edit-submit', source.annotationForm);
    $('#edit-comment', source.annotationForm).focus().keyup(function() {
      if ($(this).attr('value') === '') {
        $submit.attr('disabled', 'disabled');
      }
      else {
        $submit.removeAttr('disabled');
      }
    });

    // Call back the submit event.
    source.annotationForm.submit(function() {
      source.submitAnnotate();
    });

    // Remove annotation on cancel.
    $('a.cancel', source.annotationForm).click(function() {
      source.removeAnnotate();
      return false;
    });
  }
}, Drupal.settings.annotationBtStyle);

$(document).ready(function() {
  // If the URL contains a fragment starting with image-annotate we define the cid of the note to highlight/show
  var url = document.location.toString();
  if (url = url.match(/#annotation-cid-(\d+)$/)) {
    Drupal.showAnnotation(url[1]);
  }
});

Drupal.behaviors.annotation = function(context) {
  var annotationRegExp = /\bannotation-(cid-\d+)\b/g;
  var annotation;

  $('.annotation:not(.annontation-processed)', context).addClass('annotation-processed').each(function () {
    var $this = $(this);
    var content = '';

    // Find the comments.
    while ((annotation = annotationRegExp.exec($this.attr('class'))) !== null) {
      content = content + Drupal.settings.annotationComments[annotation[1]];
    }

    // Add BT bubble containing comments.
    $this.bt(content, Drupal.settings.annotationBtStyle);

    this.showAnnotation = function() {
      $this.parents('.annotated').trigger('mouseenter');
      this.btOn();
      $('html, body').animate({
        scrollTop: Math.min($this.offset().top, $('html, body').scrollTop())
      }, 'fast'); // Hack with html & body scrolling so that it works in Safari
    };
  });

  // Replace the target of the comment links.
  $('a.annotation-link:not(.annotation-processed)', context).addClass('annotation-processed').click(function() {
    Drupal.showAnnotation($(this).attr('href').split(/#annotation-cid-(\d+)$/)[1]);
    return false;
  });
}

jQuery.fn.annotate = function(options) {
  var opts = jQuery.extend(jQuery.annotation.defaults, options);
  jQuery.annotation.active = true;

  // Draw the beauty tip.
  this.bt(Drupal.settings.annotation.form, jQuery.extend({
    trigger: 'none',
    clickAnywhereToClose: false,
    closeWhenOthersOpen: false,
  }, Drupal.settings.annotationBtStyle)).btOn()
  .bind('dragstart', Drupal.saveAnnotationState)
  .bind('resizestart', Drupal.saveAnnotationState)
  .bind('dragstop', Drupal.restoreAnnotationState)
  .bind('resizestop', Drupal.restoreAnnotationState);

  this.get(0).removeAnnotate = function() {
    opts.preHide.apply(this);
    this.btOff();
    opts.postHide.apply(this);
    jQuery.annotation.active = false;
    return this;
  };

  this.get(0).submitAnnotate = function() {
    opts.submit.apply(this);
  };

  return this;
};

jQuery.fn.removeAnnotate = function() {
  return this.each(function() {
    if ($.isFunction(this.removeAnnotate)) {
      this.removeAnnotate();
    }
  });
};

jQuery.fn.submitAnnotate = function() {
  return this.each(function() {
    if ($.isFunction(this.submitAnnotate)) {
      this.submitAnnotate();
    }
  });
};

jQuery.fn.showAnnotation = function() {
  return this.each(function() {
    if ($.isFunction(this.showAnnotation)) {
      this.showAnnotation();
    }
  });
};

Drupal.showAnnotation = function(cid) {
  $('.annotation-cid-' + cid).showAnnotation();
}

Drupal.saveAnnotationState = function() {
  $this = $(this);
  $this.data('annotation-data', {
    '#edit-comment': $('#edit-comment', $this.data('bt-box')).attr('value')
  });
  this.btOff();
};

Drupal.restoreAnnotationState = function() {
  $this = $(this);
  this.btOn();
  $('#edit-comment', $this.data('bt-box')).attr('value', $this.data('annotation-data')['#edit-comment']).keyup();
  $this.removeData('annotation-data');
};

jQuery.annotation = {
  active: false, // Is there is an active annotation?
  defaults: {
    submit:   function(){return;}, // Run on submit.
    preHide:  function(){return;}, // Run before popup is cancelled.
    postHide: function(){return;}  // Run after popup is cancelled.
  }
};
