Drupal.behaviors.annotation = function (context) {
  if (Drupal.settings.annotation && Drupal.settings.annotation.sections) {
    for (idx in Drupal.settings.annotation.sections) {
      $(idx + ':not(.annotation-processed)', context).each(function () {
        $(this).addClass('annotation-processed');
        // add annotated text click handling
        $('.annotation', this).each(function () {
          var classes = $(this).attr('class').split(' ');
          var comments = [];
          for (idx in classes) {
            var annotation = classes[idx].match(/^annotation-(\d+)$/i);
            if (annotation && annotation.length) {
              comments.push(annotation[1]);
            }
          }
          $(this).data('annotation-comments', comments).click(function() {
            var comments = $(this).data('annotation-comments');
            if (comments && comments.length) {
              location.href="#comment-" + comments[0];
            }
          });
        });
        // add selection handling
        $(this).bind("mouseup", function(){
          localContext = this;
      
          // get range object
          /*
          var range = $(this).getRangeAt();
          console.log(range);
          console.log(range.startOffset, $(range.startContainer));
          console.log(range.endOffset, $(range.endContainer));
      
          console.log(annotationRangeOffset(range, localContext));
          */
      
          // wrap the new selection
          //var sel = $(this).wrapSelection({wrapRange : range}).addClass('annotation-selected');
          var sel = $(this).wrapSelection().addClass('annotation-selected');
          //console.log(sel);
          //console.log(annotationOffset(sel, localContext), sel.text());
          //Drupal.settings.annotation.offsets = annotationOffset(sel, localContext);
      
          // get position/offsets BEFORE we clean up
          var pos = sel.position();
          //console.log(pos);
      
          // remove previous selections
          $('.annotation-selected').not(sel).each(function() {
            annotationUnwrap(this, localContext);
          });
      
          // collapse split selections, from removing old selections
          annotationCollapse(localContext);
      
          // calculate offsets
          $('.annotation-selected').each(function() {
            $(this).data('annotation_offset', annotationOffset(this, localContext));
          });
      
          // remove old annotate buttons
          $('.annotation-button').remove();
      
          // add annotate button
          if (pos) {
            $(localContext).append('<div class="annotation-button"><a href="#comment-form-anchor" onClick="return annotationAnnotate();"><div class="clickable" /></a></div>');
            $('.annotation-button').css({
              top: pos.top,
              left: pos.left + $(sel).width()
            });
          }
        });
      });
    }
  }
}

function annotationAnnotate() {
  // modify the comment form
  $('#comment-form').each(function() {
    var form = this;
    
    /*
    var sel = $('.annotation-selected');
    var offsets = Drupal.settings.annotation.offsets;
    */
    
    // make sure we have an anchor to jump to
    if (!$('a[name=comment-form-anchor]').length) {
      $(form).before('<a name="comment-form-anchor" />');
    }
    
    /*
    // insert values into form
    $(':input[name=subject]', this).each(function() {
      var max = 64;
      if ($(this).attr('maxlength')) {
        max = $(this).attr('maxlength');
      }
      else if ($(this).attr('size')) {
        max = $(this).attr('size');
      }
      $(this).val('"' + sel.text().slice(0, max-6) + '..."');
    });
    $(':input[name=annotation_offset]', this).each(function() {
      $(this).val(offsets.offset);
    });
    $(':input[name=annotation_length]', this).each(function() {
      $(this).val(offsets.len);
    });
    $(':input[name=annotation_string]', this).each(function() {
      $(this).val(sel.text());
    });
    */
    
    // remove old annotation form elements
    var idx = 0;
    while (true) {
      if ($('#edit-annotation-' + idx + '-offset', form).length) {
        $('#edit-annotation-' + idx + '-offset', form).remove();
        $('#edit-annotation-' + idx + '-length', form).remove();
        $('#edit-annotation-' + idx + '-string', form).remove();
      }
      else {
        break;
      }
      idx++;
    }
    
    // set subject
    $(':input[name=subject]', form).each(function() {
      var max = 64;
      if ($(this).attr('maxlength')) {
        max = $(this).attr('maxlength');
      }
      else if ($(this).attr('size')) {
        max = $(this).attr('size');
      }
      $(this).val('"' + $('.annotation-selected').text().slice(0, max-6) + '..."');
    });
    
    // add annotation form elements
    var idx = 0;
    $('.annotation-selected').each(function() {
      var data = $(this).data('annotation_offset');
      $(form).append('<input type="hidden" id="edit-annotation-' + idx + '-offset" name="annotation[' + idx + '][offset]" value="' + data.offset + '">');
      $(form).append('<input type="hidden" id="edit-annotation-' + idx + '-length" name="annotation[' + idx + '][length]" value="' + data.len + '">');
      $(form).append('<input type="hidden" id="edit-annotation-' + idx + '-string" name="annotation[' + idx + '][string]" value="' + $(this).text() + '">');
      
      idx++;
    });
  });
  
  return true;
}

/**
 * Calculates offset/length from annotation element
 */
function annotationOffset(e, context) {
  var offset = 0;
  var length = 0;
  var curr;
  
  // length of combined text
  length = $(e).text().length;
  
  // backtrack to parent context
  curr = $(e);
  while (curr.length && (curr[0] != context)) {
    offset += annotationGetElemOffset(curr);
    curr = curr.parent();
  }
  
  return {offset: offset, len: length};
}

/**
 * Calculates offset/length from range object
 */
