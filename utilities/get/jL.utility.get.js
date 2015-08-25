/**
 * Утилита выборки элементов на странице
 *
 * Date     16.03.2015
 * Time     12:00
 *
 * @author  Lossir  lossir@mail.ru
 * @version 0.0
 *
 * @augments jL
 * @requires jL
 */

(function(jL, undefined){
    "use strict";

    jL.setUtilities('get', function () {

        var doc = document,
            methods ={
            id : function (id) {
                return doc.getElementById(id);
            },
            'class' : function (className) {
                return doc.getElementsByClassName(className);
            },
            tag : function (tagName) {
                return doc.getElementsByTagName(tagName);
            },
            sel : function (selector) {
                return doc.querySelector(selector);
            },
            sela : function (selector) {
                return doc.querySelectorAll(selector);
            }
        };

        jL.expansionDefineProperty(doc, 'get', methods);
        jL.expansionDefineProperty(window.HTMLCollection.prototype, 'get', methods);
        jL.expansionDefineProperty(window.Element.prototype, 'get', methods);

        return methods;

    }());
}(jL));
