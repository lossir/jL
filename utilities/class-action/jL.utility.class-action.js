/**
 * Утилита универсализированных, готовых обработчиков, привязываемых к классам элемента
 *
 * Date     16.03.2015
 * Time     12:00
 *
 * @author  Lossir  lossir@mail.ru
 * @version 1.0
 *
 * @augments jL
 * @requires jL,jQuery
 */

(function($, jL, undefined){
    "use strict";

    jL.setUtilities('classAction1', function () {

        var classPrefix = 'ca-',
            getSelector = function(classes, sep){
                return '.'+classPrefix+classes.split(sep||' ').join(',.'+classPrefix);
            },
            getSwitchData = function(item){
                var classes = item.prop('class'),
                    reg = (new RegExp('.*'+(classPrefix.replace('-','\\-')+'switch\\-data\\-')+'(\\w*)\\s.*')),
                    data = classes.replace(reg, '$1');
                return data === classes ? null : data;
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
                            datePickerTemplate = '<div class="'+classPrefix+'date-picker-control"><div class="'+classPrefix+'date-picker-month-prev">&lt;</div><div class="'+classPrefix+'date-picker-month"></div><div class="'+classPrefix+'date-picker-month-next">&gt;</div></div><div class="'+classPrefix+'date-picker-table"><table class="w-100"><thead><tr>{head}</tr></thead><tbody>{days}</tbody></table></div>',
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
                     * Необходимо вывести тег селект по всем правилам и заранее сверстать стилизованный шаблон для него
                     * затем к соответствующим элементам макета добавить класса "метки"
                     *
                     * prefix + "select-css-select"         Главный контейнер макета
                     * prefix + "select-css-group"          Элемент для отображение optgroup
                     * prefix + "select-css-options"        Контейнер для тегов option
                     * prefix + "select-css-option"         Элемент для отображение option
                     * prefix + "select-css-group-options"  Контейнер для тегов option внутри элемента optgroup
                     * prefix + "select-css-select-label"   Элемент для вывода текста выбранного элемента
                     * prefix + "select-css-group-label"    Элемент для вывода названия optgroup
                     *
                     */
                    'action': function () {
                        var $this = $(this),
                            selects = $this.find('select'),
                            selectCSS = $this.find(getSelector('select-css-select'));
                        selects.each(function(index){
                            var select = $(this),
                                multiple = select.prop('multiple'),
                                size = select.prop('size'),
                                groups = select.find('optgroup'),
                                mainOptions = select.find('>*'),
                                selectLabel = mainOptions.filter('[selected]').text() || '',
                                options = select.find('option'),
                                getCSS = function(_class, _parent){
                                    _parent = _parent || $this;
                                    return _parent.find(getSelector(_class)).eq(0).clone().empty();
                                },
                                groupCSS = getCSS('select-css-group'),
                                optionsCSS = getCSS('select-css-options'),
                                optionCSS = getCSS('select-css-option'),
                                optionTargetCSS = getCSS('select-css-option-target'),
                                groupOptionsCSS = getCSS('select-css-group-options'),
                                selectLabelCSS = getCSS('select-css-select-label'),
                                groupLabelCSS = getCSS('select-css-group-label'),
                                groupLabelTargetCSS = getCSS('select-css-group-label-target');


                            var optionChange = function(option){
                                    select
                                        .prop('selectedIndex',option.index)
                                        .trigger('change');
                                    selectLabelCSS.text(option.label||option.innerText);
                                },
                                getMainOptions = function(){
                                    var contain = optionsCSS.clone();
                                    mainOptions.each(function(){
                                        var option = this;
                                        if(this.tagName==='OPTION') {
                                            var optionTarget = optionCSS.clone();
                                            optionTarget.append(optionTargetCSS.clone().text(option.innerText||option.innerHTML).addClass(option.hasAttribute('disabled')?'c-gray65':'').on('click', function () {
                                                if(!option.hasAttribute('disabled')){
                                                    optionChange(option);
                                                }
                                            }));
                                            contain.append(optionTarget);
                                        }
                                        else if(this.tagName==='OPTGROUP'){
                                            contain.append(getGroup(option));
                                        }
                                    });
                                    return contain;
                                },
                                getGroup = function(group){
                                    var contain = groupCSS.clone();
                                    contain
                                        .append(groupLabelCSS.clone().append(groupLabelTargetCSS.clone().text(group.label)))
                                        .append(getGroupOptions($(group).find('>option')));
                                    return contain;
                                },
                                getGroupOptions = function(options){
                                    var contain = groupOptionsCSS.clone();
//                                console.log(options);
                                    options.each(function(){
                                        var option = this;
                                        if(this.tagName==='OPTION'){
                                            var optionTarget = optionCSS.clone()
                                                .append(optionTargetCSS.clone().text(option.innerText||option.innerHTML).on('click',
                                                    function () {
                                                        optionChange(option);
                                                    }));
                                            contain.append(optionTarget);
                                        }
                                        else if(option.tagName==='OPTGROUP'){
                                            contain.append(getGroup(option));
                                        }
                                    });
                                    return contain;
                                };

                            select.before(
                                selectCSS.clone().empty().append(
                                        selectLabelCSS.text(selectLabel)
                                    )
                                    .append(getMainOptions())
                            );

                            if(index === selects.length-1){
//                                selectCSS.hide();
                                selectCSS.remove();
                            }
                            select.hide();

//                        console.log(groups);
                            $this.on('click', function () {

                            });
                        });
                    }
                },
                {
                    'className' : 'switch',
                    /**
                     *
                     */
                    'action': function () {
                        var $this = $(this),
                            switchClass = 'selected',
                            items = $this.find(getSelector('switch-acting switch-exposed'));
                        $this.on('click', getSelector('switch-acting'), function(index){
                            var elem = $(this),
                                tags = getSwitchTag(elem, $this),
                                acting = tags.filter(getSelector('switch-acting')),
                                exposed = tags.filter(getSelector('switch-exposed')),
                                data = getSwitchData(elem);
                            switch (data){
                                case'now':
                                    if(exposed.hasClass(switchClass)) {
                                        exposed.show();
                                    }
                                    else {
                                        exposed.hide();
                                    }
                                    break;
                                case'fade':
                                    exposed.fadeToggle();
                                    break;
                                case'slide':
                                    exposed.slideToggle();
                                    break;
                            }
                            if(elem.hasClass(classPrefix+'switch-reverse') && tags.hasClass('selected')){
                                tags.removeClass(switchClass);
                            } else {
                                items.filter(getSelector('switch-exposed')).removeClass(switchClass);
                                tags.addClass(switchClass);
                            }
                            $this.trigger('ca-switch', tags );
                        });
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
