/**
 * Carousel - плагин для реализации эффекта слайд-шоу
 *
 * Date     30.08.14
 * Time     19:32
 *
 * @author  Lossir  lossir@mail.ru
 * @version 2.1
 *
 * @augments jL
 * @requires jL,jQuery
 */

;
(function (jL, $, undefined) {

    jL.setPlugin('carousel', function (method, options) {

        var settings = {
                /**
                 * Родительское окно
                 * @type {HTMLElement|jQuery}
                 *
                 * @defaultValue this
                 */
                'window'   : this,
                /**
                 * Элементы перемещения
                 * @type {jQuery}
                 */
                items      : this.find('>*'),
                /**
                 * Функция, принимающая методы управления слайд-шоу
                 * @type {Function|null}
                 *
                 * @param {Object} control  Объект содержит метода упраления слайд-шоу
                 *
                 * @defaultValue null
                 */
                callback   : null,
                /**
                 * Функция, определяющая способ смены слайдов
                 *
                 * @param {Number}  prevItemsIndexStart     Индекс первого элемента предыдущего показа
                 * @param {Number}  currentItemsIndexStart  Индекс первого элемента текущего показа
                 * @param {Array}   prevItemsIndex          Массив всех элементов прошлого показа
                 * @param {Array}   currentItemsIndex       Массив всех элементов текущего показа
                 * @param {Array}   prevItemsIndexCut       Массив уникальных элементов прошлого показ
                 * @param {Array}   currentItemsIndexCut    Массив уникальных элементов текущего показа
                 */
                replace    : function (prevItemsIndexStart, currentItemsIndexStart, prevItemsIndex, currentItemsIndex, prevItemsIndexCut, currentItemsIndexCut) {
                    var speed = settings.speed,
                        animation = {},
                        orientation = settings.orientation == 'vertical'
                            ? 'top'
                            : 'left';
                    switch (settings.style) {
                        case "all":
                            var widthItem = 100 / settings.limit;
                            settings.items.show().each(function (index) {
                                animation[orientation] = ((index - currentItemsIndexStart) * widthItem) + '%';
                                $(this).animate(animation,speed);
                            });
                            break;
                        case "now":
                            var items = settings.items.hide(),
                                hideShift = '-100%',
                                showShift = '100%';
                            if(prevItemsIndexStart>currentItemsIndexStart){
                                hideShift = '100%';
                                showShift = '-100%';
                            }
                            animation[orientation] = hideShift;
                            items.eq(prevItemsIndexStart).show().animate(animation, speed, function () {
                                $(this).hide()
                            });
                            animation[orientation] = '0%';
                            items.eq(currentItemsIndexStart).show().css(orientation, showShift).animate(animation, speed)
                    }
                },
                /**
                 * Цикличность
                 * @type {Boolean}
                 *
                 * @defaultValue true
                 */
                loop       : true,
                /**
                 * Автоматическая смена слайдов [в миллисекундах]
                 * @type {null|Number}
                 *
                 * @defaultValue null
                 */
                auto       : null,
                /**
                 * Стиль смены сладов
                 * @type {String} "now","all"
                 *
                 * @defaultValue "all"
                 */
                style      : "all",
                /**
                 * Скорость смены сладов
                 * @type {Number}
                 *
                 * @defaultValue 300
                 */
                speed      : 300,
                /**
                 * Класс, добавляемый показываемым слайдам
                 * @type {String|undefined}
                 *
                 * @defaultValue "selected"
                 */
                selected   : "selected",
                /**
                 * Ориентация движений   horizontal || vertical
                 * @type {String}
                 *
                 * @defaultValue "horizontal"
                 */
                orientation: "horizontal",
                /**
                 * Количество элементов, показываемых за раз
                 * @type {Number}
                 *
                 * @defaultValue 1
                 */
                limit      : 1,
                /**
                 * Количество элементов, сдвигаемых за раз
                 * @type {Number}
                 *
                 * @defaultValue 1
                 */
                shift      : 1,
                /**
                 * Порядковый номер слайда, первого в списке показываемых
                 * @type {Number}
                 *
                 * @defaultValue 0
                 */
                start      : 0,
                /**
                 * Элементы html на которые надо повешать события управления слайд-шоу
                 */
                controlBack   : undefined,
                controlForward: undefined,
                controlDot    : undefined
            },
            methods = {
                /**
                 * Инициализация плагина
                 */
                init: function () {
                    var currentItemsIndex = [],
                        prevItemsIndex = [],
                        start = settings.start,
                        limit = settings.limit,
                        items = settings.items,
                        orientation = settings.orientation,
                        widthItem = 100 / limit,
                        /**
                         * Управление слайдами
                         *
                         * @param action {Number|String} ('-'|'+')
                         */
                            control = function (action) {

                            var currentItemsIndexStart = currentItemsIndex[0] || 0,
                                prevItemsIndexStart = currentItemsIndexStart,
                                shift = items.length - settings.limit,
                                currentItemsIndexCut,
                                prevItemsIndexCut,
                                /**
                                 * Добавляет класс выделенным пунктам
                                 */
                                    selected = function () {
                                    items.removeClass(settings.selected)
                                        .eq(currentItemsIndexStart).addClass(settings.selected);

                                    if (settings.controlDot) {
                                        settings.controlDot.removeClass(settings.selected)
                                            .eq(currentItemsIndexStart).addClass(settings.selected);
                                    }
                                },
                                /**
                                 * Определяет индекс первого элемента в текущем показе с учетом зацикливания
                                 *
                                 * @returns {Number}
                                 */
                                    loopTest = function () {
                                    if (currentItemsIndexStart > shift) {
                                        return settings.loop && prevItemsIndexStart == shift
                                            ? 0
                                            : shift;
                                    }
                                    else
                                        if (currentItemsIndexStart < 0) {
                                            return settings.loop && prevItemsIndexStart == 0
                                                ? shift
                                                : 0;
                                        }
                                        else return currentItemsIndexStart;
                                };

                            /**
                             * Определяем как сдвигать элементы: по указанному индексу или в конкретную сторону
                             * Вычисляем индекс первого элемента в текущем показе
                             */
                            if (/\d/.test(action)) {
                                if (action < shift) shift = action;
                                currentItemsIndexStart = shift;
                            }
                            else {
                                if (/(\+|\-)/.test(action)) {
                                    currentItemsIndexStart += +(action + 1) > 0
                                        ? settings.shift
                                        : -settings.shift;
                                    currentItemsIndexStart = loopTest();
                                }
                                else return;
                            }

                            if (settings.selected)selected();

                            /* Если первый элемента не изменился - ничего не делаем */
                            if (currentItemsIndexStart == prevItemsIndexStart)return;

                            /* Определяем индексы всех элементов прошлого и текущего показа */
                            prevItemsIndex = currentItemsIndex;
                            currentItemsIndex = [];
                            for (var i = 0, j; i < limit; i++) {
                                j = currentItemsIndexStart + i;
                                currentItemsIndex.push(j);
                            }

                            /* Определяем индексы уникальных элементов прошлого и текущего показа */
                            currentItemsIndexCut = currentItemsIndex.diff(prevItemsIndex);
                            prevItemsIndexCut = prevItemsIndex.diff(currentItemsIndex);

                            settings.replace.call(items, prevItemsIndexStart, currentItemsIndexStart, prevItemsIndex, currentItemsIndex, prevItemsIndexCut, currentItemsIndexCut);

                        },
                        resize = function () {

                            items[orientation == 'vertical'
                                ? 'height'
                                : 'width'](widthItem + '%');
                            items.each(function (index) {
                                $(this).css(orientation == 'vertical'
                                    ? 'top'
                                    : 'left', index * (widthItem) + '%');

                                if (index >= start && index < start + limit) {
                                    currentItemsIndex.push(index);
                                }
                            });

                        },
                        controlActionOn = function() {
                            var ready = true,
                                sett,
                                autoTimerId = 0,
                                test = function (action) {
                                    /* Делаем проверку, чтобы вызовы событий смены слайдов не накладывались и не сбивались */
                                    if (ready) {
                                        control(action);
                                        ready = false;
                                        clearTimeout(sett);
                                        if (settings.auto)autoTimer();
                                        sett = setTimeout(function () {
                                            ready = true;
                                        }, settings.speed);
                                    }
                                },
                                autoTimer = function () {
                                    clearInterval(autoTimerId);
                                    autoTimerId = setInterval(function () {
                                        test('+');
                                    }, settings.auto)
                                };
                            if (settings.controlBack) settings.controlBack.on('click', function () {
                                test('-')
                            });
                            if (settings.controlForward) settings.controlForward.on('click', function () {
                                test('+')
                            });
                            if (settings.controlDot) settings.controlDot.on('click', function () {
                                test($(this).index())
                            });
                            if (settings.auto)autoTimer();
                            test(start);
                        };
                    controlActionOn();
                    resize();
                }
            };
        return $(this).each(function () {
            jL.callMethodPlugin.call(this, methods, method, options, settings)
        });
    });

}(jL, jQuery));


