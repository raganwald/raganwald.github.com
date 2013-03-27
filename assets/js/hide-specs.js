jQuery(function () {
  
  var hiddenSpecEls = $('pre code')
    .filter(function (index, el) {
      var text = $(el).text(),
          lines = text.split(/[\r?\n]+/),
          trimmed = lines.map(function (str) { return str.trim(); }),
          lns = trimmed.filter(function (ln) { return !ln.match(/^#/); });
          
          return lns.length && lns[0].match(/^describe/);
    }).parent();
  
  jQuery.each(hiddenSpecEls, function (index, element) {
    var hider = $('<p></p>')
      .append('(')
      .append(
        $('<a href="#">show tests</a>')
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