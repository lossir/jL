//TODO: Утилита будет содержать всевозможные функции упрощающие работу с датами. Думаю сделать как обертку стандартного класса date, чтобы не париться с прототипированием... хотя... надо думать.

/**
 *
 * Date     30.09.14
 * Time     15:19
 *
 * @author  Lossir  lossir@mail.ru
 * @version 2.1
 *
 * @augments jL
 * @requires jL,jQuery
 */


jL.setUtilities('calendar', function (date, options) {
    "use strict";

    date = ($.type(date) === 'date' ? date : new Date()) || new Date();
    var settings = {
//        currentDate  : date || new Date(),
        dayNamesShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        dayNamesFull : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
        monthNamesFull : ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthNamesFullParent  : ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']
    }, methods = {
        /**
         * Получить заданный месяц в виде массива(недели) массивов(дни)
         */
        getMonthsInArray: function (month) {
            date = $.type(this) === 'date' ? this : date;
            if(month){
                date.setMonth(month);
            }
            var dateShift = (new Date(date).jL().set('date', 0).getDay()) - 1,
                weeksCount = function () {
                    return Math.ceil((date.jL().getCountDays() + dateShift) / 7);
                }() + 1,
                weekIndex = 0,
                daysCount = 7,
                dayIndex,
                daysIndex,
                dateIndex = 0,
                dateItem,
                out = [],
                indexFirstDay = date.getDay();
            for(; weekIndex < weeksCount; weekIndex++){
                var week = [];
                for(dayIndex = 0; dayIndex < daysCount; dayIndex++){
//                    week.push(dayIndex);
                    daysIndex = weekIndex*daysCount+dayIndex;
                    if(daysIndex > dateShift){
                        if(daysIndex <= methods.getCountDays() + dateShift){
                            dateIndex = daysIndex - dateShift;
                            dateItem = new Date(date.getFullYear(),date.getMonth(),dateIndex);
                        } else {
                            dateIndex = 0;
                            dateItem = new Date(date.getFullYear(),date.getMonth(),daysIndex-dateShift);
                        }
                    } else {
                        dateIndex = 0;
                        dateItem = new Date(date.getFullYear(),date.getMonth(),daysIndex-dateShift);
                    }
                    week.push(dateItem);
                }
                out.push(week);
            }
            return out;
        },
        /**
         * Возвращает название дня
         *
         * @param [shortName=false]
         * @returns {String}
         */
        getDayName      : function (shortName) {
            var day = date.getDay();
            return (shortName ? settings.dayNamesShort
                : settings.dayNamesFull)[day > 0 ? day-1 : 6];
        },
        /**
         * Возвращает название месяца
         *
         * @returns {String}
         */
        getMonthName      : function () {
            var month = date.getMonth();
            return settings.monthNamesFull[month];
        },
        /**
         * Возвращает название месяца в родительском падеже
         *
         * @returns {String}
         */
        getMonthNameParent      : function () {
            var month = date.getMonth();
            return settings.monthNamesFullParent[month];
        },
        /**
         * Получить количество дней в месяце
         *
         * @returns {Number}
         */
        getCountDays:function() {
            return new Date(date.getFullYear(), date.getMonth()+1 , 0).getDate();
        },
        /**
         * Вызывает стандартные сеттеры объекта Date, возвращая this
         *
         * @param   {string} key       название сеттера, без "set"
         * @param   {*} value     значение, передоваемое в сеттер
         * @returns {Date}
         */
        set: function( key, value ){
            key = 'set' + key.charAt(0).toUpperCase() + key.substr(1).toLowerCase();
            date[key](value);
            return date;
        },
        /**
         * Является ли год проверямой даты, текущим годом
         *
         * @returns {Boolean}
         */
        isYearCurrent: function() {
            return date.getFullYear() === new Date().getFullYear();
        },
        /**
         * Является ли месяц проверямой даты, текущим месяцем
         *
         * @returns {Boolean}
         */
        isMonthCurrent: function (month) {
            return (month || date.getMonth()) === date.getMonth();
        },
        /**
         * Является ли число проверямой даты, текущим числом
         *
         * @param   {Number}  day число месяца
         * @returns {Boolean}
         */
        isDayCurrent  : function (day) {
            return (day || date.getDate()) === new Date().getDate();
        },
        /**
         * Является ли проверяемая дата текущей датой
         *
         * @returns {Boolean}
         */
        isDateCurrent  : function () {
            return (date.getMonth() === new Date().getMonth()) && (date.getFullYear() === new Date().getFullYear()) && (date.getDate() === new Date().getDate());
        },
        /**
         * Является ли проверяемая дата прошедшей
         *
         * @returns {Boolean}
         */
        isDateFuture  : function () {
            var dateCurrent = new Date();
            dateCurrent.setDate( dateCurrent.getDate()-1 );
            return date.getTime() >= dateCurrent.getTime();
        },
        /**
         * Получить массив названий дней
         *
         * @returns {{shortName: *, full: *}}
         */
        getDayNames : function(){
            return {
                'shortName':settings.dayNamesShort,
                'full':settings.dayNamesFull
            };
        },
        /**
         * Получить дату с предыдущим месяцем
         *
         */
        setMonthPrev : function(){
            var newDate = new Date(date);
            newDate.setMonth(date.getMonth()-1);
            newDate.setDate(1);
            return newDate;
        },
        /**
         * Получить дату со следующим месяцем
         *
         */
        setMonthNext : function(){
            var newDate = new Date(date);
            newDate.setMonth(date.getMonth()+1);
            newDate.setDate(1);
            return newDate;
        },
        /**
         * Получить массив названий месяцев
         *
         * @returns {{full: *}}
         */
        getMonthNamesFull : function(){
            return {
                'full':settings.monthNamesFull
            };
        }

    };

    $.extend(settings, options);

    jL.expansionDefineProperty( Date.prototype, 'jL', function(){
        date = this;
        return methods;
    });

    /*
     for(var key in methods) if (methods.hasOwnProperty(key)) {
     jL.expansionDefineProperty( Date.prototype, key, methods[key] )
     }
     */

    return methods;

});








