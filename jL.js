/**
 * jLScript - набор полезных утилит. Использует для работы jQuery
 *
 * Date     02.05.14
 * Time     15:59
 *
 * @author  Lossir  lossir@mail.ru
 * @version 5.0
 *
 * @requires jQuery
 */

;
(function ($) {

    var expansionDefineProperty = function(object, name, value){
            if(!object[name]){
                if(Object.defineProperty && ('\v'!='v')){
                        Object.defineProperty(object, name,{
                            configurable: true,
                            enumerable: false,
                            writable: true,
                            value: value
                        });
                } else {
                    object[name] = value;
                }
            }
        };
    expansionDefineProperty(Array.prototype, 'diff', function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    });

    var jLScript,
        utilities = function () {
        },

        /**
         * Общедостуное хранилище данных для плагинов и внутренних методов
         * При добавлении нового плагина jQuery через jLScript, в хранилище создаётся объект с ключом имени плагина <без_префикса>
         *
         * @type {Object}
         * @private
         *
         * @see jLScript.setPlugin
         */
            _variables = {
        };

    /**
     * Класс содержит утилиты доступные через jLScript
     *
     * @constructs
     * @type {Object}
     * @private
     */
    utilities.prototype = {

        /**
         * Получить массив состоящий только из одного свойства объектов
         *
         * @param {Array} arr
         * @param {String} prop
         * @param {Function} func function(key, value, object)
         *
         * @returns {Array}
         */
        'onePropObject':         function (arr, prop, func) {
            var newArr = []
                , index;
            func = func || null;
            for (index in arr) if (arr.hasOwnProperty(index)) {
                if(func){
                    newArr.push(func(+index, arr[index][prop], arr[index]));
                }
                else {
                    newArr.push(arr[index][prop]);
                }
            }
            return newArr;
        },

        /**
         * Суммировать числа
         * принимает любого уровня вложенности массивы чисел
         *
         * @returns {Number}
         */
        'sum':            function () {
            return +eval(JSON.stringify(Array.prototype.slice.call(arguments, 0)).replace(/\[|\"|\]/g, '').replace(/,/g, '+'));
        },

        /**
         * Получить последний эллемент массива
         *
         * @param {Array} array
         *
         * @returns {*}
         */
        'end':            function (array) {
            return array[array.length - 1];
        },

        /**
         * Получить колличество элементов в объекте
         *
         * @param {Object}  obj
         * @param {Boolean} [calcPrototype=false] Считать элементы прототипа объекта
         *
         * @returns {Number}
         */
        'length':         function (obj, calcPrototype) {
            var length = 0, k;
            for (k in obj) if(obj.hasOwnProperty(k) || (calcPrototype || false)) length++;
            return length;
        },

        /**
         * Аналог стандартного метода forEach EcmaScript5
         * если callback функция вернёт строку 'forEachStop' - перебор останавливается
         *
         * @param {Function} func
         *
         * @returns {Array|Object} Зависит от типа контекста
         */
        'forEach':        function (func) {
            func = func || false;
            var key
                , result
                , mas = ($.type(this) == 'array')
                    ? []
                    : {};
            for (key in this) if (this.hasOwnProperty(key))  {
                if (func) {
                    result = func(this[key], +key, this);
                    if (result !== 'forEachStop') mas[key] = result;
                    else break;
                }
                else {
                    mas[key] = this[key];
                }
            }
            return mas;
        },

        /**
         * Разбивает массив на более короткие массивы, с заданной максимальной длиной новых массивов
         *
         * @param {Array} input
         * @param {Number} size
         *
         * @returns {Array}
         */
        'arrayChunk':     function (input, size) {
            for (var x, i = 0, c = -1, l = input.length, n = []; i < l; i++) {
                (x = i % size)
                    ? n[c][x] = input[i]
                    : n[++c] = [input[i]];
            }
            return n;
        },

        /**
         * Заменяет все вхождения строки поиска на строку замены (аналог str_replace в php)
         *
         * @param {String} str      Место поиска
         * @param {Array|String} search    Массив строк поиска
         * @param {Array|String} replace   Массив строк замены
         *
         * @returns {String}
         */
        'strReplace': function (str, search, replace) {
            var index;
            search = jL._dataToArr(search);
            replace = jL._dataToArr(replace);
            return str.replace(new RegExp('(' + search.join('|') + ')', 'g'), function () {
                index = search.indexOf(+arguments[1]);
                return replace[!!~index
                    ? index
                    : search.indexOf('' + arguments[1])] || arguments[1];
            })
        },

        /**
         * если первый элемент arguments является функцией, то вызывает её со всеми остальными элементами arguments
         *
         * @param {Function} func
         *
         * @return {Boolean}
         */
        'testFunc': function (func) {
            var _this = this || window
                ,arg = arguments;
            return (func !== false && typeof(func) == 'function')
                ? (function () {
                console.log(arg);
                    func.apply(_this, Array.prototype.slice.call(arg, 1));
                    return true;
                }())
                : false
        },

        /**
         * Для использования при создании плагина
         * Проверка метода плагина перед вызовом
         *
         * @augments jQuery
         *
         * @param {Object} methods  Все методы плагина
         * @param {String} method   Имя вызываемого метода
         * @param {Object} options  Заданные настройки плагины
         * @param {Object} settings Дефолтные настройки плагина
         *
         * @return {*}
         */
        'callMethodPlugin':    function (methods, method, options, settings) {
            if (methods[method]) {
                $.extend(settings, options);
                return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 4));
            }
            else
                if (typeof method === 'object' || !method) {
                    $.extend(settings, method);
                    return methods.init.apply(this, Array.prototype.slice.call(arguments, 4));
                }
                else {
                    $.error('Метод ' + method + ' в плагине не найден');
                    return false;
                }
        },

        /**
         * randomize
         *
         * @param {Number} [min=0]
         * @param {Number} [max=9]
         *
         * @return {Number}
         */
        'random':         function (min, max) {
            min = min || 0;
            max = max || 9;
            return Math.random() * (max - min + 1) + min ^ 0;
        },

        /**
         * Если переменная не массив, переводит в массив по заданному разделителю (по умолчанию <запятая>)
         *
         * @param data      переменная
         * @param [sep=","] разделитель
         *
         * @return {Array}
         */
        '_dataToArr':     function (data, sep) {
            sep = sep || ',';
            var i = 0, ret = (( $.type(data) == 'array' )
                ? data
                : (( $.type(data) == 'string' )
                    ? (( data.search(sep) > 0 )
                        ? data.split(sep)
                        : [data]
                        )
                    : []
                    )
                );
            for (; i < ret.length; i++)if ($.type(ret[i]) == 'number')ret[i] = +ret[i];
            return ret;
        },

        /**
         * Вызвать обработчик с задержкой
         *
         * @param {Function}            handler          обработчик
         * @param {String}              event            событие или события(через пробел) с пространством имён (первый аргумент метода on)
         * @param {jQuery|HtmlElement}  [element=window] элемент html
         * @param {Number}              [delay=50]       задержка в ms
         */
        'laggedHandler': function (handler, event, element, delay) {
            delay = delay || 50;
            element = element || window;
            var nameTimer = "laggedHandlerTimer" + this.generator();
            $(element).off(event).on(event, function (e) {
                if (element.hasOwnProperty(nameTimer)) clearTimeout(element[nameTimer]);
                element[nameTimer] = setTimeout(function () {
                    handler.call(element, e)
                }, delay);
            });
        },

        /**
         * Получить массив из адресной строки
         *
         * @param {String} [separator="/"]    разделитель
         *
         * @return {Array}
         */
        'path':           function (separator) {
            return location.pathname.replace(/\//, '').split(separator || '/');
        },

        /**
         * Преобразует строку window.location.search в объект
         *
         * @return {Object}
         */
        'searchToObject': function () {
            var d = {};
            window.decodeURIComponent(window.location.search)
                .replace(/(?:^\?|.*?)(.*?)=(.*?)(&|$)/g, function (p0, p1, p2) {
                    d[p1] = p2;
                });
            return d;
        },

        /**
         * Генератор строки
         * принимает регулярное выражение, и генерирует строку соответствующую этому выражению
         *
         * @param {Number}  [length=15]                 длина строки
         * @param {RegExp}  [mask=/\w/\g]              регулярное выражение
         * @param {Boolean} [useSpecialSymbol=false]    использовать спец символы
         *
         * @returns {String}
         */
        'generator': function (length, mask, useSpecialSymbol) {
            mask = mask || /[\w]/g;
            length = length || 15;
            useSpecialSymbol = useSpecialSymbol || false;
            var sample = []
                , genStr = ""
                , normal = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
                , special = "!@#$%^&*()+=-№;:?\|/~`"
                , i = 0;
            normal.replace(mask, function () {
                sample.push(arguments[0]);
            });
            sample = sample.concat(useSpecialSymbol
                ? special.split("")
                : []);
            for (; i < length; i++) {
                genStr += sample[this.random(0, sample.length - 1)];
            }
            return genStr;
        },

        /**
         * Наследование прототипов
         *
         * @param Child
         * @param Parent
         */
        'extend':         function (Child, Parent) {
            var F = function () {
            };
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.superclass = Parent.prototype;
        },

        /**
         * Динамическое добавление файла js||css
         *
         * @param src
         * @param callback
         * @return {Array}
         */
        // TODO: устарело, надо переписать...
        'fileToConnect':  function (src, callback) {
            var u = this, file, first, i = 0, response = [], type, afterLoad = function () {
                if ($.type(callback) == 'function') {
                    callback()
                }
            }, data = {
                'js':  {
                    'tag':  'script',
                    'src':  'src',
                    'attr': {
                        'type': 'text/javascript'
                    }
                },
                'css': {
                    'tag':  'link',
                    'src':  'href',
                    'attr': {
                        'type': 'text/css',
                        'rel':  'stylesheet'
                    }
                }
            };
            src = u._dataToArr(src);
            for (; i < src.length; i++) {
                type = src[i].replace(/.*\.(js|css)$/, '$1');
                if ($('[' + data[type].src + '="' + src[i] + '"]').eq(0).length == 0) {
                    file = document.createElement(data[type].tag);
                    for (var j in data[type].attr) {
                        file['' + j] = data[type].attr['' + j];
                    }
                    file[ data[type].src ] = src[i];
                    first = document.getElementsByTagName("head")[0].firstChild;
                    if (document.getElementsByTagName("head")[0].insertBefore(file, first)) {
                        response.push(true);
                    }
                    else response.push(false);

                    file.onload = function () {
                        if (!this.executed) {
                            this.executed = true;
                            afterLoad();
                        }
                    };
                    file.onreadystatechange = function () {
                        if (this.readyState == "complete" || this.readyState == "loaded") {
                            setTimeout(function () {
                                afterLoad();
                            }, 1);  // (1)
                            this.onreadystatechange = null;
                        }
                    }
                }
                else {
                    response.push(false);
                    afterLoad();
                }
            }
            return response;
        }
    };

    /**
     * Объект jLScript
     *
     * @classes
     * @param prefix
     */
    jLScript = function (prefix) {

        /**
         * Префикс для плагинов добавляемых в jQuery через jLScript
         * @type {String}
         */
        this.prefixForPlugin = prefix || 'jL';

        /**
         * Префикс для селекторов добавляемых в jQuery через jLScript
         * @type {String}
         */
        this.prefixForSelector = prefix || 'jL';

        /**
         * Добавляет новый плагин для jQuery
         *
         * @param {String|Object}   nameOrPlugins
         * @param {Function}        plugin
         *
         * @return {Boolean}
         */
        this.setPlugin = function (nameOrPlugins, plugin) {
            if (typeof nameOrPlugins === "object") {
                for (var key in nameOrPlugins) if(nameOrPlugins.hasOwnProperty(key)) {
                    if (!$.fn[this.prefixForPlugin + key]) {
                        _variables[key] = {};
                        $.fn[this.prefixForPlugin + key] = nameOrPlugins[key];
                    }
                }
                return true;
            }
            else
                if (typeof nameOrPlugins === "string") {
                    _variables[nameOrPlugins] = {};
                    $.fn[this.prefixForPlugin + nameOrPlugins] = plugin;

                    return true;
                }
                else {
                    return false;
                }
        };

        /**
         * Добавляет новый селектор для jQuery
         *
         * @param {String|Object}   nameOrSelectors
         * @param {Function}        selector
         *
         * @return {Boolean}
         */
        this.setSelector = function (nameOrSelectors, selector) {
            if (typeof nameOrSelectors === "object") {
                for (var key in nameOrSelectors) if(nameOrSelectors.hasOwnProperty(key)) {
                    if (!$.expr[':'][this.prefixForSelector + key]) {
                        $.expr[':'][this.prefixForSelector + key] = nameOrSelectors[key];
                    }
                }
                return true;
            }
            else
                if (typeof nameOrSelectors === "string") {
                    _variables[nameOrSelectors] = {};
                    $.expr[':'][this.prefixForSelector + nameOrSelectors] = selector;

                    return true;
                }
                else {
                    return false;
                }
        };

        /**
         * Добавляет утилиту для jLScript
         *
         * @param {String}      name
         * @param {Function}    _utilities
         * @param {Boolean}     [init=false] Вызвать инициализирующий метод init
         *
         * @returns {Boolean}
         */
        this.setUtilities = function (name, _utilities, init) {
            init = init || false;
            this.prototype[name] = _utilities;
            if (typeof this.prototype[name] === "function") {
                if (init) this.prototype[name].call();

                return true;
            }
            else {
                return false;
            }
        };

        /**
         * Ссылка на prototype класса jLScript для его возможного расширения через любой экземляр класса jLScript
         *
         * @type {Object}
         */
        this.prototype = jLScript.prototype;

        /**
         * Ссылка на внутреннюю переменную _variables
         *
         * @type {Object}
         */
        this.variables = _variables;
    };

    utilities.prototype.extend(jLScript, utilities);

    window.jL = window.jLScript = new jLScript();

}(jQuery));