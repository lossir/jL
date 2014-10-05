//TODO: Утилита будет содержать всевозможные функции упрощающие работу с датами. Думаю сделать как обертку стандартного класса date, чтобы не париться с прототипированием... хотя... надо думать.

/**
 *
 * Date     30.09.14
 * Time     15:19
 *
 * @author  Lossir  lossir@mail.ru
 * @version 2.0
 *
 * @augments jL
 * @requires jL,jQuery
 */


jL.setUtilities('calendar', function (date, options) {

    date = ($.type(date) == 'date' ? date : new Date()) || new Date();
    var settings = {
//        currentDate  : date || new Date(),
        dayNamesShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        dayNamesFull : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
    }, methods = {
        /**
         * Получить заданный месяц в виде массива(недели) массивов(дни)
         */
        getMonthsInArray: function (month) {
            date = $.type(this) == 'date' ? this : date;
            if(month){
                date.setMonth(month);
            }
            var dateShift = (new Date(date).jL().set('date', 1).getDay()) - 2,
                weeksCount = function () {
                    return Math.ceil((date.jL().getCountDays() + dateShift) / 7);
                }(),
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
                            dateItem = new Date(date.getFullYear(),date.getMonth(),daysIndex-dateShift)
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
         * @param [short=false]
         */
        getDayName      : function (short) {
            var getDay = date.getDay();
            return (short
                ? settings.dayNamesShort
                : settings.dayNamesFull)[getDay > 0 ? getDay-1 : 6];
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
            return date.getFullYear() == new Date().getFullYear();
        },
        /**
         * Является ли месяц проверямой даты, текущим месяцем
         *
         * @returns {Boolean}
         */
        isMonthCurrent: function () {
            return date.getMonth() == new Date().getMonth();
        },
        /**
         * Является ли число проверямой даты, текущим числом
         *
         * @param   {Number}  day число месяца
         * @returns {Boolean}
         */
        isDayCurrent  : function (day) {
            return (day || date.getDate()) == new Date().getDate();
        },
        /**
         * Является ли проверяемая дата текущей датой
         *
         * @returns {Boolean}
         */
        isDateCurrent  : function () {
            return (date.getMonth() == new Date().getMonth()) && (date.getFullYear() == new Date().getFullYear()) && (date.getDate() == new Date().getDate());
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








