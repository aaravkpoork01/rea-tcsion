// JavaScript Document
var secArr = [[1, 2, 3], [4, 5]];
jQuery(document).ready(function (e) {
    var windowH = jQuery(window).height();
    var headerH = jQuery('#header').outerHeight();
    var titleH = jQuery('.titlepath').outerHeight();
//    var btnsectionH = jQuery('.btnsection').outerHeight();
    var calcH = windowH - (headerH + titleH ) - 63;
    jQuery('#instructdiv').css('height', calcH + 'px');
    var userHeight = windowH - (headerH) - 23;
    jQuery('.userprofilediv').css('height', userHeight + 'px');

});

