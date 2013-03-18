jQuery(function () {
  
  var hiddenCodeEls = $('pre');
  
  jQuery.each(hiddenCodeEls, function (index, element) {
    var hider = $('<p></p>')
      .append('(')
      .append(
        $('<a href="#">show code</a>')
          .click(function () {
            $(element).show();
            hider.hide();
            return false;
          })
      )
      .append(')');
    
    $(element)
      .before(hider)
      .hide();
      
  });
  
});