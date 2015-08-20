/**
 * Утилита универсализированных, готовых обработчиков, привязываемых к классам элемента
 *
 * Date     16.03.2015
 * Time     12:00
 *
 * @author  Lossir  lossir@mail.ru
 * @version 1.2
 *
 * @augments jL
 * @requires jL,jQuery
 */

(function($, jL, undefined){
    "use strict";

    jL.setUtilities('classAction', function () {

        var classPrefix = 'ca-',
            getSelector = function(classes, sep){
                return '.'+classPrefix+classes.split(sep||' ').join(',.'+classPrefix);
            },
            getSwitchData = function(item, classAction){
                var classes = item.prop('class'),
                    reg = (new RegExp((classPrefix.replace('-','\\-')+classAction+'\\-data\\-')+'(\\w*)', "gm")),
//                    data = classes.replace(reg, '$1');
                    data = {};
                item.prop('class').replace(reg, function(){
                    var dataItem = arguments[1].split('_');
//                    console.log(dataItem);
                    data[dataItem[0]] = dataItem[1] || true;
                });
                return data;
            },
            getSwitchTag = function(item, context) {
                var classes = item.prop('class'),
                    reg = (new RegExp('.*(' + (classPrefix.replace('-', '\\-') + 'switch\\-tag\\-') + '\\w*)\\s.*')),
                    tag = classes.replace(reg, '$1');
                return tag === classes ?
                       item
                    : (classes.indexOf(classPrefix+'switch-action-too') < 0 ?
                       context.find(getSelector(tag.replace(classPrefix, ''))).not(item).not(getSelector('switch-acting'))
                        : context.find(getSelector(tag.replace(classPrefix, ''))).not($(getSelector('switch-acting')).not(item)) );
            },
            actions = [
                {
                    'className' : 'date-picker',
                    /**
                     * Всплывающий календарь для выбора даты
                     */
                    'action': function () {
                        var date = new Date();
                        jL.calendar(date).getMonthName();
                        var datePickerInput = $(this),
                            datePickerVariable = {},
                            datePickerTemplate = '<div class="'+classPrefix+'date-picker-control"><div class="'+classPrefix+'date-picker-month-prev">&lt;</div><div class="'+classPrefix+'date-picker-month"></div><div class="'+classPrefix+'date-picker-year"></div><div class="'+classPrefix+'date-picker-month-next">&gt;</div></div><div class="'+classPrefix+'date-picker-table"><table class="w-100"><thead><tr>{head}</tr></thead><tbody>{days}</tbody></table></div>',
//                            datePickerContain = $this.find(getSelector('date-picker-contain')).empty().hide().appendTo('body'),
                            datePickerContainTemplate = '<div class="'+classPrefix+'date-picker-contain">{calendar}</div>',
                            datePickerContain,
                            datePickerDayNameTemplate = '<td><div class="'+classPrefix+'date-picker-head">{dayName}</div></td>',
                            datePickerDayTemplate = '<td><div class="'+classPrefix+'date-picker-day">{day}</div></td>',
                            datePickerDayTodayTemplate = '<td><div class="'+classPrefix+'date-picker-day today">{day}</div></td>',
                            datePickerWeekTemplate = '<tr>{week}</tr>',
                            datePickerDayOffTemplate = '<td><div class="'+classPrefix+'date-picker-day-off">{day}</div></td>',
                            dataPickerBuild = function(input){
                                var calendar = function () {
//                                    if(datePickerContain.length){
                                        $(getSelector('date-picker-contain')).remove();
//                                    }
                                    var weeksTemplate = '',
                                        head = '';
                                    jL.calendar(date).getDayNames().shortName.forEach(function (dayName) {
                                        head += jL.strReplace(datePickerDayNameTemplate, ['{dayName}'], [dayName]);
                                    });
                                    jL.calendar(date).getMonthsInArray().forEach(function (week) {
                                        var weekTemplate = '';
                                        week.forEach(function (day) {
                                            var number = day.getDate();
                                            if (jL.calendar(day).isMonthCurrent(date.getMonth())) {
                                                if (jL.calendar(day).isDateCurrent()) {
                                                    weekTemplate += jL.strReplace(datePickerDayTodayTemplate, ['{day}'], [number]);
                                                }
                                                else {
                                                    weekTemplate += jL.strReplace(datePickerDayTemplate, ['{day}'], [number]);
                                                }
                                                datePickerVariable[number] = day;
                                            }
                                            else {
                                                weekTemplate += jL.strReplace(datePickerDayOffTemplate, ['{day}'], [number]);
                                            }
                                        });
                                        weeksTemplate += jL.strReplace(datePickerWeekTemplate, ['{week}'], [weekTemplate]);
                                    });
                                    datePickerContain = $(jL.strReplace(datePickerContainTemplate,
                                        ['{calendar}'],
                                        [jL.strReplace(datePickerTemplate, ['{head}', '{days}'], [head, weeksTemplate])]))
                                        .appendTo('body');
                                    datePickerContain
//                                        .html(jL.strReplace(datePickerTemplate, ['{head}', '{days}'], [head, weeksTemplate]))
                                        .find(getSelector('date-picker-month'))
                                            .html(jL.calendar(date).getMonthName());
                                    datePickerContain
                                        .find(getSelector('date-picker-year'))
                                            .html(date.getFullYear());
                                };
                                calendar();
                                datePickerContain
                                    .off('click.date-picker')
                                    .on('click.date-picker', getSelector('date-picker-day'), function () {
                                        var dateDay = datePickerVariable[this.innerText];
                                        input.val(dateDay.getDate() + '.' + (dateDay.getMonth()+1) + '.' + dateDay.getFullYear());
                                        datePickerContain.fadeOut(300);
                                    })
                                    .on('click.date-picker', getSelector('date-picker-month-prev'), function () {
                                        date = jL.calendar(date).setMonthPrev();
                                        calendar();
                                        input
                                            .trigger('focus')
                                            .trigger('click');
                                    })
                                    .on('click.date-picker', getSelector('date-picker-month-next'), function () {
                                        date = jL.calendar(date).setMonthNext();
                                        calendar();
                                        input
                                            .trigger('focus')
                                            .trigger('click');
                                    });
                                input.data('date-picker', datePickerContain);
                            };
                        if(datePickerInput.length){
                            datePickerInput.each(function(){
                                var $input = $(this),
                                    timer;
                                $input.on({
                                    'click': function () {
                                        dataPickerBuild($input);
                                        clearTimeout(timer);
                                        datePickerContain.css({
                                            top : $input.offset().top + $input.outerHeight(),
                                            left : $input.offset().left
                                        }).fadeIn(300);
                                    },
                                    'blur': function () {
                                        timer = setTimeout(function(){
                                            clearTimeout(timer);
                                            datePickerContain.fadeOut(300);
                                        }, 3000);
                                    }
                                });
                            });
                        }
                    }
                },
                {
                    'className' : 'string-locale',
                    /**
                     */
                    'action': function () {
                        var $this = $(this),
                            $text = $this.text(),
                            locale = $text.replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1");
                        $this.text(locale);
                    }
                },
                {
                    'className' : 'placeholder',
                    /**
                     */
                    'action': function () {
                        var elems = $(this);
                        jL.IEBind.add('8,9', function(){
                            elems.each(function () {
                                var $this = $(this),
                                    placeholder = $this.attr('placeholder'),
                                    tag = $this.prop('tagName'),
                                    color = $this.prop('color'),
                                    method = (tag === 'INPUT') ? 'val'
                                        : 'text',
                                    placeholderShow = function () {
                                        if($this[method]() === placeholder){
                                            $this.css('color', color);
                                            $this[method]('');
                                        }
                                    },
                                    placeholderHide = function () {
                                        var value = $this[method]();
                                        $this[method](value === placeholder || value === '' ? function () {
                                            $this.css('color', '#aaaaaa');
                                            return placeholder;
                                        }()
                                            : value);
                                    };
                                $this.on( "focus", placeholderShow);
                                $this.on( "blur", placeholderHide);
                                placeholderHide();
//                $this[method](placeholder);
                            });
                        });
                    }
                },
                {
                    'className' : 'form-ajax',
                    /**
                     * Переделывает обычные формы в ajax-формы
                     * полученные данные передаёт на событие 'form-ajax', которое должно быть навешано на форму
                     */
                    'action': function () {

                        if (window.FormData) {
//                            event.preventDefault();

                            var $this = $(this),
                                action = $this.prop('action'),
                                method = $this.prop('method');
                            $this
                                .find('[type=submit]')
//                            .prop('type','button')
                                .on('click', function (e) {
                                    e.preventDefault();
                                    $[method](action, $this.serialize(), function () {

                                        $this.trigger('ca-form-ajax', arguments);
                                    });
                                });

//                            console.log('FormData define');
                        }

                    }
                },
                {
                    'className' : 'select-css',
                    /**
                     * <pre>
                     * Создание стилизованного тега select
                     */
                    'action': function () {

                        var select = this,
                            $select = $(select),
                            contain = document.createElement('div'),
                            optionSelecting = function () {
                                var li = $(contain.querySelectorAll('li[data-index]'))
                                    .removeClass("selected");
                                if(select.multiple) {
                                    Array.prototype.forEach.call(select.selectedOptions, function (item) {
                                        li[item.indexOf].className += " selected";
                                    });
                                }
                                else {
                                    li[select.selectedIndex].className += " selected";
                                }
                            },
                            insertSelectLabel = function () {
                                contain.children[0].innerHTML = select[select.selectedIndex].label || select[select.selectedIndex].innerText;
                            },
                            build = function () {
                                var optionHTML = '',
                                    index = -1,
                                    getLiHTML = function (item) {
                                        item.indexOf = index;
                                        return '<li class="option'+(item.disabled?' disabled':'')+''+(item.selected?' selected':'')+'" data-value="'+item.value+'" data-index="'+index+'"><span class="label">'+(item.label||item.innerText)+'</span></li>';
                                    };
                                Array.prototype.forEach.call(select.children, function (item) {
                                    if(item.tagName === "OPTION") {
                                        index++;
                                        optionHTML += getLiHTML(item);
                                    }
                                    else {
                                        var groupHTML = '';
                                        Array.prototype.forEach.call(item.children, function (item) {
                                            ++index;
                                            groupHTML += getLiHTML(item);
                                        });
                                        optionHTML += '<li class="option-group"><span class="label">'+item.label+'</span><ul class="group">'+groupHTML+'</ul></li>';
                                    }
                                });
                                contain.innerHTML = '<div class="label"></div><ul class="select">'+optionHTML+'</ul>';
                                if(!contain.parentElement) {
                                    contain.className = "select-css";
                                    select.parentElement.appendChild(contain);
                                }
                            },
                            building = function () {
                                build();
                                insertSelectLabel();
                                optionSelecting();
                            };

                        building();

                        $(select.parentElement).on('click', 'li[data-index]:not(.disabled)', function (e) {
                            var index = +(this.dataset ? this.dataset.index : this.getAttribute('data-index'));
                            if (select.multiple && e.ctrlKey) {
                                select[index].selected = !select[index].selected;
                            }
                            else
                                if (select.multiple && e.shiftKey) {
                                    for(var j = 1, i, selectedIndex = select.selectedIndex; j<=Math.abs(Math.max(selectedIndex - index)); j++) {
                                        i = (selectedIndex > index) ? selectedIndex-j : selectedIndex+j;
                                        if(!select[i].disabled) {
                                            select[i].selected = true;
                                        }
                                    }
                                }
                                else {
                                    select.selectedIndex = index;
                                }
                            $select.trigger('change');
                        });

                        $select.on({
                            'rebuild': building,
                            'change.select-css': function () {
                                insertSelectLabel();
                                optionSelecting();
                                console.log('change');
                            }
                        });
                        select.addEventListener("DOMNodeInserted", building, false);
                        select.addEventListener("DOMNodeRemoved", building, false);
                    }
                },
                {
                    'className' : 'switch,switch-block',
                    /**
                     * Переключение класса "selected" между набором элементов
                     */
                    'action': function () {
                        var $this = $(this),
                            switchClass = 'selected',
                            items = this.children,
                            $items = $(items);
                        // элементы могут переключать класс "selected" внутри своего набора
                        if($this.hasClass('ca-switch')) {
                            $this.on('click', '>*', function (index) {
                                $items.removeClass(switchClass);
                                this.className += " "+switchClass;
                            });
                        }
                        // или в другом наборе элементов
                        else if($this.hasClass('ca-switch-block')) {
                            var actingBlock = this.getElementsByClassName('ca-switch-acting')[0],
                                $actingBlock = $(actingBlock),
                            // элементы, которые воздействуют
                                $acting = $actingBlock.length ? $actingBlock.find('>*') : $items,
                            // элементы, на которые воздействуют
                                $exposed = $this.find('.ca-switch-exposed>*');
                            ($actingBlock.length ? $actingBlock : $items).on('click', '>*', function () {
                                $acting.removeClass(switchClass);
                                $exposed.removeClass(switchClass);
                                this.className += " "+switchClass;
                                var index = Array.prototype.indexOf.call(actingBlock.children,this);
                                $exposed[index].className += " "+switchClass;
                            });
                        }
                    }
                },
                {
                    'className' : 'popup-image',
                    'action': function () {

                    }
                }
            ];

        $(function(){
            actions.forEach(function(item){
                $(getSelector(item.className,',')).each(item.action);
            });
        });

    }());
}(jQuery, jL));