function annotationRangeOffset(range, context) {
  var start = range.startOffset;
  var startContainer = $(range.startContainer);
  var end = range.endOffset;
  var endContainer = $(range.endContainer);
  
  var offset = 0;
  var length = 0;
  
  var curr;
  
  // adjust start/end offsets/containers from text nodes to regular nodes
  if (startContainer[0].nodeType == 3) {
    start = annotationGetElemOffset(startContainer) + start;
    startContainer = startContainer.parent();
  }
  if (endContainer[0].nodeType == 3) {
    end = annotationGetElemOffset(endContainer) + end;
    endContainer = endContainer.parent();
  }
  
  // get common element
  var common = annotationFindCommonElement(startContainer, endContainer);
  
  // are the start and end containers the same?
  if (startContainer[0] == endContainer[0]) {
    offset += start;
    length += end - start;
  }
  else {
    // is the start container the common element?
    if (startContainer[0] == common) {
      offset += start;
    }
    else {
      offset += start;
      //length += $(startContainer).text().length - start;
    
      curr = $(startContainer);
      while (curr[0] != common) {
        offset += annotationGetElemOffset(curr);
        curr = $(curr).parent();
      }
    }
  
    // is the end container the common element?
    if (endContainer[0] == common) {
      length += end - offset;
    }
    else {
      length += end;
    
      curr = $(endContainer);
      while (curr[0] != common) {
        length += annotationGetElemOffset(curr);
        curr = $(curr).parent();
      }
      
      length -= offset;
    }
  }
  
  // handle common element down to context
  curr = $(common);
  while (curr.length && (curr[0] != context)) {
    offset += annotationGetElemOffset(curr);
    curr = $(curr).parent();
  }
  
  return {offset: offset, len: length};
}

/**
 * Returns the character offset compared to parent
 */
function annotationGetElemOffset(e) {
  var offset = 0;
  
  /*
  $(e).prev().each(function() {
    var text = $(this).text();
    offset += text.length;
  });
  */
  var parent = $(e).parent();
  if (parent[0]) {
    if (parent[0].childNodes) {
      for (i in parent[0].childNodes) {
        if (parent[0].childNodes[i] == $(e)[0]) {
          break;
        }
    
        // text node
        if (parent[0].childNodes[i].nodeType == 3) {
          // make sure it's not just a newline in the source
          //console.log(parent[0].childNodes[i].nodeValue, $.trim(parent[0].childNodes[i].nodeValue));
          //var before = parent[0].childNodes[i].nodeValue;
          //var after = $.trim(parent[0].childNodes[i].nodeValue);
          //if ($.trim(parent[0].childNodes[i].nodeValue).length) {
            offset += parent[0].childNodes[i].nodeValue.length;
          //}
        }
        // regular element
        else {
          offset += $(parent[0].childNodes[i]).text().length;
        }
      }
    }
  }

  return offset;
}

function annotationFindCommonElement(e1, e2) {
  // make sure e1 and e2 are not the same element
  if ($(e1)[0] == $(e2)[0]) {
    return e1[0];
  }
  
  var e1p = $(e1).parents().andSelf();
  var e2p = $(e2).parents().andSelf();
  var idx = -1;
  var er = null;
  
  if (e1p.length > e2p.length) {
    e1p.each(function() {
      if (this == e2[0]) {
        er = this;
        return false;
      }
      idx = jQuery.inArray(this, e2p);
      if (idx >= 0) {
        er = e2p[idx];
        return false; // break
      }
    });
  }
  else {
    e2p.each(function() {
      if (this == e1[0]) {
        er = this;
        return false;
      }
      idx = jQuery.inArray(this, e1p);
      if (idx >= 0) {
        er = e1p[idx];
        return false; // break
      }
    });
  }

  return er;
}

function annotationUnwrap(e, context) {
  $(e, context).after($(e, context).html());
  $(e, context).remove();
}

function annotationCollapse(context) {
  $('.annotation-selected', context).each(function() {
    var first = this;
    var classes = $(first).attr('class').split(' ');
    
    // TODO: we need a better matching algorithm... as this just assumes it only contains identifying classes
    for (i in classes) {
      if (classes[i] != 'annotation-selected') {
        var next = $(first).next('.annotation-selected');
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

/*
function annotationGetSelection(e) {
  var eStart = 0;
  var eEnd = 0;
  var eLength = 0;
  var eText = '';
  
  if ($.browser.mozilla) {
    eStart = e.selectionStart;
    eEnd = e.selectionEnd;
    eLength = e.selectionEnd - e.selectionStart;
    eText = e.value.substr(e.selectionStart, eLength);
  }
  else if ($.browser.msie) {
    e.focus();
		var range = document.selection.createRange();

		if (r == null) {
			end = e.value.length;
		}
    else {
  		var textRange = e.createTextRange();
  		var textRangeCopy = textRange.duplicate();
  		
  		textRange.moveToBookmark(range.getBookmark());
  		textRangeCopy.setEndPoint('EndToStart', textRange);

  		start: textRangeCopy.text.length;
  		end: textRangeCopy.text.length + range.text.length;
  		length: range.text.length;
  		text: range.text;
  		
  		
      e.focus();

			var r = document.selection.createRange();
			if (r == null) {
				return { start: 0, end: e.value.length, length: 0 }
			}

			var re = e.createTextRange();
			var rc = re.duplicate();
			re.moveToBookmark(r.getBookmark());
			rc.setEndPoint('EndToStart', re);

			return { start: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
		}
  }
  
  return {start: eStart, end: eEnd, length: eLength, text: eText};
}
*/
