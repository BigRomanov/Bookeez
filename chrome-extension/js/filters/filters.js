define(
'filters/filters',
['bookiesApp'], 
function(bookiesApp) { 'use strict';

  bookiesApp.filter('highlight', function () {
    return function (text, search, caseSensitive) {
      if (search || angular.isNumber(search)) {
        text = text.toString();
        search = search.toString();
        if (caseSensitive) {
          return text.split(search).join('<span class="highlighted">' + search + '</span>');
        } else {
          return text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>');
        }
      } else {
        return text;
      }
    };
  });


  
});