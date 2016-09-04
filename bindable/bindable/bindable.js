"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventService = (function () {
    /**
     * This is an event dispather that will trigger all event handlers that subscribed the events.
     * @param Directives it is the list of event names {method: 'command'}, then you can use Directives.method to avoid typos;
     */
    function EventService(Directives) {
        this.Directives = Directives;
    }
    EventService.prototype.subscribe = function (event, disposable, handler) {
        if (!this.subscribers)
            this.subscribers = {};
        if (!this.subscribers[event])
            this.subscribers[event] = [];
        this.subscribers[event].push(new EventSubscriber(disposable, handler));
    };
    EventService.prototype.unsubscribe = function (event, disposable) {
        if (!this.subscribers)
            return;
        if (this.subscribers[event]) {
            this.subscribers[event] = this.subscribers[event].filter(function (subscriber) { return subscriber.disposable !== disposable; });
        }
    };
    EventService.prototype.unsubscribeAll = function (disposable) {
        if (!this.subscribers)
            return;
        for (var event_1 in this.subscribers) {
            this.subscribers[event_1] = this.subscribers[event_1].filter(function (subscriber) { return subscriber.disposable !== disposable; });
        }
    };
    EventService.prototype.emit = function (event, source, ignoreSource) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        if (!this.subscribers)
            return;
        if (this.subscribers[event]) {
            var validSubscribers_1 = [];
            var count_1 = 0;
            this.subscribers[event].forEach(function (subscriber) {
                if (ignoreSource && subscriber.disposable === source)
                    return; //when source should be ignored, do send event back to the source;
                if (!subscriber.disposable.disposed) {
                    validSubscribers_1.push(subscriber);
                    subscriber.handler.apply(subscriber.disposable, args);
                    count_1 += 1;
                }
            });
            this.subscribers[event] = validSubscribers_1;
            return count_1;
        }
    };
    return EventService;
}());
exports.EventService = EventService;
var EventSubscriber = (function () {
    function EventSubscriber(disposable, handler) {
        this.disposable = disposable;
        this.handler = handler;
    }
    return EventSubscriber;
}());
//console.log('SystemJS', '__filename', __filename, __dirname);
var EventStatus;
(function (EventStatus) {
    EventStatus[EventStatus["none"] = 0] = "none";
    EventStatus[EventStatus["before"] = 1] = "before";
    EventStatus[EventStatus["bindBeforeWithCheck"] = 2] = "bindBeforeWithCheck";
    EventStatus[EventStatus["after"] = 3] = "after";
    EventStatus[EventStatus["decorator"] = 4] = "decorator";
})(EventStatus || (EventStatus = {}));
var util = (function () {
    function util() {
    }
    util.checkValidNumber = function (value, defaultValue) {
        if (typeof value == 'string' && /^(\d+(\.\d*|)|\.\d+)$/.test(value))
            return Number(value);
        if (typeof value != 'number' || Number.isNaN(value))
            return defaultValue;
        return value;
    };
    util.appendArrayDictionary = function (host, appendant) {
        for (var key in appendant) {
            if (!host[key])
                host[key] = [];
            util.appendArray(host[key], appendant[key]);
        }
        return host;
    };
    util.appendDictionary = function (host, appendant) {
        if (!appendant)
            return host;
        for (var key in appendant) {
            host[key] = appendant[key];
        }
        return host;
    };
    util.forOf = function (obj, callback) {
        if (!obj || !callback)
            return;
        for (var key in obj) {
            callback(key, obj[key]);
        }
    };
    util.reduceOf = function (obj, reducer, initial) {
        if (!obj || !reducer)
            return initial;
        var result = initial;
        for (var key in obj) {
            result = reducer(result, key, obj[key]);
        }
        return result;
    };
    util.appendArray = function (arr, items) {
        if (!items)
            return arr;
        Array.prototype.push.apply(arr, items);
        return arr;
    };
    return util;
}());
exports.util = util;
var invokeStatus;
(function (invokeStatus) {
    invokeStatus[invokeStatus["none"] = 0] = "none";
    invokeStatus[invokeStatus["invokeBefore"] = 1] = "invokeBefore";
    invokeStatus[invokeStatus["invokeAfter"] = 2] = "invokeAfter";
    invokeStatus[invokeStatus["invokeBeforeWithCheck"] = 3] = "invokeBeforeWithCheck";
    invokeStatus[invokeStatus["bindBefore"] = 4] = "bindBefore";
    invokeStatus[invokeStatus["bindBeforeWithCheckValidate"] = 5] = "bindBeforeWithCheckValidate";
    invokeStatus[invokeStatus["bindAfter"] = 6] = "bindAfter";
    invokeStatus[invokeStatus["updateOneWayToBefore"] = 7] = "updateOneWayToBefore";
    invokeStatus[invokeStatus["updateOneWayToAfter"] = 8] = "updateOneWayToAfter";
    invokeStatus[invokeStatus["updateOneWayToBeforeWithCheckValidate"] = 9] = "updateOneWayToBeforeWithCheckValidate";
    invokeStatus[invokeStatus["check"] = 10] = "check";
    invokeStatus[invokeStatus["validate"] = 11] = "validate";
    invokeStatus[invokeStatus["decorator"] = 12] = "decorator";
})(invokeStatus || (invokeStatus = {}));
var Trigger = (function () {
    function Trigger(decorator, shouldCheck) {
        this.decorator = decorator;
        this.shouldCheck = shouldCheck;
    }
    Object.defineProperty(Trigger.prototype, "target", {
        get: function () {
            if (!this.decorator)
                return;
            return this.decorator.target;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trigger.prototype, "key", {
        get: function () {
            if (!this.decorator)
                return;
            return this.decorator.propertyKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trigger.prototype, "method", {
        get: function () {
            if (!this.decorator)
                return;
            return this.decorator.handler;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trigger.prototype, "check", {
        get: function () {
            if (!this.decorator)
                return;
            if (this.shouldCheck) {
                switch (this.decorator.type) {
                    case 'property':
                    case 'event':
                        return this;
                    default:
                        return this.decorator;
                }
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trigger.prototype, "validate", {
        get: function () {
            if (!this.decorator)
                return;
            if (this.shouldCheck) {
                switch (this.decorator.type) {
                    case 'property':
                        return this;
                    default:
                        return this.decorator;
                }
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trigger.prototype, "checker", {
        /**it is used when trigger is used as event or property for check*/
        get: function () {
            if (!this.decorator)
                return;
            return this.decorator.checkerAll;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trigger.prototype, "validator", {
        /**it is used when trigger is used as property binding for check and validator*/
        get: function () {
            if (!this.decorator)
                return;
            return this.decorator.validatorAll;
        },
        enumerable: true,
        configurable: true
    });
    return Trigger;
}());
var memberDecorator = (function () {
    function memberDecorator() {
        var _this = this;
        this.isPrototype = true;
        this.befores = [];
        this.afters = [];
        this.checks = [];
        this.onGets = [];
        this.validates = [];
        this.bindBefores = [];
        this.bindAfters = [];
        this.beforeBindChanges = [];
        this.afterBindChanges = [];
        this.listenPaths = [];
        this.childrenListenPaths = [];
        this.listeners = {};
        this.addListen = function (path) {
            var p = obp.analyzePath(path);
            //this.listenPaths.push(p);
            var id = p.join('');
            var lsn = new listener(p, _this);
            if (_this.listeners[id]) {
                //clear if exists
                _this.listeners[id].clear();
                _this.listeners[id].parent = undefined;
            }
            _this.listeners[id] = lsn;
            lsn.listen();
            //disable old listen
            //if (this.listenPathChangedTrigger) {
            //    this.listenPathChangedTrigger.target = undefined;
            //    this.listenPathChangedTrigger.method = undefined; 
            //    this.listenPathChangedTrigger = undefined;
            //}
            //if (this.listeningObject && this.listeningProperty) {
            //    this.listeningObject[this.listeningProperty] = undefined;
            //}
            //this.listeningObject = undefined; 
            //this.listeningProperty = undefined;
            //if (this.listeningTrigger) {
            //    this.listeningTrigger.target = undefined;
            //    this.listeningTrigger = undefined;
            //}
            //set up new path:
            //this.listenPath = obp.analyzePath(path);
            //set up new listen
            //this.initializeListen();
        };
        this.removeListen = function (path) {
            var p = obp.analyzePath(path);
            var id = p.join('');
            if (_this.listeners[id]) {
                //clear if exists
                _this.listeners[id].clear();
                _this.listeners[id].parent = undefined;
                _this.listeners[id] = undefined;
            }
        };
        //private listenPathChangedTrigger: ITrigger;
        //private listeningObject: Object;
        //private listeningProperty: string;
        //private listeningTrigger: ITrigger; //for add listener to 'afters' of decorator;
        //private listenPathChanged = () => {
        //    //disable old listen;
        //    if (this.listenPathChangedTrigger) {
        //        this.listenPathChangedTrigger.target = undefined;
        //        this.listenPathChangedTrigger.method = undefined; 
        //        this.listenPathChangedTrigger = undefined;
        //    }
        //    if (this.listeningObject && this.listeningProperty) {
        //        this.listeningObject[this.listeningProperty] = undefined;
        //    }
        //    this.listeningObject = undefined;
        //    this.listeningProperty = undefined;
        //    if (this.listeningTrigger) {
        //        this.listeningTrigger.target = undefined;
        //        this.listeningTrigger = undefined;
        //    }
        //    this.initializeListen();
        //}
        this.initializeListen = function () {
            _this.listenPaths.forEach(function (path) {
                var id = path.join('');
                var lsn = new listener(path, _this);
                _this.listeners[id] = lsn;
                lsn.listen();
            });
            //set up new listen
            //if (this.listenPath && this.listenPath.length > 0) {
            //    let listenTarget = obp.getPathSourceKeyValue(this.target, this.listenPath);
            //    if (listenTarget && listenTarget.source && listenTarget.key) {
            //        let d = obs.getDecorator(listenTarget.source, listenTarget.key, true);
            //        if (d && d.type == 'event') {
            //            //in this case, keep the listeningObject and listeningProperty will cause trouble.
            //            this.listeningTrigger = {
            //                target: this,
            //                method: this.handler
            //            };
            //            d.afters.push(this.listeningTrigger);
            //        }
            //        else {
            //            this.listeningObject = listenTarget.source;
            //            this.listeningProperty = listenTarget.key;
            //            this.listeningObject[this.listeningProperty] = this.invoker;
            //        }
            //    }
            //    if (this.listenPath && this.listenPath.length > 0) {
            //        this.listenPathChangedTrigger = {
            //            target: this.target,
            //            method: this.listenPathChanged
            //        };
            //    }
            //    obp.setPathChangedTrigger(this.target, this.listenPath, this.listenPathChangedTrigger);
            //}
        };
        this.before = function (path) {
            _this.befores.push({ target: 'self', path: obp.analyzePath(path) });
            return _this;
        };
        this.after = function (path) {
            _this.afters.push({ target: 'self', path: obp.analyzePath(path) });
            return _this;
        };
        this.beforeBindChange = function (path) {
            _this.beforeBindChanges.push({ target: 'self', path: obp.analyzePath(path) });
            return _this;
        };
        this.afterBindChange = function (path) {
            _this.afterBindChanges.push({ target: 'self', path: obp.analyzePath(path) });
            return _this;
        };
        this.check = function (path) {
            _this.checks.push({ target: 'self', path: obp.analyzePath(path) });
            return _this;
        };
        this.onGet = function (path) {
            _this.onGets.push({ target: 'self', path: obp.analyzePath(path) });
            return _this;
        };
        this.validate = function (validator) {
            _this.validates.push({ target: 'self', validator: validator });
            return _this;
        };
        /** use as path(()=>HostType.prototype.property.property1.property2...) */
        this.bind = function (value, mode) {
            _this.bindingPath = obp.analyzePath(value);
            _this.bindingPathMode = mode ? mode : PathBindingMode.bind;
            //this.bindingCondition = condition;
            return _this;
        };
        this.syncFrom = function (value) {
            _this.bindingPath = obp.analyzePath(value);
            _this.bindingPathMode = PathBindingMode.syncFrom;
            return _this;
        };
        this.updateTo = function (value) {
            _this.bindingPath = obp.analyzePath(value);
            _this.bindingPathMode = PathBindingMode.updateTo;
            return _this;
        };
        this.setBindingPath = function (value, mode) {
            var triggerArgs = [_this.target, _this.propertyKey + ':BeforeBindPathChange', [], value, _this.bindingPath];
            _this.beforeBindChanges.forEach(function (trigger) {
                if (trigger && !obs.isDisposed(trigger.target)) {
                    obp.invokeTrigger(trigger, triggerArgs);
                    return true;
                }
                return false;
            });
            //disable old trigger by set target to null;
            if (_this.bindingPathChangedTrigger)
                _this.bindingPathChangedTrigger.target = undefined;
            _this.bindingPath = obp.analyzePath(value);
            _this.bindingPathMode = mode;
            //this.bindingCondition = condition;
            // set up new binding;
            if (_this.bindingPath && _this.bindingPath.length > 0) {
                _this.bindingPathChangedTrigger = {
                    target: _this,
                    method: _this.bindingPathChanged
                };
                if (_this.bindingPath)
                    obp.setPathChangedTrigger(_this.target, _this.bindingPath, _this.bindingPathChangedTrigger);
                var newSource = obp.getPathSourceKeyValue(_this.target, _this.bindingPath);
                obp.invokeTrigger(_this.triggerOnly, [newSource.source, newSource.key, [], newSource.value, _this.RealValue]);
            }
            _this.afterBindChanges.forEach(function (trigger) {
                if (trigger && !obs.isDisposed(trigger.target)) {
                    obp.invokeTrigger(trigger, triggerArgs);
                    return true;
                }
                return false;
            });
        };
        this.bindingPathChanged = function (source, key, decorators) {
            if (_this.bindingPathChangedTrigger)
                _this.bindingPathChangedTrigger.target = undefined;
            _this.bindingPathChangedTrigger = {
                target: _this,
                method: _this.bindingPathChanged
            };
            if (!_this.bindingPath || _this.bindingPath.length == 0)
                return;
            obp.setPathChangedTrigger(_this.target, _this.bindingPath, _this.bindingPathChangedTrigger);
            var newSource = obp.getPathSourceKeyValue(_this.target, _this.bindingPath);
            obp.invokeTrigger(_this.triggerOnly, [newSource.source, newSource.key, [], newSource.value, _this.RealValue]);
        };
        this.clearValuePaths = function (value) {
            if (!_this.target || !obs.isInitialized(_this.target))
                return;
            if (!value)
                return;
            if (_this.defaultPath) {
                //console.log('----- Clear defaultPath for RealValue -----');
                obp.setPathValue(value, _this.defaultPath, undefined, undefined, _this.propertyKey);
            }
            if (obs.isObservableArray(value)) {
                if (_this.childDefaultPath) {
                    value.childDefaultPath = undefined;
                }
                if (_this.childrenListenPaths && _this.childrenListenPaths.length > 0) {
                    value.childrenListenPaths = [];
                }
                if (_this.observePath) {
                    //console.log('----- Clear observePath for RealValue -----');
                    var observationSource = obs.getDecorator(value, 'observationSource', true);
                    if (observationSource)
                        observationSource.setBindingPath(undefined, PathBindingMode.syncFrom);
                }
                if (_this.observerPath) {
                    //console.log('----- Clear observerPath for RealValue -----');
                    var observationSource = obs.getDecorator(value, 'observer', true);
                    if (observationSource)
                        observationSource.setBindingPath(undefined, PathBindingMode.syncFrom);
                }
                if (_this.populatePath) {
                    //console.log('----- Clear populatePath for RealValue -----');
                    var populationTarget = obs.getDecorator(value, 'populationTarget', true);
                    if (populationTarget)
                        populationTarget.setBindingPath(undefined, PathBindingMode.syncFrom);
                }
                if (_this.populatorPath) {
                    //console.log('----- Clear populatorPath for RealValue -----');
                    var populationTarget = obs.getDecorator(value, 'populator', true);
                    if (populationTarget)
                        populationTarget.setBindingPath(undefined, PathBindingMode.syncFrom);
                }
            }
        };
        this.setValuePaths = function (value) {
            if (!_this.target || !obs.isInitialized(_this.target))
                return;
            if (!value)
                return;
            if (_this.defaultPath) {
                console.log('----- Set defaultPath for RealValue -----', _this.target);
                obp.setPathValue(value, _this.defaultPath, _this.target, _this.target, _this.propertyKey);
            }
            if (obs.isObservableArray(value)) {
                if (_this.childDefaultPath) {
                    value.childDefaultPath = _this.childDefaultPath;
                }
                //console.log('childrenListenPaths', this.childrenListenPaths);
                if (_this.childrenListenPaths && _this.childrenListenPaths.length > 0) {
                    //console.log('set childrenListenPaths');
                    value.childrenListenPaths = _this.childrenListenPaths;
                }
                if (_this.observePath) {
                    //if (this.propertyKey == 'products') console.log('----- Set observePath for RealValue -----');
                    var observationSource = obs.getDecorator(value, 'observationSource', true);
                    if (observationSource)
                        observationSource.setBindingPath(_this.observePath, PathBindingMode.syncFrom);
                }
                if (_this.observerPath) {
                    //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
                    var observationSource = obs.getDecorator(value, 'observer', true);
                    if (observationSource)
                        observationSource.setBindingPath(_this.observerPath, PathBindingMode.syncFrom);
                }
                if (_this.populatePath) {
                    //if (this.propertyKey == 'products') console.log('----- Set populatePath for RealValue -----');
                    var populationTarget = obs.getDecorator(value, 'populationTarget', true);
                    if (populationTarget)
                        populationTarget.setBindingPath(_this.populatePath, PathBindingMode.syncFrom);
                }
                if (_this.populatorPath) {
                    //if (this.propertyKey == 'products') console.log('----- Set populatorPath for RealValue -----');
                    var populationTarget = obs.getDecorator(value, 'populator', true);
                    if (populationTarget)
                        populationTarget.setBindingPath(_this.populatorPath, PathBindingMode.syncFrom);
                }
            }
        };
        this.replaceSelf = function (target, propertyKey) {
            _this.target = target;
            _this.propertyKey = propertyKey;
            _this.befores.forEach(function (trigger) {
                if (trigger.target == 'self')
                    trigger.target = target;
            });
            _this.afters.forEach(function (trigger) {
                if (trigger.target == 'self')
                    trigger.target = target;
            });
            _this.checks.forEach(function (check) {
                if (check.target == 'self')
                    check.target = target;
            });
            _this.validates.forEach(function (validate) {
                if (validate.target == 'self')
                    validate.target = target;
            });
        };
        /**
         * Call this when instance has been created.
         */
        this.instantiate = function () {
            switch (_this.type) {
                case 'property':
                    _this.property(_this.target, _this.propertyKey);
                    break;
                case 'event':
                    _this.event(_this.target, _this.propertyKey);
                    break;
                case 'method':
                    _this.method(_this.target, _this.propertyKey);
                    break;
            }
            _this.setValuePaths(_this.RealValue);
            _this.initializeBindingPath();
            _this.initializeListen();
            _this.blocking = false;
            _this.instantiated = true;
        };
        this.initialize = function () {
            if (_this.isPrototype)
                _this.target['@ObjectService.Prototype'] = true;
        };
        this.property = function (target, propertyKey, descriptor) {
            if (obs.disabled)
                return; //do not replace the property definition when it is disabled;
            //console.log('propert: ', target);
            _this.replaceSelf(target, propertyKey);
            obs.setDecorator(target, propertyKey, _this).initializeProperty(target, propertyKey, descriptor);
        };
        //private bindSetter: IBindSetter;
        this.initializeProperty = function (target, propertyKey, descriptor) {
            //console.log('****** Initialize Property ' + propertyKey, this.isPrototype, this);
            var that = _this;
            _this.initialize();
            _this.type = 'property';
            // this.initializeBindingPath(); should do this when Object is instance
            _this.validatorAll = function (source, memberKey, decorators, newValue, oldValue) {
                if (decorators.some(function (dc) { return dc === that; }))
                    return newValue;
                decorators.push(that);
                that.validates.forEach(function (vali) {
                    newValue = that.invokeValidate(vali, [source, memberKey, decorators, newValue, oldValue]);
                });
                return newValue;
            };
            _this.checkerAll = function (source, memberKey, decorators) {
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                if (decorators.some(function (dc) { return dc === that; }))
                    return true;
                decorators.push(that);
                var checkerAllArguments = [source, memberKey, decorators];
                if (args && obs.isArray(args))
                    args.forEach(function (arg) { return checkerAllArguments.push(arg); });
                return that.checks.every(function (check) { return that.invokeCheck(check, checkerAllArguments); });
            };
            _this.bindSetter = function (source, memberKey, decorators, newValue, oldValue, triggerDecorators, isFromPath) {
                if (_this.blocking) {
                    that.RealValue = newValue;
                }
                else {
                    //make sure it is only called once:
                    if (!obs.isArray(decorators))
                        decorators = [];
                    if (decorators.some(function (dc) { return dc === that; }))
                        return true;
                    decorators.push(that);
                    //check value; source and memberKey are undefined when the setter is triggered by assignment; 
                    if (!that.checkerAll.apply(undefined, [source, memberKey, [], newValue, that.RealValue]))
                        return false; //set is rejected when check is not passed.
                    //validate value
                    newValue = that.validatorAll.apply(target, [source, memberKey, [], newValue, that.RealValue]);
                    //set source and memerKey as the current one if they are empty;
                    if (source === undefined)
                        source = target;
                    if (memberKey === undefined)
                        memberKey = propertyKey;
                    if (oldValue === undefined)
                        oldValue = that.RealValue;
                    //call bindBefores;
                    var triggerCheckDecorators_1 = [];
                    var triggerValidateDecorators_1 = [];
                    if (!that.bindBefores.every(function (trigger) {
                        if (trigger.check && trigger.check.target && !obs.isDisposed(trigger.check.target)) {
                            if (!that.invokeCheck(trigger.check, [source, memberKey, triggerCheckDecorators_1, newValue, oldValue]))
                                return false;
                        }
                        if (trigger.validate) {
                            newValue = that.invokeValidate(trigger.validate, [source, memberKey, triggerValidateDecorators_1, newValue, oldValue]); //  trigger.validate.validator.apply(trigger.validate.target, [newValue, oldValue]);
                        }
                        return true;
                    }))
                        return false; //rejected by bind checks
                    var bindingArgs_1 = [source, memberKey, decorators, newValue, oldValue];
                    if (!obs.isArray(triggerDecorators))
                        triggerDecorators = [];
                    var triggerArgs_1 = [source, memberKey, triggerDecorators, newValue, oldValue];
                    //console.log('bind setter args for trigger: ' + propertyKey, bindingArgs, newValue, that.befores, that.afters);
                    that.befores = that.befores.filter(function (trigger) {
                        if (trigger && !obs.isDisposed(trigger.target)) {
                            //perform checks if there are any
                            //trigger.method.apply(trigger.target, args);
                            obp.invokeTrigger(trigger, triggerArgs_1);
                            return true;
                        }
                        return false;
                    });
                    that.bindBefores = that.bindBefores.filter(function (trigger) {
                        if (trigger.target && !obs.isDisposed(trigger.target)) {
                            //trigger.method.apply(trigger.target, args);
                            obp.invokeTrigger(trigger, bindingArgs_1);
                            return true;
                        }
                        return false;
                    });
                    that.RealValue = newValue;
                    if (!isFromPath)
                        switch (that.bindingPathMode) {
                            case PathBindingMode.bind:
                            case PathBindingMode.updateTo:
                                obp.setPathValue(target, that.bindingPath, newValue, target, propertyKey);
                                break;
                        }
                    //call bindAfters;
                    that.bindAfters = that.bindAfters.filter(function (trigger) {
                        if (trigger.target && !obs.isDisposed(trigger.target)) {
                            //trigger.method.apply(trigger.target, args);
                            obp.invokeTrigger(trigger, bindingArgs_1);
                            return true;
                        }
                        return false;
                    });
                    that.afters = that.afters.filter(function (trigger) {
                        if (trigger && !obs.isDisposed(trigger.target)) {
                            //trigger.method.apply(trigger.target, args);
                            obp.invokeTrigger(trigger, triggerArgs_1);
                            return true;
                        }
                        return false;
                    });
                }
                return true;
            };
            _this.invoker = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (that.blocking)
                    return;
                if (obs.isFunction(that.RealValue))
                    return (that.RealValue).apply(target, args);
                return;
            };
            //the real setter for the property descriptor;
            var setter = function (value) {
                //console.log('property setter [' + that.propertyKey + ']', value);
                switch (obs.statusStack[0]) {
                    case invokeStatus.bindBefore:
                        //console.log('setter bind before: ', target, propertyKey);
                        if (value)
                            that.bindBefores.push(value);
                        if (value.decorator) {
                            value.decorator.bindBefores.push(that.bindOnly);
                        }
                        break;
                    case invokeStatus.bindBeforeWithCheckValidate:
                        //console.log('setter bind before: ', target, propertyKey);
                        if (value)
                            that.bindBefores.push(value);
                        if (value.decorator) {
                            value.decorator.bindBefores.push(that.bindCheckValidate);
                        }
                        break;
                    case invokeStatus.bindAfter:
                        //console.log('setter bind after: ', target, propertyKey);
                        if (value)
                            that.bindAfters.push(value);
                        if (value.decorator) {
                            value.decorator.bindAfters.push(that.bindOnly);
                        }
                        break;
                    case invokeStatus.updateOneWayToBeforeWithCheckValidate:
                    case invokeStatus.updateOneWayToBefore:
                        //console.log('setter bind before: ', target, propertyKey);
                        if (value)
                            that.bindBefores.push(value);
                        break;
                    case invokeStatus.updateOneWayToAfter:
                        //console.log('setter bind after: ', target, propertyKey);
                        if (value)
                            that.bindAfters.push(value);
                        break;
                    case invokeStatus.check:
                        if (value)
                            that.checks.push(value);
                    case invokeStatus.validate:
                        if (value)
                            that.validates.push(value);
                    case invokeStatus.none:
                    default:
                        //it calls the bind setter;
                        that.bindSetter.apply(target, [undefined, undefined, [], value, that.RealValue]);
                }
            };
            var iValidatorAll = { target: target, validator: _this.validatorAll };
            _this.bindOnly = { target: target, method: _this.bindSetter, decorator: that };
            _this.bindCheckValidate = { target: target, method: _this.bindSetter, validate: iValidatorAll, decorator: that };
            _this.checker = function (source, memberKey, decorators) {
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                if (decorators.some(function (dc) { return dc === that; }))
                    return true;
                decorators.push(that);
                if (obs.isFunction(that.RealValue)) {
                    var checkerArgs_1 = [source, memberKey, decorators];
                    if (args && obs.isArray(args))
                        args.forEach(function (arg) { return checkerArgs_1.push(arg); });
                    return (that.RealValue).apply(target, checkerArgs_1);
                }
                return true;
            };
            _this.validator = function (source, memberKey, decorators, newValue, oldValue) {
                if (decorators.some(function (dc) { return dc === that; }))
                    return newValue;
                decorators.push(that);
                if (obs.isFunction(that.RealValue))
                    newValue = (that.RealValue).apply(target, [source, memberKey, decorators, newValue, oldValue]);
                return newValue;
            };
            //this is for trigger only, it will trigger the check of binding path value
            _this.handler = function (source, memberKey, decorators, args) {
                if (decorators.some(function (dc) { return dc === that; }))
                    return;
                decorators.push(that);
                switch (_this.bindingPathMode) {
                    case PathBindingMode.bind:
                    case PathBindingMode.syncFrom:
                        //syncFrom:
                        var newValue = obp.getPathValue(that.target, that.bindingPath);
                        //console.log('trigger property from handler: ', source, memberKey, decorators, newValue, that.realValue);
                        that.bindSetter.apply(that.target, [source, memberKey, [], newValue, that.RealValue, decorators, true]);
                        break;
                    case PathBindingMode.updateTo:
                        //update:
                        obp.setPathValue(that.target, that.bindingPath, that.realValue, that.target, that.propertyKey);
                        break;
                }
            }; //use bind setter to update value;
            //this.handler = (source: any, memberKey: string, args: any[]) => {
            //    if (obs.isFunction(that.realValue)) return (<Function>(that.realValue)).apply(target, args);
            //    return undefined;
            //};
            var getter = function () {
                switch (obs.statusStack[0]) {
                    case invokeStatus.invokeBefore:
                    case invokeStatus.invokeAfter:
                    case invokeStatus.invokeBeforeWithCheck:
                        return that.triggerOnly;
                    case invokeStatus.bindBefore:
                    case invokeStatus.bindAfter:
                    case invokeStatus.updateOneWayToBefore:
                    case invokeStatus.updateOneWayToAfter:
                        //console.log('getter bind: ', target, propertyKey);
                        return that.bindOnly;
                    case invokeStatus.updateOneWayToBeforeWithCheckValidate:
                    case invokeStatus.bindBeforeWithCheckValidate:
                        return that.bindCheckValidate;
                    case invokeStatus.check:
                    case invokeStatus.validate:
                    case invokeStatus.decorator:
                        return that;
                    case invokeStatus.none:
                    default:
                        that.onGets = that.onGets.filter(function (trigger) {
                            if (trigger && !obs.isDisposed(trigger.target)) {
                                //perform checks if there are any
                                obp.invokeTrigger(trigger, [target, propertyKey, []]);
                                return true;
                            }
                            return false;
                        });
                        return that.RealValue;
                }
            };
            //this.initializeListen();
            if (descriptor) {
                descriptor.configurable = true;
                that.bindSetter.apply(target, [undefined, undefined, [], descriptor.value, undefined]);
                delete descriptor["value"];
                delete descriptor["writable"];
                descriptor.get = getter;
                descriptor.set = setter;
            }
            else {
                Object.defineProperty(target, propertyKey, {
                    get: getter,
                    set: setter
                });
            }
            if (_this.observableType) {
                var newArray = obs.makeObservable(new (Function.prototype.bind.apply(_this.observableType, [])));
                if (obs.isArray(_this.realValue)) {
                    //should add existing values to the new one:
                    var existing = void 0;
                    util.appendArray(newArray, existing);
                }
                console.log(' *** set obervable array type instance from decorator');
                that.bindSetter.apply(target, [undefined, undefined, [], newArray, undefined]);
            }
        };
        this.blocking = false;
        this.suspend = function () {
            _this.blocking = true;
        };
        this.resume = function () {
            _this.blocking = false;
        };
        this.event = function (target, propertyKey, descriptor) {
            if (obs.disabled)
                return;
            _this.replaceSelf(target, propertyKey);
            obs.setDecorator(target, propertyKey, _this).initializeEvent(target, propertyKey, descriptor);
            //console.log('event decorator : ', propertyKey, this.listenPaths);
        };
        this.initializeEvent = function (target, propertyKey, descriptor) {
            var that = _this;
            _this.initialize();
            _this.type = 'event';
            that.checkerAll = function (source, memberKey, decorators) {
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                if (decorators.some(function (dc) { return dc === that; }))
                    return true;
                decorators.push(that);
                var checkerAllArguments = [source, memberKey, decorators];
                if (args && obs.isArray(args))
                    args.forEach(function (arg) { return checkerAllArguments.push(arg); });
                return that.checks.every(function (check) { return that.invokeCheck(check, checkerAllArguments); });
            };
            //this is the real trigger provided by the getter; it contains source and memberKey so as to allow checks;
            var invoker = function (source, memberKey, decorators, args) {
                if (!obs.isArray(decorators))
                    decorators = [];
                if (decorators.some(function (dc) { return dc === that; }))
                    return;
                decorators.push(that);
                var checkerArgs = [source, memberKey, []];
                if (args && obs.isArray(args))
                    args.forEach(function (arg) { return checkerArgs.push(arg); });
                //check my own
                if (!that.checkerAll.apply(undefined, checkerArgs))
                    return undefined;
                //set source and memerKey as the current one if they are empty;
                if (checkerArgs[0] === undefined)
                    checkerArgs[0] = target;
                if (checkerArgs[1] === undefined)
                    checkerArgs[1] = propertyKey;
                if (!that.befores.every(function (trigger) {
                    if (trigger.check && trigger.check.target && !obs.isDisposed(trigger.check.target)) {
                        return that.invokeCheck(trigger.check, checkerArgs);
                    }
                    return true;
                }))
                    return undefined;
                var triggerArgs = [source, memberKey, decorators];
                if (args && obs.isArray(args))
                    args.forEach(function (arg) { return triggerArgs.push(arg); });
                that.befores = that.befores.filter(function (trigger) {
                    if (trigger && !obs.isDisposed(trigger.target)) {
                        //perform checks if there are any
                        obp.invokeTrigger(trigger, triggerArgs);
                        return true;
                    }
                    return false;
                });
                var result;
                //console.log('event invoker - begin invoke realValue: ', target, propertyKey, that.realValue, args);
                //console.log('event invoker - is function?: ', obs.isFunction(that.realValue), typeof that.realValue);
                if (obs.isFunction(that.RealValue))
                    result = that.RealValue.apply(target, args); // do not invoke if value is not a function;
                that.afters = that.afters.filter(function (trigger) {
                    if (trigger && !obs.isDisposed(trigger.target)) {
                        obp.invokeTrigger(trigger, triggerArgs);
                        return true;
                    }
                    return false;
                });
                return result;
            };
            _this.invoker = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (obp.isEventProxy(_this.target))
                    console.log('EventProxy is invoked!!!');
                if (that.blocking)
                    return; //block the event if it is blocking;
                //source and memberKey are undefined when called directly.
                //console.log('invoking event method: ', target, propertyKey);
                return invoker.apply(undefined, [undefined, undefined, [], args]);
            };
            _this.checker = function (source, memberKey, decorators) {
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                if (decorators.some(function (dc) { return dc === that; }))
                    return true;
                decorators.push(that);
                if (obs.isFunction(that.RealValue)) {
                    var checkerArgs_2 = [source, memberKey, decorators];
                    if (args && obs.isArray(args))
                        args.forEach(function (arg) { return checkerArgs_2.push(arg); });
                    return (that.RealValue).apply(target, checkerArgs_2);
                }
                return true;
            };
            _this.validator = function (source, memberKey, decorators, newValue, oldValue) {
                if (decorators.some(function (dc) { return dc === that; }))
                    return newValue;
                decorators.push(that);
                if (obs.isFunction(that.RealValue))
                    newValue = (that.RealValue).apply(target, [source, memberKey, decorators, newValue, oldValue]);
                return newValue;
            };
            _this.handler = invoker;
            var getter = function () {
                switch (obs.statusStack[0]) {
                    case invokeStatus.invokeBefore:
                    case invokeStatus.invokeAfter:
                        return that.triggerOnly;
                    case invokeStatus.invokeBeforeWithCheck:
                        return that.triggerCheck;
                    case invokeStatus.check:
                    case invokeStatus.validate:
                    case invokeStatus.decorator:
                        return that;
                    case invokeStatus.none:
                    default:
                        that.onGets = that.onGets.filter(function (trigger) {
                            if (trigger && !obs.isDisposed(trigger.target)) {
                                //perform checks if there are any
                                trigger.method.apply(trigger.target, [target, propertyKey]);
                                return true;
                            }
                            return false;
                        });
                        return that.invoker;
                }
            };
            _this.bindSetter = function (source, memberKey, decorators, newValue, oldValue, triggerDecorators) {
                if (!obs.isArray(decorators))
                    decorators = [];
                if (decorators.some(function (dc) { return dc === that; }))
                    return true;
                decorators.push(that);
                //check value; source and memberKey are undefined when the setter is triggered by assignment; 
                if (!that.checkerAll.apply(undefined, [source, memberKey, [], newValue, oldValue]))
                    return false; //set is rejected when check is not passed.
                //validate value
                //newValue = that.validatorAll.apply(target, [source, memberKey, newValue, oldValue]); !! this is no validator
                //set source and memerKey as the current one if they are empty;
                if (source === undefined)
                    source = target;
                if (memberKey === undefined)
                    memberKey = propertyKey;
                if (oldValue === undefined)
                    oldValue = that.RealValue;
                //call bindBefores;
                if (!that.bindBefores.every(function (trigger) {
                    if (trigger.check && trigger.check.target && !obs.isDisposed(trigger.check.target)) {
                        if (!trigger.check.checker.apply(trigger.check.target, [source, memberKey, [], newValue, oldValue]))
                            return false;
                    }
                    if (trigger.validate) {
                        newValue = trigger.validate.validator.apply(trigger.validate.target, [newValue, oldValue]);
                    }
                    return true;
                }))
                    return false; //rejected by bind checks
                var args = [source, memberKey, decorators, newValue, oldValue];
                that.bindBefores = that.bindBefores.filter(function (trigger) {
                    if (trigger.target && !obs.isDisposed(trigger.target)) {
                        trigger.method.apply(trigger.target, args);
                        return true;
                    }
                    return false;
                });
                that.RealValue = newValue;
                //call bindAfters;
                that.bindAfters = that.bindAfters.filter(function (trigger) {
                    if (trigger.target && !obs.isDisposed(trigger.target)) {
                        trigger.method.apply(trigger.target, args);
                        return true;
                    }
                    return false;
                });
                return true;
            };
            var setter = function (value) {
                switch (obs.statusStack[0]) {
                    case invokeStatus.invokeBefore:
                        if (value)
                            that.befores.push(value);
                        break;
                    case invokeStatus.invokeAfter:
                        if (value)
                            that.afters.push(value);
                        break;
                    case invokeStatus.check:
                        if (value)
                            that.checks.push(value);
                    case invokeStatus.validate:
                        if (value)
                            that.validates.push(value);
                    case invokeStatus.none:
                    default:
                        that.bindSetter.apply(undefined, [undefined, undefined, [], value, that.RealValue]);
                        break;
                }
            };
            //this.initializeListen();
            if (descriptor) {
                descriptor.configurable = true;
                //this.RealValue = descriptor.value;
                that.bindSetter.apply(undefined, [undefined, undefined, [], descriptor.value, undefined]);
                delete descriptor["value"];
                delete descriptor["writable"];
                descriptor.get = getter;
                descriptor.set = setter;
            }
            else {
                //console.log('redefine property of ' + this.propertyKey, this.target[this.propertyKey]);
                Object.defineProperty(target, propertyKey, {
                    get: getter,
                    set: setter
                });
            }
        };
        /**method will enable interfaces for invokeBefore, invokeAfter, check, validate */
        this.method = function (target, propertyKey, descriptor) {
            //console.log('target ', target, propertyKey); 
            if (obs.disabled)
                return;
            _this.replaceSelf(target, propertyKey);
            obs.setDecorator(target, propertyKey, _this).initializeMethod(target, propertyKey, descriptor);
        };
        this.initializeMethod = function (target, propertyKey, descriptor) {
            var that = _this;
            _this.initialize();
            _this.type = 'method';
            _this.checker = function (source, memberKey, decorators) {
                var args = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    args[_i - 3] = arguments[_i];
                }
                if (decorators.some(function (dc) { return dc === that; }))
                    return true;
                decorators.push(that);
                if (obs.isFunction(that.RealValue)) {
                    var checkerArgs_3 = [source, memberKey, decorators];
                    if (args && obs.isArray(args))
                        args.forEach(function (arg) { return checkerArgs_3.push(arg); });
                    return (that.RealValue).apply(target, checkerArgs_3);
                }
                return true;
            };
            _this.validator = function (source, memberKey, decorators, newValue, oldValue) {
                if (decorators.some(function (dc) { return dc === that; }))
                    return newValue;
                decorators.push(that);
                if (obs.isFunction(that.RealValue))
                    newValue = (that.RealValue).apply(target, [source, memberKey, decorators, newValue, oldValue]);
                return newValue;
            };
            _this.handler = function (source, memberKey, decorators, args) {
                if (decorators.some(function (dc) { return dc === that; }))
                    return;
                decorators.push(that);
                if (obs.isFunction(that.RealValue))
                    return (that.RealValue).apply(target, args);
                return;
            };
            _this.invoker = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                if (that.blocking)
                    return;
                if (obs.isFunction(that.RealValue))
                    return (that.RealValue).apply(target, args);
                return;
            };
            var getter = function () {
                switch (obs.statusStack[0]) {
                    case invokeStatus.invokeBefore:
                    case invokeStatus.invokeAfter:
                    case invokeStatus.bindBeforeWithCheckValidate:
                        return that.triggerOnly;
                    case invokeStatus.check:
                    case invokeStatus.validate:
                    case invokeStatus.decorator:
                        return that;
                    case invokeStatus.none:
                    default:
                        return that.invoker;
                }
            };
            _this.bindSetter = function (source, memberKey, decorators, newValue, oldValue, triggerDecorators, isFromPath) {
                that.RealValue = newValue;
                return true;
            };
            var setter = function (value) {
                that.RealValue = value;
            };
            //this.initializeListen();
            if (descriptor) {
                descriptor.configurable = true;
                _this.RealValue = descriptor.value;
                delete descriptor["value"];
                delete descriptor["writable"];
                descriptor.get = getter;
                descriptor.set = setter;
            }
            else {
                Object.defineProperty(target, propertyKey, {
                    get: getter,
                    set: setter
                });
            }
        };
        /**Obtain all information from new decorator.*/
        this.allocate = function (newDecorator) {
            var old = _this.target;
            _this.target = newDecorator.target;
            _this.propertyKey = newDecorator.propertyKey;
            var target = _this.target;
            _this.befores.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.afters.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.bindBefores.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.bindAfters.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.beforeBindChanges.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.afterBindChanges.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.onGets.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.checks.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            _this.validates.forEach(function (item) {
                if (item.target === old || item.target == 'self')
                    item.target = target;
            });
            newDecorator.befores.forEach(function (item) { return _this.befores.push(item); });
            newDecorator.afters.forEach(function (item) { return _this.afters.push(item); });
            newDecorator.bindBefores.forEach(function (item) { return _this.bindBefores.push(item); });
            newDecorator.bindAfters.forEach(function (item) { return _this.bindAfters.push(item); });
            newDecorator.beforeBindChanges.forEach(function (item) { return _this.beforeBindChanges.push(item); });
            newDecorator.afterBindChanges.forEach(function (item) { return _this.afterBindChanges.push(item); });
            newDecorator.onGets.forEach(function (item) { return _this.onGets.push(item); });
            newDecorator.checks.forEach(function (item) { return _this.checks.push(item); });
            newDecorator.validates.forEach(function (item) { return _this.validates.push(item); });
            newDecorator.listenPaths.forEach(function (item) { return _this.listenPaths.push(item); });
            newDecorator.childrenListenPaths.forEach(function (item) { return _this.childrenListenPaths.push(item); });
            if (newDecorator.observePath && newDecorator.observePath.length > 0)
                _this.observePath = newDecorator.observePath;
            if (newDecorator.observerPath && newDecorator.observerPath.length > 0)
                _this.observerPath = newDecorator.observerPath;
            if (newDecorator.populatePath && newDecorator.populatePath.length > 0)
                _this.populatePath = newDecorator.populatePath;
            if (newDecorator.populatorPath && newDecorator.populatorPath.length > 0)
                _this.populatorPath = newDecorator.populatorPath;
            if (newDecorator.observableType)
                _this.observableType = newDecorator.observableType;
        };
        this.setDefault = function (path) {
            _this.default(path);
            var value = _this.RealValue;
            if (_this.defaultPath && _this.defaultPath.length > 0) {
                console.log('setting default path ', _this.defaultPath.join(''), value, _this.target);
                obp.setPathValue(value, _this.defaultPath, _this.target, _this.target, _this.propertyKey);
            }
        };
        this.setChildDefault = function (path) {
            _this.childDefault(path);
            var oa = _this.RealValue;
            if (!obs.isObservableArray(oa))
                return;
            if (_this.childDefaultPath) {
                oa.childDefaultPath = undefined;
            }
        };
        this.setObserve = function (path, populator, defaultRoot) {
            _this.observe(path, populator, defaultRoot);
            var oa = _this.RealValue;
            if (!obs.isObservableArray(oa))
                return;
            if (_this.observePath) {
                console.log('----- Set observePath for RealValue -----', oa);
                var observationSource = obs.getDecorator(oa, 'observationSource', true);
                if (observationSource)
                    observationSource.setBindingPath(_this.observePath, PathBindingMode.syncFrom);
            }
            if (_this.observerPath) {
                //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
                var observationSource = obs.getDecorator(oa, 'observer', true);
                if (observationSource)
                    observationSource.setBindingPath(_this.observerPath, PathBindingMode.syncFrom);
            }
        };
        this.setPopulate = function (path, populator, defaultRoot) {
            _this.observe(path, populator, defaultRoot);
            var oa = _this.RealValue;
            if (!obs.isObservableArray(oa))
                return;
            if (_this.observePath) {
                //if (this.propertyKey == 'products') console.log('----- Set observePath for RealValue -----');
                var observationSource = obs.getDecorator(oa, 'observationSource', true);
                if (observationSource)
                    observationSource.setBindingPath(_this.observePath, PathBindingMode.syncFrom);
            }
            if (_this.observerPath) {
                //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
                var observationSource = obs.getDecorator(oa, 'observer', true);
                if (observationSource)
                    observationSource.setBindingPath(_this.observerPath, PathBindingMode.syncFrom);
            }
        };
        this.triggerCheck = new Trigger(this, true);
        this.triggerOnly = new Trigger(this);
        this.type = 'method';
    }
    memberDecorator.prototype.observable = function (type) {
        this.observableType = type;
        return this;
    };
    memberDecorator.prototype.clone = function (instance) {
        var _this = this;
        var d = new memberDecorator();
        d.target = instance;
        d.propertyKey = this.propertyKey;
        d.isPrototype = false;
        d.type = this.type;
        d.observableType = this.observableType;
        this.befores.forEach(function (item) {
            d.befores.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afters.forEach(function (item) {
            d.afters.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.checks.forEach(function (item) {
            d.checks.push({
                target: (item.target === _this.target) ? instance : item.target,
                checker: item.checker,
                path: item.path
            });
        });
        this.onGets.forEach(function (item) {
            d.onGets.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.validates.forEach(function (item) {
            d.validates.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                validator: item.validator
            });
        });
        this.bindBefores.forEach(function (item) {
            d.bindBefores.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.bindAfters.forEach(function (item) {
            d.bindAfters.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.beforeBindChanges.forEach(function (item) {
            d.beforeBindChanges.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afterBindChanges.forEach(function (item) {
            d.afterBindChanges.push({
                target: (item.target === _this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        d.bindingPath = this.bindingPath;
        d.bindingPathMode = this.bindingPathMode;
        d.wrapPath = this.wrapPath;
        d.wrapConverterFrom = this.wrapConverterFrom;
        d.wrapConverterTo = this.wrapConverterTo;
        this.listenPaths.forEach(function (path) { return d.listenPaths.push(path); });
        d.childDefaultPath = this.childDefaultPath;
        this.childrenListenPaths.forEach(function (path) { return d.childrenListenPaths.push(path); });
        d.observePath = this.observePath;
        d.populatePath = this.populatePath;
        d.observerPath = this.observerPath;
        d.populatorPath = this.populatorPath;
        d.defaultPath = this.defaultPath;
        d.realValue = this.realValue;
        //switch (this.type) {
        //    case 'property':
        //        d.property(instance, this.propertyKey);
        //        break;
        //    case 'event':
        //        d.event(instance, this.propertyKey);
        //        break;
        //    case 'method':
        //        d.method(instance, this.propertyKey);
        //        break;
        //}
        return d;
    };
    memberDecorator.prototype.overwrite = function (d) {
        var _this = this;
        console.trace('%%% overwrite from => to', d.realValue, '=>', this.realValue);
        this.befores.forEach(function (item) {
            d.befores.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afters.forEach(function (item) {
            d.afters.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.checks.forEach(function (item) {
            d.checks.push({
                target: (item.target === _this.target) ? d.target : item.target,
                checker: item.checker,
                path: item.path
            });
        });
        this.onGets.forEach(function (item) {
            d.onGets.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.validates.forEach(function (item) {
            d.validates.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                validator: item.validator
            });
        });
        this.bindBefores.forEach(function (item) {
            d.bindBefores.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.bindAfters.forEach(function (item) {
            d.bindAfters.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.beforeBindChanges.forEach(function (item) {
            d.beforeBindChanges.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afterBindChanges.forEach(function (item) {
            d.afterBindChanges.push({
                target: (item.target === _this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        if (this.bindingPath && this.bindingPath.length > 0)
            d.bindingPath = this.bindingPath;
        if (this.bindingPathMode)
            d.bindingPathMode = this.bindingPathMode;
        if (this.wrapPath && this.wrapPath.length > 0)
            d.wrapPath = this.wrapPath;
        if (this.wrapConverterFrom)
            d.wrapConverterFrom = this.wrapConverterFrom;
        if (this.wrapConverterTo)
            d.wrapConverterTo = this.wrapConverterTo;
        this.listenPaths.forEach(function (path) { return d.listenPaths.push(path); });
        if (this.childDefaultPath && this.childDefaultPath.length > 0)
            d.childDefaultPath = this.childDefaultPath;
        this.childrenListenPaths.forEach(function (path) { return d.childrenListenPaths.push(path); });
        if (this.observePath && this.observePath.length > 0)
            d.observePath = this.observePath;
        if (this.populatePath && this.populatePath.length > 0)
            d.populatePath = this.populatePath;
        if (this.observerPath && this.observerPath.length > 0)
            d.observerPath = this.observerPath;
        if (this.populatorPath && this.populatorPath.length > 0)
            d.populatorPath = this.populatorPath;
        if (this.defaultPath && this.defaultPath.length > 0)
            d.defaultPath = this.defaultPath;
        if (this.realValue !== undefined)
            d.realValue = this.realValue;
        if (this.observableType)
            d.observableType = this.observableType;
        d.type = this.type;
        return d;
    };
    memberDecorator.prototype.listen = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        Array.prototype.push.apply(this.listenPaths, paths.map(function (path) { return obp.analyzePath(path); }));
        return this;
    };
    /**
     * if the value of this property is ObservableArray, this will automatically set up its observe;
     * @param path
     * @param observer
     */
    memberDecorator.prototype.observe = function (path, observer, defaultRoot) {
        var root = obp.analyzeMember(defaultRoot);
        if (root) {
            root = '.' + root;
        }
        else {
            root = '.parent';
        }
        this.observePath = obp.analyzePath(path);
        if (this.observePath)
            this.observePath.unshift(root);
        this.observerPath = obp.analyzePath(observer);
        if (this.observerPath)
            this.observerPath.unshift(root);
        return this;
    };
    /**
     * if the value of this property is ObservableArray, this will automatically set up its populate
     * @param path
     * @param populator
     */
    memberDecorator.prototype.populate = function (path, populator, defaultRoot) {
        var root = obp.analyzeMember(defaultRoot);
        if (root) {
            root = '.' + root;
        }
        else {
            root = '.parent';
        }
        this.populatePath = obp.analyzePath(path);
        if (this.populatePath)
            this.populatePath.unshift(root);
        this.populatorPath = obp.analyzePath(populator);
        if (this.populatorPath)
            this.populatorPath.unshift(root);
        return this;
    };
    memberDecorator.prototype.initializeBindingPath = function () {
        if (this.bindingPath && this.bindingPath.length > 0) {
            var triggerArgs_2 = [this.target, this.propertyKey + ':BeforeBindPathChange', [], this.bindingPath, undefined];
            this.bindingPathChangedTrigger = {
                target: this,
                method: this.bindingPathChanged
            };
            obp.setPathChangedTrigger(this.target, this.bindingPath, this.bindingPathChangedTrigger);
            var newSource = obp.getPathSourceKeyValue(this.target, this.bindingPath);
            obp.invokeTrigger(this.triggerOnly, [newSource.source, newSource.key, [], newSource.value, this.RealValue]);
            this.afterBindChanges.forEach(function (trigger) {
                if (trigger && !obs.isDisposed(trigger.target)) {
                    obp.invokeTrigger(trigger, triggerArgs_2);
                    return true;
                }
                return false;
            });
        }
    };
    /**
     * Set path of decorated property object to the host object;
     * this is useful when child.parent needs to synchronize with parent.root
     * obs.@defaultProperty(()=>parent) child: ChildType; then when an object is assigned to 'child' property, the host object will be assigned to its 'parent' property.;
     * @param path
     */
    memberDecorator.prototype.default = function (path) {
        console.log('analyzed default path:', obp.analyzePath(path), path.toString());
        this.defaultPath = obp.analyzePath(path);
        return this;
    };
    memberDecorator.prototype.childDefault = function (path) {
        this.childDefaultPath = obp.analyzePath(path);
        return this;
    };
    memberDecorator.prototype.listenChildren = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        Array.prototype.push.apply(this.childrenListenPaths, paths.map(function (path) { return obp.analyzePath(path); }));
        return this;
    };
    /**
     * wrap the path as a property, no value will be kept here;
     * @param path
     * @param forceType
     */
    memberDecorator.prototype.wrap = function (path, convertFrom, convertTo) {
        this.wrapPath = obp.analyzePath(path);
        this.wrapConverterFrom = convertFrom;
        this.wrapConverterTo = convertTo;
        return this;
    };
    Object.defineProperty(memberDecorator.prototype, "RealValue", {
        get: function () {
            if (this.wrapPath) {
                var value = obp.getPathValue(this.target, this.wrapPath);
                if (this.wrapConverterFrom)
                    value = this.wrapConverterFrom(value);
                return value;
            }
            else {
                return this.realValue;
            }
        },
        set: function (value) {
            if (this.propertyKey == 'value') {
                console.trace('~~~ set value: ', value);
                decoratorlist.push(this);
            }
            if (this.wrapPath) {
                //console.log('set wrap value', value, this.wrapPath);
                if (this.wrapConverterTo)
                    value = this.wrapConverterTo(value);
                var oldValue = obp.getPathValue(this.target, this.wrapPath);
                this.clearValuePaths(oldValue);
                obp.setPathValue(this.target, this.wrapPath, value, this.target, this.propertyKey);
                this.setValuePaths(value);
            }
            else {
                this.clearValuePaths(this.realValue);
                this.realValue = value;
                this.setValuePaths(this.realValue);
            }
        },
        enumerable: true,
        configurable: true
    });
    memberDecorator.prototype.invokeCheck = function (check, args) {
        if (check.checker) {
            return check.checker.apply(check.target, args);
        }
        else {
            if (check.path && obs.isArray(check.path)) {
                return obp.invokePath(check.target, check.path, args);
            }
            else {
                return true;
            }
        }
    };
    memberDecorator.prototype.invokeValidate = function (validate, args) {
        if (validate.validator) {
            return validate.validator.apply(validate.target, args);
        }
        else {
            if (validate.path && obs.isArray(validate.path)) {
                return obp.invokePath(validate.target, validate.path, args);
            }
            else {
                return args[2];
            }
        }
    };
    memberDecorator.prototype.applyDecorator = function (d) {
        var _this = this;
        if (!this.propertyKey)
            this.propertyKey = d.propertyKey;
        if (!this.target)
            this.target = d.target;
        var target = this.target;
        d.befores.forEach(function (item) {
            _this.befores.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        d.afters.forEach(function (item) {
            _this.afters.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        d.bindBefores.forEach(function (item) {
            _this.bindBefores.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        d.bindAfters.forEach(function (item) {
            _this.bindAfters.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.beforeBindChanges.forEach(function (item) {
            _this.beforeBindChanges.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.afterBindChanges.forEach(function (item) {
            _this.afterBindChanges.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.onGets.forEach(function (item) {
            _this.onGets.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.checks.forEach(function (item) {
            _this.checks.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, checker: item.checker, path: item.path });
        });
        this.validates.forEach(function (item) {
            _this.validates.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, path: item.path, validator: item.validator });
        });
        d.listenPaths.forEach(function (item) { return _this.listenPaths.push(item); });
        if (d.childDefaultPath)
            this.childDefaultPath = d.childDefaultPath;
        d.childrenListenPaths.forEach(function (item) { return _this.childrenListenPaths.push(item); });
        if (d.observableType)
            this.observableType = d.observableType;
        if (d.observePath && d.observePath.length > 0)
            this.observePath = d.observePath;
        if (d.observerPath && d.observerPath.length > 0)
            this.observerPath = d.observerPath;
        if (d.populatePath && d.populatePath.length > 0)
            this.populatePath = d.populatePath;
        if (d.populatorPath && d.populatorPath.length > 0)
            this.populatorPath = d.populatorPath;
        // the following should have different behavior for instantiated and non-instantiated;
        if (this.instantiated) {
            if (d.bindingPath && d.bindingPath.length > 0)
                this.setBindingPath(d.bindingPath, d.bindingPathMode);
            d.listenPaths.forEach(function (item) { return _this.addListen(item); });
            if (obs.isObservableArray(this.RealValue)) {
                var oa_1 = this.RealValue;
                if (d.childDefaultPath)
                    oa_1.childDefaultPath = this.childDefaultPath;
                d.childrenListenPaths.forEach(function (path) { return oa_1.listenChildren(path); });
                if (this.observePath) {
                    //if (this.propertyKey == 'products') console.log('----- Set observePath for RealValue -----');
                    var observationSource = obs.getDecorator(oa_1, 'observationSource', true);
                    if (observationSource)
                        observationSource.setBindingPath(this.observePath, PathBindingMode.syncFrom);
                }
                if (this.observerPath) {
                    //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
                    var observationSource = obs.getDecorator(oa_1, 'observer', true);
                    if (observationSource)
                        observationSource.setBindingPath(this.observerPath, PathBindingMode.syncFrom);
                }
                if (this.populatePath) {
                    //if (this.propertyKey == 'products') console.log('----- Set populatePath for RealValue -----');
                    var populationTarget = obs.getDecorator(oa_1, 'populationTarget', true);
                    if (populationTarget)
                        populationTarget.setBindingPath(this.populatePath, PathBindingMode.syncFrom);
                }
                if (this.populatorPath) {
                    //if (this.propertyKey == 'products') console.log('----- Set populatorPath for RealValue -----');
                    var populationTarget = obs.getDecorator(oa_1, 'populator', true);
                    if (populationTarget)
                        populationTarget.setBindingPath(this.populatorPath, PathBindingMode.syncFrom);
                }
            }
        }
        else {
            if (d.bindingPath && d.bindingPath.length > 0)
                this.bindingPath = d.bindingPath;
            if (d.bindingPathMode)
                this.bindingPathMode = d.bindingPathMode;
        }
    };
    return memberDecorator;
}());
exports.memberDecorator = memberDecorator;
var listener = (function () {
    function listener(path, parent) {
        var _this = this;
        this.path = path;
        this.parent = parent;
        this.listen = function () {
            if (_this.path && _this.path.length > 0) {
                var listenTarget = obp.getPathSourceKeyValue(_this.parent.target, _this.path);
                if (listenTarget && listenTarget.source && listenTarget.key) {
                    var d = obs.getDecorator(listenTarget.source, listenTarget.key, true);
                    if (d && d.type == 'event') {
                        //in this case, keep the listeningObject and listeningProperty will cause trouble.
                        _this.trigger = {
                            target: _this.parent.target,
                            method: _this.parent.handler
                        };
                        d.afters.push(_this.trigger);
                    }
                    else {
                        _this.target = listenTarget.source;
                        _this.property = listenTarget.key;
                        _this.target[_this.property] = _this.parent.invoker;
                    }
                }
                if (_this.path && _this.path.length > 0) {
                    _this.pathChanged = {
                        target: _this,
                        method: _this.onPathChanged
                    };
                }
                obp.setPathChangedTrigger(_this.parent.target, _this.path, _this.pathChanged);
            }
        };
        this.clear = function () {
            if (_this.pathChanged) {
                _this.pathChanged.target = undefined;
                _this.pathChanged.method = undefined;
                _this.pathChanged = undefined;
            }
            if (_this.target && _this.property) {
                _this.target[_this.property] = undefined;
            }
            _this.target = undefined;
            _this.property = undefined;
            if (_this.trigger) {
                _this.trigger.target = undefined;
                _this.trigger.method = undefined;
                _this.trigger = undefined;
            }
        };
        this.onPathChanged = function () {
            _this.clear();
            _this.listen();
        };
    }
    return listener;
}());
exports.listener = listener;
/**
 * decorates a class for specific behaviors
 */
var objectDecorator = (function () {
    function objectDecorator() {
        var _this = this;
        /**
         * ['@ObjectService.ConstructionStack'] is the array of constructors. The last element in this array shows which constructor level are it just completes.
         * This provides a way to work out the inherit level during the decorated construction process. If there is only one element, that means it has complete the last constructor process;
         */
        this.bindableBase = function (target, instanceFunction) {
            // save a reference to the original constructor
            var original = target;
            // a utility function to generate instances of a class
            var that;
            function construct(args) {
                var p = ["['@ObjectService.Decorators']", "['method']", "['listenPaths']"];
                var pp = ["['__proto__']", "['@ObjectService.Decorators']", "['method']", "['listenPaths']"];
                var classPrototype = original.prototype;
                //console.log('*** dcrs Before Call Original: ', original.name , obp.getPathValue(that, p), obp.getPathValue(classPrototype, p),
                //    obp.getPathValue(that, pp), obp.getPathValue(classPrototype, pp))
                //if (!prototypeDecorators) {
                //    prototypeDecorators = classPrototype['@ObjectService.Decorators'];
                //    delete classPrototype['@ObjectService.Decorators'];
                //}
                var builder = eval('(function(cnstr, proto, that, args) {\n\
                let ' + original.name + ' = function () {\n\
                    return cnstr.apply(that, args);\n\
                };\n\
                ' + original.name + '.prototype = proto;\n\
                return ' + original.name + '();\n\
            })')(original, classPrototype, that, args);
                //there is no need to initiate multiple times
                //let instance: Object = that;
                if (that['@ObjectService.ConstructionStack'].length == 1) {
                    //console.log('*** dcrs After Call Original: ', original.name, obp.getPathValue(that, p), obp.getPathValue(classPrototype, p),
                    //    obp.getPathValue(that, pp), obp.getPathValue(classPrototype, pp));
                    var prototypeDecorators = classPrototype['@ObjectService.Decorators'];
                    var instanceDecorators = that['@ObjectService.Decorators'];
                    //console.log('inherit structure:',
                    //    that['@ObjectService.ConstructionStack'].join(),
                    //    '---prototype decorators: ',
                    //    util.reduceOf(prototypeDecorators, (previous, key) => previous ? (previous + ', ' + key) : key),
                    //    '---instance decorators: ',
                    //    util.reduceOf(instanceDecorators, (previous, key) => previous ? (previous + ', ' + key) : key));
                    Object.defineProperty(that, '@ObjectService.Instance', {
                        configurable: false,
                        enumerable: false,
                        value: true,
                        writable: false
                    });
                    Object.defineProperty(that, '@ObjectService.ModulePath', {
                        configurable: false,
                        enumerable: true,
                        value: __filename,
                        writable: false
                    });
                    Object.defineProperty(that, '@ObjectService.TypeName', {
                        configurable: false,
                        enumerable: true,
                        value: original.name,
                        writable: false
                    });
                    Object.defineProperty(that, '@ObjectService.Decorators', {
                        configurable: false,
                        enumerable: false,
                        value: {},
                        writable: false
                    });
                    //get decorators from prototype:
                    //let decorators: memberDecorator[] = [];
                    for (var key in instanceDecorators) {
                        that['@ObjectService.Decorators'][key] = instanceDecorators[key].clone(that);
                        //decorators.push(instanceDecorators[key]);
                        that['@ObjectService.Decorators'][key].instantiate();
                    }
                }
                //call instantiate for each decorator, so instance decorator are properly initialized;
                //decorators.forEach(item => item.instantiate());
                //call additional set up if instanceFunction is not null;
                if (instanceFunction) {
                    //console.log('****** bindable initializing before instanceFunction:', original.name, instanceFunction.toString());
                    instanceFunction(that, classPrototype);
                }
                //console.log('****** bindable initializing:', that, that['__proto__'], classPrototype, classPrototype['__proto__']);
                return builder;
            }
            // the new constructor behaviour
            function setThat(value) {
                that = value;
            }
            var invoker = eval('(function (original, construct, setThat) {\n\
    var ' + original.name + ' = function () {\n\
        setThat(this);\n\
        var instance = this;\n\
        if (instance["@ObjectService.ConstructionStack"]) {\n\
            instance["@ObjectService.ConstructionStack"].push(original.name);\n\
        }\n\
        else {\n\
            instance["@ObjectService.ConstructionStack"] = [original.name];\n\
        }\n\
        var newValue = construct(arguments);\n\
        instance["@ObjectService.ConstructionStack"].pop();\n\
        return newValue;\n\
    };\n\
    ' + original.name + '.prototype = original.prototype;\n\
    return ' + original.name + ';\n\
})');
            // return new constructor (will override original)
            return invoker(original, construct, setThat);
        };
        this.proxy = function (target) {
            var logHandler = {
                deleteProperty: function (obj, property) {
                    console.log('deleting ' + property + ' of ', obj);
                    delete obj[property];
                    return true;
                },
                get: function (obj, property) {
                    return obj[property];
                },
                set: function (obj, property, value, receiver) {
                    console.log('setting', property, 'for', obj, ' to value: (', value, ')');
                    obj[property] = value;
                    // you have to return true to accept the changes
                    return true;
                }
            };
            function instanceFunction(instance, classPrototype) {
                Object.defineProperty(instance, '@ObjectService.Proxy', {
                    configurable: false,
                    enumerable: true,
                    value: true,
                    writable: false
                });
                return new Proxy(instance, logHandler);
            }
            return _this.bindableBase(target, instanceFunction);
        };
        /**
         * specify the object as bindable; it enables the bindings;
         * @param target
         */
        this.bindable = function (target) {
            return _this.bindableBase(target);
        };
        /**
         * specify an array as observable; it enables the observable feature and bindings;
         * WARNING! this shall be only applied to Observable Array;
         * @param target
         */
        this.observable = function (target) {
            var arrayChangeHandler = {
                deleteProperty: function (obsArray, property) {
                    delete obsArray[property];
                    if (/^\d+$/ig.test(property.toString()) && obsArray.onchange)
                        obsArray.onchange({ array: obsArray, operation: ArrayOperationType.delete, startIndex: Number(property) });
                    return true;
                },
                get: function (obsArray, property) {
                    return obsArray[property];
                },
                set: function (obsArray, property, value, receiver) {
                    //console.log('setting', property, typeof property, 'for', obsArray, 'with value: (', value, ')');
                    var oldValue = obsArray[property];
                    obsArray[property] = value;
                    if (/^\d+$/ig.test(property)) {
                        obsArray.itemListeners[property] = new itemListener(obsArray, value, obsArray.childrenListenPaths);
                        if (obsArray.childDefaultPath && obsArray.childDefaultPath.length > 0) {
                            obp.setPathValue(oldValue, this.childDefaultPath, undefined, this, 'childDefaultPath');
                            obp.setPathValue(value, this.childDefaultPath, this, this, 'childDefaultPath');
                        }
                        if (obsArray.onchange)
                            obsArray.onchange({ array: obsArray, items: [value], operation: ArrayOperationType.replace, startIndex: Number(property) });
                    }
                    // you have to return true to accept the changes
                    return true;
                }
            };
            var instanceFunction = function (instance, classPrototype) {
                //console.log('ObservableArray instanceFunction called');
                //classPrototype['@ObjectService.ObservableArray'] = true;
                //instance['@ObjectService.ObservableArray'] = true;
                Object.defineProperty(instance, '@ObjectService.ObservableArray', {
                    configurable: false,
                    enumerable: true,
                    value: true,
                    writable: false
                });
                //Object.defineProperty(instance, '@ObjectService.ArrayInstance', {
                //    configurable: false,
                //    enumerable: false,
                //    value: instance,
                //    writable: false
                //});
                //let proxy = new Proxy(instance, arrayChangeHandler);
                return new Proxy(instance, arrayChangeHandler);
            };
            return _this.bindableBase(target, instanceFunction);
            //let original: Function = target;
            //// a utility function to generate instances of a class
            //let prototypeDecorators: { [key: string]: memberDecorator };
            //let that = this; 
            //function construct(constructor: Function, args: any[]) {
            //    let __proto = constructor.prototype;
            //    if (!prototypeDecorators) {
            //        prototypeDecorators = __proto['@ObjectService.Decorators'];
            //        delete __proto['@ObjectService.Decorators'];
            //    }
            //    let instance: { [id: string]: any } = eval('(function(proto) {\n\
            //        let '+ original.name + ' = function () {\n\
            //            return constructor.apply(this, args);\n\
            //        };\n\
            //        ' + original.name + '.prototype = proto;\n\
            //        return new '+ original.name + '();\n\
            //    })')(__proto);
            //    Object.defineProperty(instance, '@ObjectService.Instance', {
            //        configurable: false,
            //        enumerable: false,
            //        value: true,
            //        writable: false
            //    });
            //    Object.defineProperty(instance, '@ObjectService.ModulePath', {
            //        configurable: false,
            //        enumerable: true,
            //        value: __filename,
            //        writable: false
            //    });
            //    Object.defineProperty(instance, '@ObjectService.TypeName', {
            //        configurable: false,
            //        enumerable: true,
            //        value: original.name,
            //        writable: false
            //    });
            //    Object.defineProperty(instance, '@ObjectService.Decorators', {
            //        configurable: false,
            //        enumerable: false,
            //        value: {},
            //        writable: false
            //    });
            //    //get decorators from prototype:
            //    let instanceDecorators: { [key: string]: memberDecorator } = instance['@ObjectService.Decorators'];
            //    let decorators: memberDecorator[] = [];
            //    //code for inhireting decorators:
            //    //set up the current one;
            //    __proto['@ObjectService.PrototypeDecorators'] = {};
            //    let DecoratorsForInherit: { [key: string]: memberDecorator } = __proto['@ObjectService.PrototypeDecorators'];
            //    //try to get existing ones;
            //    if (__proto['__proto__']['@ObjectService.PrototypeDecorators']) {
            //        let inheritedDecorators: { [key: string]: memberDecorator } = __proto['__proto__']['@ObjectService.PrototypeDecorators'];
            //        for (let key in inheritedDecorators) {
            //            DecoratorsForInherit[key] = inheritedDecorators[key];
            //            instanceDecorators[key] = inheritedDecorators[key].clone(instance);
            //            decorators.push(instanceDecorators[key]);
            //        }
            //    }
            //    for (let key in prototypeDecorators) {
            //        DecoratorsForInherit[key] = prototypeDecorators[key];
            //        if (instanceDecorators[key]) {
            //            //need to combine inherited and new;
            //            prototypeDecorators[key].overwrite(instanceDecorators[key]);
            //        }
            //        else {
            //            instanceDecorators[key] = prototypeDecorators[key].clone(instance);
            //        }
            //        decorators.push(instanceDecorators[key]);
            //    }
            //    //console.log('DecoratorsForInherit for ' + original.name + ':', DecoratorsForInherit);
            //    //console.log('[[[[[ Observable Array Begin Instantiate Decorators ]]]]]', instanceDecorators, instance);
            //    decorators.forEach(item => item.instantiate());
            //    //console.log('[[[[[ Observable Array Decorators Replaced ]]]]]', instanceDecorators, instance);
            //    Object.defineProperty(instance, '@ObjectService.ObservableArray', {
            //        configurable: false,
            //        enumerable: true,
            //        value: true,
            //        writable: false
            //    });
            //    //Object.defineProperty(instance, '@ObjectService.ArrayInstance', {
            //    //    configurable: false,
            //    //    enumerable: false,
            //    //    value: instance,
            //    //    writable: false
            //    //});
            //    let proxy = new Proxy(instance, arrayChangeHandler);
            //    return new Proxy(instance, arrayChangeHandler);
            //}
            //// the new constructor behaviour
            //var f: any = function (...args: any[]) {
            //    //console.log("New: " + original.name + " : Serializable");
            //    return construct(original, args);
            //}
            //// copy prototype so intanceof operator still works
            //f.prototype = original.prototype;
            //// return new constructor (will override original)
            //return f;
        };
    }
    return objectDecorator;
}());
exports.objectDecorator = objectDecorator;
/**
 * Object Binding Path
 */
var obp = (function () {
    function obp() {
    }
    obp.invokeTrigger = function (trigger, args) {
        //console.log('invokeTrigger', trigger, args);
        if (trigger.method) {
            return trigger.method.apply(trigger.target, args);
        }
        else {
            return obp.invokePath(trigger.target, trigger.path, args);
        }
    };
    obp.isFunctionPath = function (value) {
        if (typeof value != 'string')
            return false;
        return /^\s*(\.\s*[$\w]+|\[\s*'[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+'\s*\]|\[\s*"[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+"\s*\]|\[\s*\d+\s*\])(\s*\(\s*\))\s*$/ig.test(value);
    };
    obp.isBracketPath = function (value) {
        if (typeof value != 'string')
            return false;
        return /^\s*(\[\s*'[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+'\s*\]|\[\s*"[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+"\s*\]|\[\s*\d+\s*\])\s*$/ig.test(value);
    };
    obp.isAccessorPath = function (value) {
        if (typeof value != 'string')
            return false;
        return /^\s*(\.\s*[$\w]+)\s*$/ig.test(value);
    };
    obp.getFunctionAccessor = function (value) {
        if (typeof value != 'string')
            return '';
        return value.substr(0, /\s*\(\s*\)\s*$/ig.exec(value).index);
    };
    obp.getPathType = function (value) {
        if (obp.isFunctionPath(value))
            return 'function';
        if (obp.isBracketPath(value))
            return 'bracket';
        if (obp.isPropertyPath(value))
            return 'property';
    };
    /**
     * Invoke a member or command of the host
     * @param host, the host object;
     * @param command: it can be property, method, or bracket such as .test, .test(), [2], ['test'], [3](), ['test']();
     */
    obp.invokeCommandByString = function (host, command) {
        return eval('(function(host){try {return host' + command + ';} catch(ex){return;}})')(host);
    };
    /**
     * Invoke a method of the host
     * @param host
     * @param method: this method name must not have (); it should be pure method name string;
     * @param args
     */
    obp.invokeMethodByString = function (host, method, args) {
        var func = eval('(function(host, args){try {return host' + method + ';} catch(ex){console.log("inner error: ", ex); return;}})')(host, args);
        if (!func)
            return;
        return func.apply(host, args);
    };
    obp.getPropertyDescriptorByString = function (host, member) {
        return eval('(function(host, args){try {return Object.getOwnPropertyDescriptor(host, "' + member + '");} catch(ex){return null;}})')(host);
    };
    obp.analyzePath = function (value) {
        if (!value)
            return;
        var code;
        var result = [];
        if (obs.isFunction(value)) {
            var f = value;
            code = f.toString();
            var mr = /return\s+/ig.exec(code);
            code = code.substr(mr.index + mr[0].length);
        }
        else {
            if (obs.isArray(value)) {
                var arr = value;
                code = arr.join('');
            }
            else {
                code = value.toString();
            }
        }
        var ptnPath = /\s*(\.\s*[$\w]+|\[\s*'[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+'\s*\]|\[\s*"[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+"\s*\]|\[\s*\d+\s*\])(\s*\(\s*\)|)/ig;
        var mp;
        while (mp = ptnPath.exec(code)) {
            if (/\s*\.\s*prototype/ig.test(mp[0])) {
                //ignore everything before prototype, because in other module, the class name will show as bindable_1.ClassName.prototype, where className will be shown in the path;
                result.splice(0, result.length);
            }
            else {
                result.push(obp.trimPath(mp[0]));
            }
        }
        //console.log('analyzing path:', result);
        return result;
    };
    obp.trimPath = function (value) {
        var match;
        if (match = /\s*(\.)\s*([$\w]+)(\s*(\()\s*(\))|)/ig.exec(value)) {
            return match[1] + match[2] + (match[4] ? match[4] : '') + (match[5] ? match[5] : '');
        }
        if (match = /\s*(\[)\s*('[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+')\s*(\])(\s*(\()\s*(\))|)/ig.exec(value)) {
            return match[1] + match[2] + match[3] + (match[5] ? match[5] : '') + (match[6] ? match[6] : '');
        }
        if (match = /\s*(\[)\s*("[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+")\s*(\])(\s*(\()\s*(\))|)/ig.exec(value)) {
            return match[1] + match[2] + match[3] + (match[5] ? match[5] : '') + (match[6] ? match[6] : '');
        }
        if (match = /\s*(\[)\s*(\d+)\s*(\])(\s*(\()\s*(\))|)/ig.exec(value)) {
            return match[1] + match[2] + match[3] + (match[5] ? match[5] : '') + (match[6] ? match[6] : '');
        }
        return '';
    };
    obp.analyzeMember = function (value) {
        var memberName;
        if (obs.isFunction(value)) {
            var paths = obp.analyzePath(value);
            if (paths && paths.length > 0)
                memberName = /[$\w]+/ig.exec(obp.analyzePath(value)[0])[0];
        }
        if (typeof value == 'string') {
            memberName = /[$\w]+/ig.exec(value)[0];
        }
        return memberName;
    };
    obp.getPropertyName = function (value) {
        return /\s*(\.\s*([$\w]+)(\s*\(\s*\)|)|\[\s*'([@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w]+)'\s*\](\s*\(\s*\)|)|\[\s*"([@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w]+)"\s*\](\s*\(\s*\)|)|\[(\s*\d+\s*)\](\s*\(\s*\)|))/ig.exec(value)[2];
    };
    obp.isPropertyPath = function (value) {
        return /^\s*\.\s*([$\w]+)\s*$/ig.test(value);
    };
    obp.getPathProperty = function (value) {
        return /^\s*\.\s*([$\w]+)\s*$/ig.exec(value)[1];
    };
    obp.setAccessorValue = function (host, path, value) {
        var func = eval('(function (host, value) { host' + path + ' = value;})');
        if (func)
            func(host, value);
    };
    /**
     * set value to specific path; it supports '.$$invokeEachElementInArray()' for array items;
     * @param host
     * @param path
     * @param value
     */
    obp.setPathValue = function (host, path, value, target, propertyKey) {
        var _this = this;
        if (!host)
            return;
        if (!path)
            return;
        if (!obs.isArray(path))
            return;
        var hosts = [host];
        var _loop_1 = function(i) {
            var newHosts = [];
            if (path[i].replace(/\s+/ig, '') == '.$$invokeEachElementInArray()') {
                hosts.forEach(function (item) {
                    if (obs.isArray(item))
                        item.forEach(function (subitem) { return newHosts.push(subitem); });
                });
            }
            else {
                hosts.forEach(function (item) {
                    var newItem;
                    if (i == path.length - 1) {
                        switch (obp.getPathType(path[i])) {
                            case 'function':
                                break;
                            case 'bracket':
                                obp.setAccessorValue(item, path[i], value);
                                break;
                            case 'property':
                                var pathProperty = obp.getPathProperty(path[i]);
                                var decorator = obs.getDecorator(item, pathProperty, true);
                                if (decorator) {
                                    //when there is decorator, use the bindSetter;
                                    decorator.bindSetter.apply(decorator.target, [target, propertyKey, [_this], value, decorator.RealValue, [_this]]);
                                }
                                else {
                                    //let descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(item, pathProperty); //  eval('(function(host, args){try {return Object.getOwnPropertyDescriptor(host, "' + trimmedPath + '");} catch(ex){return null;}})')(host);
                                    //console.log('obp.setPathValue: object, PropertyPath', item, pathProperty);//, descriptor);
                                    //if (descriptor) {
                                    //    if (descriptor) {
                                    //        if (descriptor.set) {
                                    //            descriptor.set.apply(item, value);
                                    //        }
                                    //        else {
                                    //            if (descriptor.writable) descriptor.value = value;
                                    //        }
                                    //    }
                                    //    else {
                                    //        item[pathProperty] = value;
                                    //    }
                                    //}
                                    item[pathProperty] = value;
                                }
                                break;
                        }
                    }
                    else {
                        newItem = obp.invokeCommandByString(item, path[i]); //eval('(function(host){try {return host' + path[i] + ';} catch(ex){return;}})')(host);
                        if (newItem)
                            newHosts.push(newItem);
                    }
                });
            }
            hosts = newHosts;
        };
        for (var i = 0; i < path.length; i++) {
            _loop_1(i);
        }
        return true;
    };
    obp.setPathChangedTrigger = function (host, path, trigger) {
        for (var i = 0; i < path.length; i++) {
            if (obp.isEventProxy(host)) {
                break; // it shall never change, because it is a proxy;
            }
            else {
                if (obp.isPropertyPath(path[i])) {
                    var decorator = obs.getDecorator(host, obp.getPropertyName(path[i]));
                    if (decorator && decorator.type == 'property') {
                        decorator.afters.push(trigger);
                    }
                }
                host = obp.invokeCommandByString(host, path[i]);
            }
        }
    };
    obp.isEventProxy = function (value) {
        if (!value)
            return false;
        return value['@ObjectService.EventProxy'];
    };
    obp.getEventProxyPath = function (path) {
        var id = path.map(function (value) { return obp.trimPath(value); }).join('');
        if (/^\./.test(id))
            id = id.substr(1);
        return id;
    };
    /**
     * this function can invoke any path; in case of exception, undefined is returned;
     * @param path
     * @param args
     */
    obp.invokePath = function (host, path, args) {
        if (!path)
            return;
        if (!obs.isArray(path))
            return;
        var hosts = [host];
        var result;
        var _loop_2 = function(i) {
            //console.log('invokePath: ', hosts, path[i]);
            var newHosts = [];
            hosts.forEach(function (item) {
                if (obp.isEventProxy(item)) {
                    var id = obp.getEventProxyPath(path.slice(i)); //.map(value => obp.trimPath(value)).join('');
                    //if (/^\./.test(id)) id = id.substr(1);
                    var d = obs.getDecorator(item, id);
                    d.invoker.apply(item, args);
                }
                else {
                    if (path[i].replace(/\s+/ig, '') == '.$$invokeEachElementInArray()') {
                        if (obs.isArray(item))
                            item.forEach(function (subitem) { return newHosts.push(subitem); });
                    }
                    else {
                        var newItem = void 0;
                        if (i == path.length - 1) {
                            newItem = obp.invokeCommandByString(item, path[i]); //eval('(function(host, args){try {return host' + path[i] + ';} catch(ex){return;}})')(item, args);
                            if (obs.isFunction(newItem)) {
                                try {
                                    newItem.apply(item, args);
                                }
                                catch (ex) {
                                    console.trace('Error invokePath:', item, path[i], path.join(''), ex);
                                }
                            }
                        }
                        else {
                            newItem = obp.invokeCommandByString(item, path[i]); //eval('(function(host){try {return host' + path[i] + ';} catch(ex){return;}})')(item);
                        }
                        if (newItem)
                            newHosts.push(newItem);
                    }
                }
            });
            hosts = newHosts;
            if (hosts.length == 0)
                return "break";
        };
        for (var i = 0; i < path.length; i++) {
            var state_2 = _loop_2(i);
            if (state_2 === "break") break;
        }
        return hosts;
    };
    /**
     * this function can invoke any path; in case of exception, undefined is returned;
     * @param path
     * @param args
     */
    obp.getPathValue = function (host, path) {
        if (!host)
            return;
        if (!path)
            return;
        if (!obs.isArray(path))
            return;
        var result;
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                if (obp.isFunctionPath(path[i])) {
                    var lastPath = obp.getFunctionAccessor(path[i]);
                    //let func: Function = eval('(function(host, args){try {return host' + lastPath + ';} catch(ex){console.log("inner error: ", ex); return;}})')(item, args);
                    ////console.log('invoke path function: ', lastPath, func);
                    //if (func) newHost = func.apply(item, args);
                    host = obp.invokeMethodByString(host, lastPath, []);
                }
                else {
                    host = obp.invokeCommandByString(host, path[i]); //eval('(function(host, args){try {return host' + path[i] + ';} catch(ex){return;}})')(item, args);
                }
            }
            else {
                host = obp.invokeCommandByString(host, path[i]); //eval('(function(host){try {return host' + path[i] + ';} catch(ex){return;}})')(item);
            }
        }
        return host;
    };
    obp.getPathSourceKeyValue = function (host, path) {
        if (!host)
            return;
        if (!path)
            return;
        if (!obs.isArray(path))
            return;
        var source;
        var result;
        var key;
        for (var i = 0; i < path.length; i++) {
            if (obp.isEventProxy(host)) {
                source = host;
                key = obp.getEventProxyPath(path.slice(i)); //.map(value => obp.trimPath(value)).join('');
                //if (/^\./.test(key)) key = key.substr(1);
                var d = obs.getDecorator(host, key); //let the event proxy initialize for this key;
                result = host[key]; //you will get the proxy method;
                break;
            }
            else {
                if (i == path.length - 1) {
                    source = host;
                    key = obp.getPropertyName(path[i]);
                    result = obp.invokeCommandByString(host, path[i]);
                }
                else {
                    host = obp.invokeCommandByString(host, path[i]); //eval('(function(host){try {return host' + path[i] + ';} catch(ex){return;}})')(item);
                }
            }
        }
        return { source: source, key: key, value: result };
    };
    return obp;
}());
exports.obp = obp;
var debug = (function () {
    function debug() {
    }
    debug.logPropertyDecorators = function (obj) {
        console.log('---- Begin list Decorators for; ', obj);
        for (var key in obj['@ObjectService.Decorators']) {
            var decorator = obj['@ObjectService.Decorators'][key];
            console.log('MemberDecorator for ' + key, decorator);
        }
        console.log('---- End list Decorator');
    };
    debug.logPropertyDecorator = function (obj, key) {
        var member = obp.analyzeMember(key);
        var decorator = obs.getDecorator(obj, member, true);
        console.log('MemberDecorator for ' + member, decorator);
    };
    return debug;
}());
exports.debug = debug;
/**
 * Object Binding Service
 */
var obs = (function () {
    function obs() {
    }
    obs.childDefault = function (path) {
        return (new memberDecorator()).childDefault(path);
    };
    obs.new = function (obj, setter) {
        return setter(obj), obj;
    };
    obs.isInitialized = function (obj) {
        return obj['@ObjectService.Instance'];
    };
    obs.appendAfter = function (target, member, trigger) {
        var memberName = obp.analyzeMember(member);
        var decorator = obs.getDecorator(target, memberName, true);
        if (decorator)
            decorator.afters.push(trigger);
    };
    obs.appendBefore = function (target, member, trigger) {
        var memberName = obp.analyzeMember(member);
        var decorator = obs.getDecorator(target, memberName, true);
        if (decorator)
            decorator.befores.push(trigger);
    };
    obs.suspend = function (target, member) {
        var memberName = obp.analyzeMember(member);
        var decorator = obs.getDecorator(target, memberName, true);
        if (decorator)
            decorator.suspend();
    };
    obs.resume = function (target, member) {
        var memberName = obp.analyzeMember(member);
        var decorator = obs.getDecorator(target, memberName, true);
        if (decorator)
            decorator.resume();
    };
    obs.block = function (target, member, func, host) {
        var memberName = obp.analyzeMember(member);
        var decorator = obs.getDecorator(target, memberName, true);
        if (decorator)
            decorator.suspend();
        func.apply(host, []); //block the event or method during the execution of the function;
        if (decorator)
            decorator.resume();
    };
    Object.defineProperty(obs, "bindable", {
        get: function () {
            var od = new objectDecorator();
            return od.bindable;
        },
        enumerable: true,
        configurable: true
    });
    ///**
    // * Wrap an array with proxy so as to monitor its behavior;
    // * @param target
    // */
    //static get observable(): (target: any) => void {
    //    let od = new objectDecorator();
    //    return od.observable;
    //}
    /**
     * specify the view property for a view object; this tells the parent view where to find this child
     * the content property must be property that can be set;
     * @param path
     */
    //static view(path: () => any): objectDecorator {
    //    let od = new objectDecorator();
    //    return od.view(path);
    //}
    obs.invokeBefore = function (setter) {
        obs.statusStack.unshift(invokeStatus.invokeBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    };
    obs.invokeAfter = function (setter) {
        obs.statusStack.unshift(invokeStatus.invokeAfter);
        setter.apply(undefined);
        obs.statusStack.shift();
    };
    obs.bindAfter = function (setter) {
        obs.statusStack.unshift(invokeStatus.bindBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    };
    obs.bindBefore = function (setter) {
        obs.statusStack.unshift(invokeStatus.bindAfter);
        setter.apply(undefined);
        obs.statusStack.shift();
    };
    obs.bindBeforeWithCheckValidate = function (setter) {
        obs.statusStack.unshift(invokeStatus.bindBeforeWithCheckValidate);
        setter.apply(undefined);
        obs.statusStack.shift();
    };
    obs.updateOneWayToBefore = function (setter) {
        obs.statusStack.unshift(invokeStatus.updateOneWayToBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    };
    obs.updateOneWayToAfter = function (setter) {
        obs.statusStack.unshift(invokeStatus.updateOneWayToBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    };
    obs.setBinding = function (target, propertyKey, path, mode) {
        obs.getDecorator(target, propertyKey).setBindingPath(path, mode);
    };
    obs.isFunction = function (functionToCheck) {
        return functionToCheck && typeof functionToCheck === 'function' && Object.prototype.toString.call(functionToCheck) === '[object Function]';
    };
    /**
     * Check whether the object has an iterator, which is the implementation of for of
     * @param objectToCheck
     */
    obs.isArray = function (objectToCheck) {
        return objectToCheck && typeof objectToCheck === 'object' && objectToCheck[Symbol.iterator]; //Object.prototype.toString.call(functionToCheck) === '[object Array]';
    };
    obs.isObservableArray = function (objectToCheck) {
        return objectToCheck && typeof objectToCheck === 'object' && objectToCheck[Symbol.iterator] && objectToCheck['@ObjectService.ObservableArray']; //Object.prototype.toString.call(functionToCheck) === '[object Array]';
    };
    obs.getIterator = function (array) {
        return array[Symbol.iterator]();
    };
    /**
     * (event) listen to onEvent. This method will set a handler to the onEvent property.
     * @param path
     */
    obs.listen = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        return memberDecorator.prototype.listen.apply(new memberDecorator(), paths);
    };
    obs.listenChildren = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        return memberDecorator.prototype.listenChildren.apply(new memberDecorator(), paths);
    };
    /**
     * (property) if the value of a property, this will automatically set up its observe;
     * @param path
     */
    obs.observe = function (path, observer) {
        return (new memberDecorator()).observe(path, observer);
    };
    /**
     * (property) if the value of a property, this will automatically set up its populate;
     * @param path
     */
    obs.populate = function (path, populator) {
        return (new memberDecorator()).populate(path, populator);
    };
    /**
     * (property) if the value of a property, this will automatically set up its default path as the host object;
     * @param path
     */
    obs.default = function (path) {
        return (new memberDecorator()).default(path);
    };
    obs.wrap = function (method, convertFrom, convertTo) {
        return (new memberDecorator()).wrap(method, convertFrom, convertTo);
    };
    obs.before = function (method) {
        return (new memberDecorator()).before(method);
    };
    obs.after = function (method) {
        return (new memberDecorator()).after(method);
    };
    obs.beforeBindChange = function (path) {
        return (new memberDecorator()).beforeBindChange(path);
    };
    obs.afterBindChange = function (path) {
        return (new memberDecorator()).afterBindChange(path);
    };
    obs.check = function (checker) {
        return (new memberDecorator()).check(checker);
    };
    obs.validate = function (validator) {
        return (new memberDecorator()).validate(validator);
    };
    obs.bind = function (path, mode) {
        return (new memberDecorator()).bind(path, mode);
    };
    obs.observable = function (type) {
        return (new memberDecorator()).observable(type);
    };
    /**
     * use Proxy to wrap observable array so that Array[number] accessor can also trigger onchange event;
     * @param obj
     */
    obs.makeObservable = function (obj) {
        var arrayChangeHandler = {
            deleteProperty: function (obsArray, property) {
                delete obsArray[property];
                if (/^\d+$/ig.test(property.toString()) && obsArray.onchange)
                    obsArray.onchange({ array: obsArray, operation: ArrayOperationType.delete, startIndex: Number(property) });
                return true;
            },
            get: function (obsArray, property) {
                return obsArray[property];
            },
            set: function (obsArray, property, value, receiver) {
                //console.log('setting', property, typeof property, 'for', obsArray, 'with value: (', value, ')');
                var oldValue = obsArray[property];
                obsArray[property] = value;
                if (/^\d+$/ig.test(property)) {
                    obsArray.itemListeners[property] = new itemListener(obsArray, value, obsArray.childrenListenPaths);
                    if (obsArray.childDefaultPath && obsArray.childDefaultPath.length > 0) {
                        obp.setPathValue(oldValue, this.childDefaultPath, undefined, this, 'childDefaultPath');
                        obp.setPathValue(value, this.childDefaultPath, this, this, 'childDefaultPath');
                    }
                    if (obsArray.onchange)
                        obsArray.onchange({ array: obsArray, items: [value], operation: ArrayOperationType.replace, startIndex: Number(property) });
                }
                // you have to return true to accept the changes
                return true;
            }
        };
        return new Proxy(obj, arrayChangeHandler);
    };
    Object.defineProperty(obs, "property", {
        get: function () {
            return (new memberDecorator()).property;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(obs, "event", {
        get: function () {
            return (new memberDecorator()).event;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(obs, "method", {
        get: function () {
            return (new memberDecorator()).method;
        },
        enumerable: true,
        configurable: true
    });
    obs.isDisposed = function (value) {
        if (typeof value != 'object')
            return false;
        return value['@ObjectService.Disposed'];
    };
    obs.dispose = function (value) {
        if (typeof value != 'object')
            return;
        value['@ObjectService.Disposed'] = true;
    };
    obs.getDecorator = function (value, propertyKey, doNotCreateWhenUndefined) {
        //if (typeof value != 'object') return;
        if (!value)
            return;
        if (!value['@ObjectService.Decorators'])
            value['@ObjectService.Decorators'] = {};
        var decorators = value['@ObjectService.Decorators'];
        if (value['@ObjectService.EventProxy']) {
            //event proxy always has a event property available when anyone try to access;
            var decorator = void 0;
            if (decorators[propertyKey]) {
                decorator = decorators[propertyKey];
            }
            else {
                decorator = new memberDecorator();
                decorators[propertyKey] = decorator;
                decorator.event(value, propertyKey);
            }
            decorator.target = value;
            decorator.propertyKey = propertyKey;
            return decorator;
        }
        else {
            if (!decorators[propertyKey] && !doNotCreateWhenUndefined) {
                var decorator = new memberDecorator();
                decorators[propertyKey] = decorator;
                decorator.target = value;
                decorator.propertyKey = propertyKey;
            }
            return decorators[propertyKey];
        }
    };
    obs.setDecorator = function (value, propertyKey, decorator) {
        if (!value)
            return;
        if (typeof value != 'object')
            return;
        if (!value['@ObjectService.Decorators'])
            value['@ObjectService.Decorators'] = {};
        var decorators = value['@ObjectService.Decorators'];
        if (decorators[propertyKey]) {
            //console.log('setDecorator allocate from new:', propertyKey);
            decorators[propertyKey].allocate(decorator);
        }
        else {
            decorators[propertyKey] = decorator;
        }
        return decorators[propertyKey];
    };
    /**
     * applyDecorator will apply the new decorator the existing one; the decorator will be returned if it needs instantiate;
     * @param value
     * @param propertyKey
     * @param decorator
     */
    obs.applyDecorator = function (value, propertyKey, decorator) {
        if (!value)
            return;
        if (typeof value != 'object')
            return;
        var d = obs.getDecorator(value, propertyKey);
        if (d) {
            //apply the new one to the existing one;
            d.applyDecorator(decorator);
            if (d.instantiated) {
                return;
            }
            else {
                return d;
            }
        }
        else {
            return obs.setDecorator(value, propertyKey, decorator);
        }
    };
    /**
     * make a plain object into a bindable object; Functions are converted to events, others are converted to property;
     * if events is defined, only the specified fields will be converted to events;
     * @param value
     */
    obs.makeBindable = function (value, keys, events) {
        var ids = [];
        util.appendArray(ids, keys);
        if (keys)
            keys.forEach(function (key) { if (ids.indexOf(key) < 0)
                ids.push(key); });
        if (events)
            events.forEach(function (key) { if (ids.indexOf(key) < 0)
                ids.push(key); });
        for (var key in value) {
            if (ids.indexOf(key) < 0)
                ids.push(key);
        }
        if (events) {
            ids.forEach(function (id) {
                if (events.indexOf(id) > -1) {
                    //make event
                    obs.makeEvent(value, id);
                }
                else {
                    //made property
                    obs.makeProperty(value, id);
                }
            });
        }
        else {
            ids.forEach(function (id) {
                if (obs.isFunction(value[id])) {
                    //make event
                    obs.makeEvent(value, id);
                }
                else {
                    //made property
                    obs.makeProperty(value, id);
                }
            });
        }
        return value;
    };
    /**
     * make a member field into propery
     * @param value
     * @param key
     */
    obs.makeProperty = function (value, key) {
        var d = obs.getDecorator(value, key, true);
        d.type = 'property';
        d.instantiate();
        return d;
    };
    /**
     * make a member field into event
     * @param value
     * @param key
     */
    obs.makeEvent = function (value, key) {
        var d = obs.getDecorator(value, key, true);
        d.type = 'event';
        d.instantiate();
        return d;
    };
    obs.syncFrom = function (path) {
        var obd = new memberDecorator();
        return obd.syncFrom(path);
    };
    obs.updateTo = function (path) {
        var obd = new memberDecorator();
        return obd.updateTo(path);
    };
    obs.statusStack = [];
    obs.disabled = false;
    return obs;
}());
exports.obs = obs;
//interface IPathSeekCondition {
//    depth?: number, /**depth<0 for indefinitely. any number for rounds of search*/
//    type?: string,
//    checkPath?: string[],
//    checkPathValue?: any
//}
(function (PathBindingMode) {
    PathBindingMode[PathBindingMode["bind"] = 0] = "bind";
    PathBindingMode[PathBindingMode["syncFrom"] = 1] = "syncFrom";
    PathBindingMode[PathBindingMode["updateTo"] = 2] = "updateTo";
})(exports.PathBindingMode || (exports.PathBindingMode = {}));
var PathBindingMode = exports.PathBindingMode;
var ArrExt = (function () {
    function ArrExt() {
    }
    ArrExt.prototype.add = function (item) {
        var arr = this;
        arr.push(item);
        return item;
    };
    ArrExt.prototype.insert = function (index, item) {
        var arr = this;
        arr.push(item);
        return item;
    };
    ArrExt.prototype.push = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        var arr = this;
        var length = ArrExt.$push.apply(arr, items);
        //console.log('array push: ', items);
        return length;
    };
    ArrExt.prototype.pop = function () {
        var arr = this;
        var r = ArrExt.$pop.apply(this, []);
        return r;
    };
    return ArrExt;
}());
var ObservableArray = (function (_super) {
    __extends(ObservableArray, _super);
    function ObservableArray() {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        _super.call(this);
        this.childDefaultChanged = function (source, key, decorators, newValue, oldValue) {
            if (oldValue && oldValue.length > 0) {
                _this.forEach(function (item) {
                    obp.setPathValue(item, oldValue, undefined, _this, 'childDefaultPath');
                });
            }
            if (newValue && newValue.length > 0) {
                _this.forEach(function (item) {
                    obp.setPathValue(item, newValue, _this, _this, 'childDefaultPath');
                });
            }
        };
        this.childrenListenPaths = [];
        this.itemListeners = [];
        this.itemEvents = (new EventProxy());
        Object.defineProperty(this, '@ObjectService.ObservableArray', {
            configurable: false,
            enumerable: true,
            value: true,
            writable: false
        });
        Array.prototype.push.apply(this, items);
        Array.prototype.push.apply(this.itemListeners, items.map(function (item) { return new itemListener(_this, item, _this.childrenListenPaths); }));
    }
    ObservableArray.prototype.push = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        var r = Array.prototype.push.apply(this, items);
        Array.prototype.push.apply(this.itemListeners, items.map(function (item) { return new itemListener(_this, item, _this.childrenListenPaths); }));
        if (this.childDefaultPath && this.childDefaultPath.length > 0)
            items.forEach(function (item) {
                obp.setPathValue(item, _this.childDefaultPath, _this, _this, 'childDefaultPath');
            });
        if (this.onchange)
            this.onchange({ array: this, items: items, operation: ArrayOperationType.push });
        return r;
    };
    ObservableArray.prototype.pop = function () {
        var r = Array.prototype.pop.apply(this, []);
        this.itemListeners.pop();
        if (this.childDefaultPath && this.childDefaultPath.length > 0)
            obp.setPathValue(r, this.childDefaultPath, undefined, this, 'childDefaultPath');
        if (this.onchange)
            this.onchange({ array: this, items: [r], operation: ArrayOperationType.pop });
        return r;
    };
    ObservableArray.prototype.unshift = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        var r = Array.prototype.unshift.apply(this, items);
        Array.prototype.unshift.apply(this.itemListeners, items.map(function (item) { return new itemListener(_this, item, _this.childrenListenPaths); }));
        if (this.childDefaultPath && this.childDefaultPath.length > 0)
            items.forEach(function (item) {
                obp.setPathValue(item, _this.childDefaultPath, _this, _this, 'childDefaultPath');
            });
        if (this.onchange)
            this.onchange({ array: this, items: items, operation: ArrayOperationType.unshift });
        return r;
    };
    ObservableArray.prototype.shift = function () {
        var r = Array.prototype.shift.apply(this, []);
        this.itemListeners.shift();
        if (this.childDefaultPath && this.childDefaultPath.length > 0)
            obp.setPathValue(r, this.childDefaultPath, undefined, this, 'childDefaultPath');
        if (this.onchange)
            this.onchange({ array: this, items: [r], operation: ArrayOperationType.shift });
        return r;
    };
    ObservableArray.prototype.splice = function (index, deleteCount) {
        var _this = this;
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        var spliceArgs = [index, deleteCount];
        Array.prototype.push.apply(spliceArgs, items);
        var r = Array.prototype.splice.apply(this, spliceArgs);
        var listenerSpliceArgs = [index, deleteCount];
        Array.prototype.push.apply(listenerSpliceArgs, items.map(function (item) { return new itemListener(_this, item, _this.childrenListenPaths); }));
        Array.prototype.splice.apply(this.itemListeners, listenerSpliceArgs);
        if (this.childDefaultPath && this.childDefaultPath.length > 0) {
            items.forEach(function (item) {
                obp.setPathValue(item, _this.childDefaultPath, _this, _this, 'childDefaultPath');
            });
            r.forEach(function (item) {
                obp.setPathValue(item, _this.childDefaultPath, undefined, _this, 'childDefaultPath');
            });
        }
        if (this.onchange)
            this.onchange({ array: this, items: items, operation: ArrayOperationType.splice, startIndex: index, spliceDeleteCount: deleteCount });
        return r;
    };
    ObservableArray.prototype.sort = function (compareFn) {
        if (!compareFn)
            compareFn = function (a, b) { return (a.toString() > b.toString()) ? 1 : -1; };
        var indicesArray = {};
        var len = this.length;
        for (var i = 0; i < len; i++) {
            indicesArray[i] = i;
        }
        //bubble sort
        for (var i = len - 1; i >= 0; i--) {
            for (var j = 1; j <= i; j++) {
                if (compareFn(this[indicesArray[j - 1]], this[indicesArray[j]]) > 0) {
                    var temp = indicesArray[j - 1];
                    indicesArray[j - 1] = indicesArray[j];
                    indicesArray[j] = temp;
                }
            }
        }
        var tempArray = Array.prototype.splice.apply(this, [0, len]);
        var tempListeners = this.itemListeners.splice(0, this.itemListeners.length);
        for (var i = 0; i < len; i++) {
            Array.prototype.push.apply(this, [tempArray[indicesArray[i]]]);
            this.itemListeners.push(tempListeners[indicesArray[i]]);
        }
        if (this.onchange)
            this.onchange({ array: this, items: this, operation: ArrayOperationType.configure, mappings: indicesArray });
        return this;
    };
    ObservableArray.prototype.clear = function () {
        var _this = this;
        var r = this.splice(0, this.length);
        this.itemListeners.splice(0, this.itemListeners.length);
        if (this.childDefaultPath && this.childDefaultPath.length > 0)
            r.forEach(function (item) {
                obp.setPathValue(item, _this.childDefaultPath, undefined, _this, 'childDefaultPath');
            });
        if (this.onchange)
            this.onchange({ array: this, items: r, operation: ArrayOperationType.splice, startIndex: 0, spliceDeleteCount: r.length });
        return r;
    };
    ObservableArray.prototype.reverse = function () {
        var indicesArray = {};
        var len = this.length;
        for (var i = 0; i < len; i++) {
            indicesArray[i] = len - i - 1;
        }
        var tempArray = Array.prototype.splice.apply(this, [0, len]);
        for (var i = 0; i < len; i++) {
            this.push(tempArray[indicesArray[i]]);
        }
        this.itemListeners.reverse();
        if (this.onchange)
            this.onchange({ array: this, items: this, operation: ArrayOperationType.configure, mappings: indicesArray });
        return this;
    };
    ObservableArray.prototype.asArray = function () {
        return this.slice(0, this.length);
    };
    ObservableArray.prototype.avatarize = function (source, avatarizer) {
        var _this = this;
        this.avatarizer = avatarizer;
        source.forEach(function (item) {
            Array.prototype.push(_this.avatarizer(item));
        });
    };
    ObservableArray.prototype.observationSourceChanged = function (source, key, decorators, newValue, oldValue) {
        //disable trigger for the old one;
        if (this.observationTrigger)
            this.observationTrigger.target = undefined;
        //set trigger for the new value
        this.observationTrigger = {
            target: this,
            method: this.observe
        };
        console.log(' >>>> observationSourceChanged newValue: ', newValue);
        if (obs.isObservableArray(newValue)) {
            var decorator = obs.getDecorator(newValue, 'onchange', true);
            if (decorator)
                decorator.afters.push(this.observationTrigger);
        }
        //reset this
        this.observe(this.observationSource, "onchange", [], { array: this.observationSource, items: this.observationSource, operation: ArrayOperationType.reset });
    };
    ObservableArray.prototype.observe = function (source, propertyKey, decorators, observableArrayEvent) {
        var converter = function (item) { return item; };
        if (this.observer)
            converter = this.observer;
        var target = this.observationSource;
        if (!target || !obs.isObservableArray(target)) {
            var resetArgs = [0, this.length];
            Array.prototype.splice.apply(this, resetArgs);
            if (this.onchange)
                this.onchange({ array: this, items: this, operation: ArrayOperationType.reset });
            return;
        }
        if (!observableArrayEvent || !observableArrayEvent.array || !observableArrayEvent.operation) {
            var resetArgs = [0, this.length];
            //if (!this.observationSource.map) console.log('this.observationSource.map: ', this.observationSource);
            resetArgs.push.apply(resetArgs, this.observationSource.map(function (item) { return converter(item); }));
            Array.prototype.splice.apply(this, resetArgs);
            if (this.onchange)
                this.onchange({ array: this, items: this, operation: ArrayOperationType.reset });
            return;
        }
        switch (observableArrayEvent.operation) {
            /*
            reset,
            replace,
            delete,
            push,
            pop,
            unshift,
            shift,
            splice,
            configure
            */
            default:
            case ArrayOperationType.reset:
                var resetArgs = [0, this.length];
                resetArgs.push.apply(resetArgs, this.observationSource.map(function (item) { return converter(item); }));
                Array.prototype.splice.apply(this, resetArgs);
                if (this.onchange)
                    this.onchange({ array: this, items: this, operation: ArrayOperationType.reset });
                break;
            case ArrayOperationType.replace:
                this[observableArrayEvent.startIndex] = converter(observableArrayEvent.items[0]);
                break;
            case ArrayOperationType.delete:
                delete this[observableArrayEvent.startIndex];
                break;
            case ArrayOperationType.push:
                this.push.apply(this, observableArrayEvent.items.map(function (item) { return converter(item); }));
                break;
            case ArrayOperationType.pop:
                this.pop();
                break;
            case ArrayOperationType.unshift:
                this.unshift.apply(this, observableArrayEvent.items.map(function (item) { return converter(item); }));
                break;
            case ArrayOperationType.shift:
                this.shift();
                break;
            case ArrayOperationType.splice:
                var spliceArgs = [observableArrayEvent.startIndex, observableArrayEvent.spliceDeleteCount];
                if (observableArrayEvent.items)
                    spliceArgs.push.apply(spliceArgs, observableArrayEvent.items.map(function (item) { return converter(item); }));
                this.splice.apply(this, spliceArgs);
                break;
            case ArrayOperationType.configure:
                var configureArgs = [0, this.length];
                for (var i = 0; i < observableArrayEvent.array.length; i++) {
                    configureArgs.push(this[observableArrayEvent.mappings[i]]);
                }
                Array.prototype.splice.apply(this, configureArgs);
                //here an onchange event need to be invoked mannually; 
                if (this.onchange)
                    this.onchange({ array: this, items: this, operation: ArrayOperationType.configure, mappings: observableArrayEvent.mappings });
                break;
        }
    };
    ObservableArray.prototype.populationTargetChanged = function (source, key, decorators, newValue, oldValue) {
        //clear the old one;
        if (oldValue) {
            oldValue.splice(0, oldValue.length);
        }
        //reset target
        this.populate(this.populationTarget, 'onchange', [], { array: this, items: this, operation: ArrayOperationType.reset });
    };
    ObservableArray.prototype.populate = function (source, propertyKey, decorators, observableArrayEvent) {
        var converter = function (item) { return item; };
        if (this.populator)
            converter = this.populator;
        var target = this.populationTarget;
        if (!target)
            return;
        if (!observableArrayEvent || !observableArrayEvent.array || !observableArrayEvent.operation) {
            var resetArgs = [0, target.length];
            resetArgs.push.apply(resetArgs, this.map(function (item) { return converter(item); }));
            target.splice.apply(target, resetArgs);
            return;
        }
        //work out pupolatoin target from tigger
        switch (observableArrayEvent.operation) {
            /*
            reset,
            replace,
            delete,
            push,
            pop,
            unshift,
            shift,
            splice,
            configure
            */
            default:
            case ArrayOperationType.reset:
                var resetArgs = [0, target.length];
                resetArgs.push.apply(resetArgs, this.map(function (item) { return converter(item); }));
                target.splice.apply(target, resetArgs);
                break;
            case ArrayOperationType.replace:
                target[observableArrayEvent.startIndex] = converter(observableArrayEvent.items[0]);
                break;
            case ArrayOperationType.delete:
                delete target[observableArrayEvent.startIndex];
                break;
            case ArrayOperationType.push:
                target.push.apply(target, observableArrayEvent.items.map(function (item) { return converter(item); }));
                break;
            case ArrayOperationType.pop:
                target.pop();
                break;
            case ArrayOperationType.unshift:
                this.unshift.apply(this, observableArrayEvent.items.map(function (item) { return converter(item); }));
                break;
            case ArrayOperationType.shift:
                target.shift();
                break;
            case ArrayOperationType.splice:
                var spliceArgs = [observableArrayEvent.startIndex, observableArrayEvent.spliceDeleteCount];
                if (observableArrayEvent.items)
                    spliceArgs.push.apply(spliceArgs, observableArrayEvent.items.map(function (item) { return converter(item); }));
                target.splice.apply(target, spliceArgs);
                break;
            case ArrayOperationType.configure:
                var configureArgs = [0, target.length];
                for (var i = 0; i < this.length; i++) {
                    configureArgs.push(target[observableArrayEvent.mappings[i]]);
                }
                target.splice.apply(target, configureArgs);
                break;
        }
    };
    /**
    * a method that allows dynamic listening of each children;
    * @param path
    * @param handler
    */
    ObservableArray.prototype.listenChildren = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        //console.log('Observable Array -> listenChildren', paths);
        Array.prototype.push.apply(this.childrenListenPaths, paths);
        this.itemListeners.forEach(function (il) { return paths.forEach(function (path) { return il.addPath(path); }); });
    };
    __decorate([
        obs.after(function () { return ObservableArray.prototype.populate; }).event, 
        __metadata('design:type', Function)
    ], ObservableArray.prototype, "onchange", void 0);
    __decorate([
        obs.property, 
        __metadata('design:type', Object)
    ], ObservableArray.prototype, "parent", void 0);
    __decorate([
        obs.after(function () { return ObservableArray.prototype.childDefaultChanged; }).property, 
        __metadata('design:type', Array)
    ], ObservableArray.prototype, "childDefaultPath", void 0);
    __decorate([
        obs.event, 
        __metadata('design:type', Object)
    ], ObservableArray.prototype, "childDefaultChanged", void 0);
    __decorate([
        obs.after(function () { return ObservableArray.prototype.observationSourceChanged; }).property, 
        __metadata('design:type', ObservableArray)
    ], ObservableArray.prototype, "observationSource", void 0);
    __decorate([
        obs.method, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object, String, Array, ObservableArray, ObservableArray]), 
        __metadata('design:returntype', void 0)
    ], ObservableArray.prototype, "observationSourceChanged", null);
    __decorate([
        obs.after(function () { return ObservableArray.prototype.populate; }).property, 
        __metadata('design:type', Function)
    ], ObservableArray.prototype, "observer", void 0);
    __decorate([
        obs.event, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object, String, Array, Object]), 
        __metadata('design:returntype', void 0)
    ], ObservableArray.prototype, "observe", null);
    __decorate([
        obs.after(function () { return ObservableArray.prototype.populationTargetChanged; }).property, 
        __metadata('design:type', Array)
    ], ObservableArray.prototype, "populationTarget", void 0);
    __decorate([
        obs.method, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object, String, Array, ObservableArray, ObservableArray]), 
        __metadata('design:returntype', void 0)
    ], ObservableArray.prototype, "populationTargetChanged", null);
    __decorate([
        obs.after(function () { return ObservableArray.prototype.observe; }).property, 
        __metadata('design:type', Function)
    ], ObservableArray.prototype, "populator", void 0);
    __decorate([
        obs.event, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object, String, Array, Object]), 
        __metadata('design:returntype', void 0)
    ], ObservableArray.prototype, "populate", null);
    __decorate([
        obs.property, 
        __metadata('design:type', Object)
    ], ObservableArray.prototype, "itemEvents", void 0);
    ObservableArray = __decorate([
        obs.bindable, 
        __metadata('design:paramtypes', [Object])
    ], ObservableArray);
    return ObservableArray;
}(Array));
exports.ObservableArray = ObservableArray;
var itemListener = (function () {
    function itemListener(parent, item, paths) {
        var _this = this;
        this.parent = parent;
        this.item = item;
        this.listeners = {};
        /**
         * add a new path listener to this;
         */
        this.addPath = function (path) {
            var pl = new pathListener(_this, path);
            var p = path.join('');
            if (_this.listeners[p]) {
                var pl_1 = _this.listeners[p];
                pl_1.clear();
                pl_1.parent = undefined;
            }
            _this.listeners[p] = pl;
            pl.listen();
        };
        this.removePath = function (path) {
            var p = path.join('');
            if (_this.listeners[p]) {
                var pl = _this.listeners[p];
                pl.clear();
                pl.parent = undefined;
                _this.listeners[p] = undefined;
            }
        };
        //console.log('new Item Listener:', item, paths);
        this.item = item;
        var that = this;
        paths.forEach(function (path) { return that.addPath(path); });
    }
    return itemListener;
}());
exports.itemListener = itemListener;
var pathListener = (function () {
    //constructor(public _parent: itemListener) {
    //}
    //@obs.property
    //public parent: itemListener;
    //public addListen = (path: string[]) =>{
    //    //add .parent.item to the path;
    //    let listenPath = ['.parent', '.item'];
    //    let eventPath = ['.parent', '.parent', '.itemEvents'];
    //    path.forEach(section => {
    //        listenPath.push(section);
    //        eventPath.push(section);
    //    });
    //    let d = obs.getDecorator(this, 'listener', true);
    //    d.addListen(listenPath);
    //    d.afters.push({
    //        target: this.parent.parent.itemEvents,
    //        path: eventPath
    //    });
    //}
    ////let the listener to listen to the child item
    //@obs.after(() => pathListener.prototype.parent).event
    //private listener: (...args: any[]) => any;
    function pathListener(parent, path) {
        var _this = this;
        this.parent = parent;
        this.path = path;
        this.listen = function () {
            //console.trace('begin listen child: ', this.path);
            if (!_this.parent || !_this.parent.item || !_this.parent.parent || !_this.parent.parent.itemEvents)
                return;
            //console.log(!this.parent, !this.parent.item, !this.parent.parent, !this.parent.parent.itemEvents);
            if (_this.path && _this.path.length > 0) {
                var listenTarget = obp.getPathSourceKeyValue(_this.parent.item, _this.path);
                //console.log('listen Target: ', listenTarget);
                if (listenTarget && listenTarget.source && listenTarget.key) {
                    var d = obs.getDecorator(listenTarget.source, listenTarget.key, true);
                    var dev = obs.getDecorator(_this.parent.parent.itemEvents, obp.getEventProxyPath(_this.path));
                    //console.log('decorator of EventProxy: ', dev, dev.propertyKey);
                    if (d && d.type == 'event') {
                        var that = _this;
                        //in this case, keep the listeningObject and listeningProperty will cause trouble.
                        _this.trigger = {
                            target: _this.parent.parent.itemEvents,
                            method: dev.handler
                        };
                        d.afters.push(_this.trigger);
                    }
                    else {
                        _this.target = listenTarget.source;
                        _this.property = listenTarget.key;
                        _this.target[_this.property] = dev.invoker;
                    }
                }
                if (_this.path && _this.path.length > 0) {
                    _this.pathChanged = {
                        target: _this,
                        method: _this.onPathChanged
                    };
                }
                obp.setPathChangedTrigger(_this.parent.item, _this.path, _this.pathChanged);
            }
        };
        this.clear = function () {
            if (_this.pathChanged) {
                _this.pathChanged.target = undefined;
                _this.pathChanged.method = undefined;
                _this.pathChanged = undefined;
            }
            if (_this.target && _this.property) {
                _this.target[_this.property] = undefined;
            }
            _this.target = undefined;
            _this.property = undefined;
            if (_this.trigger) {
                _this.trigger.target = undefined;
                _this.trigger.method = undefined;
                _this.trigger = undefined;
            }
        };
        this.onPathChanged = function () {
            _this.clear();
            _this.listen();
        };
    }
    return pathListener;
}());
exports.pathListener = pathListener;
/**
 * this is designed for itemEvents as the hub for listening events from item;
 * events are weak reference, so it won't cause trouble when the same item is added to a different ObservableArray at the same time;
 * this eventProxy must always has a decorator available for whatever listen and invoke access;
 */
var EventProxy = (function () {
    function EventProxy() {
        this['@ObjectService.EventProxy'] = true;
        this['@ObjectService.Decorators'] = {};
    }
    return EventProxy;
}());
exports.EventProxy = EventProxy;
(function (ArrayOperationType) {
    ArrayOperationType[ArrayOperationType["reset"] = 0] = "reset";
    ArrayOperationType[ArrayOperationType["replace"] = 1] = "replace";
    ArrayOperationType[ArrayOperationType["delete"] = 2] = "delete";
    ArrayOperationType[ArrayOperationType["push"] = 3] = "push";
    ArrayOperationType[ArrayOperationType["pop"] = 4] = "pop";
    ArrayOperationType[ArrayOperationType["unshift"] = 5] = "unshift";
    ArrayOperationType[ArrayOperationType["shift"] = 6] = "shift";
    ArrayOperationType[ArrayOperationType["splice"] = 7] = "splice";
    ArrayOperationType[ArrayOperationType["configure"] = 8] = "configure";
})(exports.ArrayOperationType || (exports.ArrayOperationType = {}));
var ArrayOperationType = exports.ArrayOperationType;
var BindableTest;
(function (BindableTest) {
    var enabled = false;
    if (enabled) {
        var point_1 = (function () {
            function point_1() {
                console.log('creating new point .....................');
            }
            point_1.prototype.solo = function () {
                console.log('point.solo called. (' + this.x + ', ' + this.y + ')');
            };
            point_1.prototype.jam = function () {
            };
            __decorate([
                obs.property, 
                __metadata('design:type', Number)
            ], point_1.prototype, "x", void 0);
            __decorate([
                obs.property, 
                __metadata('design:type', Number)
            ], point_1.prototype, "y", void 0);
            __decorate([
                obs.after(function () { return point_1.prototype.solo(); }).method, 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', []), 
                __metadata('design:returntype', void 0)
            ], point_1.prototype, "jam", null);
            point_1 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], point_1);
            return point_1;
        }());
        //Array.prototype.add = ArrayExtension.prototype.add;
        //let pushDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'push');
        //ArrExt.$push = Array.prototype.push;
        //Array.prototype.push = ArrExt.prototype.push;
        //console.log('Array.push', pushDescriptor);
        var values = new ObservableArray('james', 'stone');
        //values.push('200');
        //console.log('values: ', values);
        var tester_1 = (function () {
            function tester_1(dom) {
                this.dom = dom;
                this.chidren = [];
            }
            tester_1.prototype.stop = function () {
                console.log('stop();');
            };
            Object.defineProperty(tester_1.prototype, "value", {
                get: function () {
                    return '';
                },
                enumerable: true,
                configurable: true
            });
            tester_1.prototype.loop = function () {
                console.log('loop();');
            };
            tester_1.prototype.close = function () {
                console.log('close();', this.joke);
                var z;
                return '';
            };
            tester_1.prototype.jazz = function () {
                console.log('jazz.........................');
            };
            __decorate([
                obs.property, 
                __metadata('design:type', Array)
            ], tester_1.prototype, "chidren", void 0);
            __decorate([
                obs.before(function () { return tester_1.prototype.close(); }).event, 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', []), 
                __metadata('design:returntype', void 0)
            ], tester_1.prototype, "loop", null);
            __decorate([
                obs.after(function () { return tester_1.prototype.chidren.$$invokeEachElementInArray().solo(); }).event, 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', []), 
                __metadata('design:returntype', String)
            ], tester_1.prototype, "close", null);
            __decorate([
                obs.after(function () { return tester_1.prototype.close(); }).property, 
                __metadata('design:type', point_1)
            ], tester_1.prototype, "joke", void 0);
            __decorate([
                obs.bind(function () { return tester_1.prototype.joke.x; }).property, 
                __metadata('design:type', String)
            ], tester_1.prototype, "tom", void 0);
            __decorate([
                obs.after(function () { return tester_1.prototype.joke.solo(); }).property, 
                __metadata('design:type', String)
            ], tester_1.prototype, "jason", void 0);
            __decorate([
                obs.method, 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', []), 
                __metadata('design:returntype', void 0)
            ], tester_1.prototype, "jazz", null);
            tester_1 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [String])
            ], tester_1);
            return tester_1;
        }());
        var tester2 = (function (_super) {
            __extends(tester2, _super);
            function tester2() {
                _super.apply(this, arguments);
            }
            __decorate([
                obs.bind(function () { return tester_1.prototype.jason; }).property, 
                __metadata('design:type', String)
            ], tester2.prototype, "node", void 0);
            tester2 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], tester2);
            return tester2;
        }(tester_1));
        console.log('before constructing tester2 .........................');
        var t_1 = new tester2('hell');
        t_1.loop();
        var p = new point_1();
        var p2 = new point_1();
        p2.x = 200;
        p2.y = 300;
        var t2_1 = new tester2('zink');
        t2_1.chidren.push(p2);
        obs.bindBefore(function () {
            t_1.tom = t_1.jason;
            t2_1.tom = t_1.jason;
        });
        p.x = 30;
        p.y = 43;
        console.log('----------points: ', p, p2);
        t_1.chidren.push(p, p2);
        console.log('set t.joke as point ..........');
        t_1.joke = p;
        console.log('t.joke:', t_1.joke);
        console.log('t.tom:', t_1.tom);
        console.log('t.jason:', t_1.jason);
        console.log('t.node:', t_1.node);
        t2_1.tom = 88;
        console.log('t.joke:', t_1.joke);
        console.log('t.tom:', t_1.tom);
        console.log('t.jason:', t_1.jason);
        console.log('t.node:', t_1.node);
        console.log(t_1.chidren, t2_1.chidren, t2_1.tom);
        obs.invokeAfter(function () { return t_1.loop = t_1.close; });
        var arr = new ObservableArray(20, '30', 120);
        arr.onchange = function (ev) {
            console.log('ObservableArray Event:', ev.items, ev.startIndex, ev.operation);
        };
        arr[2] = 56;
        console.log('------------------ before delete -----------------');
        console.log('Is ObservableArray Array? ', obs.isArray(arr));
        if (obs.isArray(arr)) {
            console.log('begin iterating array: ', arr, Object.getOwnPropertyNames(arr));
            //for (let item of obs.getIterator(arr)) {
            //    console.log('iterating array: ', item);
            //}
            //arr.forEach(item => {
            //    console.log('iterating array: ', item);
            //});
            var itr = obs.getIterator(arr);
            var ir = void 0;
            while (ir = itr.next()) {
                if (ir.done)
                    break;
                console.log('iterating array: ', ir.value);
            }
        }
        delete arr[0];
        var jjjj = { test: 1, hello: 2 };
        console.log('Is Object Array? ', obs.isArray(jjjj));
        console.log('Array', arr.length, arr[0], arr[1], arr[2]);
        var arrIndex_1 = 0;
        arr.forEach(function (item) {
            console.log(arrIndex_1, item);
            arrIndex_1++;
        });
        arr[0] = 198;
        console.log('Array', arr.length, arr[0], arr[1], arr[2]);
        var j = void 0;
        var SyncElement = (function () {
            function SyncElement() {
            }
            SyncElement.prototype.pupolateHTMLElement = function (child) {
            };
            return SyncElement;
        }());
        var a = (function (_super) {
            __extends(a, _super);
            function a() {
                _super.call(this);
                this.view = document.createElement('a');
            }
            __decorate([
                obs.property, 
                __metadata('design:type', HTMLAnchorElement)
            ], a.prototype, "view", void 0);
            return a;
        }(SyncElement));
        var div = (function (_super) {
            __extends(div, _super);
            function div() {
                _super.call(this);
            }
            Object.defineProperty(div.prototype, "flexBasis", {
                get: function () {
                    return Number(this.view.style.flexBasis);
                },
                set: function (value) {
                    this.view.style.flexBasis = value.toString();
                },
                enumerable: true,
                configurable: true
            });
            __decorate([
                obs.property, 
                __metadata('design:type', HTMLDivElement)
            ], div.prototype, "view", void 0);
            return div;
        }(SyncElement));
        var flexSplitter = (function (_super) {
            __extends(flexSplitter, _super);
            function flexSplitter() {
                _super.apply(this, arguments);
            }
            __decorate([
                obs.property, 
                __metadata('design:type', div)
            ], flexSplitter.prototype, "button", void 0);
            __decorate([
                obs.property, 
                __metadata('design:type', svg)
            ], flexSplitter.prototype, "arrow", void 0);
            return flexSplitter;
        }(div));
        var svg = (function (_super) {
            __extends(svg, _super);
            function svg() {
                _super.call(this);
                this.view = document.createElement('svg');
            }
            __decorate([
                obs.property, 
                __metadata('design:type', HTMLElement)
            ], svg.prototype, "view", void 0);
            return svg;
        }(SyncElement));
        var SyncWindow = (function (_super) {
            __extends(SyncWindow, _super);
            function SyncWindow() {
                _super.apply(this, arguments);
                this.children = new ObservableArray();
            }
            Object.defineProperty(SyncWindow.prototype, "window", {
                get: function () {
                    return window;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SyncWindow.prototype, "document", {
                get: function () {
                    return window.document;
                },
                enumerable: true,
                configurable: true
            });
            return SyncWindow;
        }(SyncElement));
    }
})(BindableTest || (BindableTest = {}));
var ObservableTest;
(function (ObservableTest) {
    var enabled = false;
    if (enabled) {
        var Flower = (function () {
            function Flower() {
            }
            __decorate([
                obs.property, 
                __metadata('design:type', String)
            ], Flower.prototype, "Name", void 0);
            Flower = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], Flower);
            return Flower;
        }());
        var FlowerProduct_1 = (function () {
            function FlowerProduct_1() {
            }
            __decorate([
                obs.property, 
                __metadata('design:type', String)
            ], FlowerProduct_1.prototype, "Name", void 0);
            return FlowerProduct_1;
        }());
        var TargetArray = (function (_super) {
            __extends(TargetArray, _super);
            function TargetArray() {
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i - 0] = arguments[_i];
                }
                _super.call(this);
                this.moether = 'job seeker';
                Array.prototype.push.apply(this, items);
            }
            __decorate([
                obs.property, 
                __metadata('design:type', String)
            ], TargetArray.prototype, "moether", void 0);
            TargetArray = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [Object])
            ], TargetArray);
            return TargetArray;
        }(ObservableArray));
        var PopulationTest_1 = (function () {
            function PopulationTest_1(id) {
                this.id = id;
                this.flowers = new ObservableArray();
                this.products = new ObservableArray();
                this.view = [];
            }
            PopulationTest_1.prototype.flower2product = function (flower) {
                return obs.new(new FlowerProduct_1(), function (f) { return f.Name = flower.Name; });
            };
            __decorate([
                obs.default(function () { return ObservableArray.prototype.parent; }).property, 
                __metadata('design:type', ObservableArray)
            ], PopulationTest_1.prototype, "flowers", void 0);
            __decorate([
                obs.method, 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Flower]), 
                __metadata('design:returntype', void 0)
            ], PopulationTest_1.prototype, "flower2product", null);
            __decorate([
                obs.default(function () { return ObservableArray.prototype.parent; })
                    .observe(function () { return PopulationTest_1.prototype.flowers; }, function () { return PopulationTest_1.prototype.flower2product; })
                    .populate(function () { return PopulationTest_1.prototype.view; })
                    .property, 
                __metadata('design:type', ObservableArray)
            ], PopulationTest_1.prototype, "products", void 0);
            __decorate([
                obs.property, 
                __metadata('design:type', Array)
            ], PopulationTest_1.prototype, "view", void 0);
            PopulationTest_1 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [String])
            ], PopulationTest_1);
            return PopulationTest_1;
        }());
        var Test2 = (function (_super) {
            __extends(Test2, _super);
            function Test2() {
                _super.apply(this, arguments);
            }
            Test2 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], Test2);
            return Test2;
        }(PopulationTest_1));
        console.log('----------- Begin Observable Array Test ------------');
        var pt = new PopulationTest_1('instance 0');
        console.log(pt.flowers.asArray(), pt.products.asArray(), pt.view);
        pt.flowers.push(obs.new(new Flower(), function (f) { return f.Name = 'Rose'; }));
        console.log('after add one', pt.flowers.asArray(), pt.products.asArray(), pt.view);
        pt.flowers = new ObservableArray();
        //debug.logPropertyDecorators(pt.flowers);
        pt.products = new TargetArray();
        //debug.logPropertyDecorators(pt.products);
        console.log('after reset flowers', pt.flowers.asArray(), pt.products.asArray(), pt.view);
        pt.flowers.push(obs.new(new Flower(), function (f) { return f.Name = 'Rose'; }));
        console.log('after add again', pt.flowers.asArray(), pt.products.asArray(), pt.view);
        var t2 = new Test2('OK');
        //debug.logPropertyDecorators(t2);
        console.log('----------- End Observable Array Test ------------');
    }
})(ObservableTest || (ObservableTest = {}));
var PathChangeTest;
(function (PathChangeTest) {
    var enabled = false;
    if (enabled) {
        obs.bindable;
        var Bird = (function () {
            function Bird() {
            }
            __decorate([
                obs.property, 
                __metadata('design:type', String)
            ], Bird.prototype, "Name", void 0);
            return Bird;
        }());
        var Branch = (function () {
            function Branch() {
                this.birds = new ObservableArray();
            }
            __decorate([
                obs.property, 
                __metadata('design:type', ObservableArray)
            ], Branch.prototype, "birds", void 0);
            Branch = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], Branch);
            return Branch;
        }());
        var host_1 = (function () {
            function host_1() {
                this.catched = new ObservableArray();
            }
            __decorate([
                obs.property, 
                __metadata('design:type', Branch)
            ], host_1.prototype, "branch", void 0);
            __decorate([
                obs.default(function () { return ObservableArray.prototype.parent; }).observe(function () { return host_1.prototype.branch.birds; }).property, 
                __metadata('design:type', ObservableArray)
            ], host_1.prototype, "catched", void 0);
            host_1 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], host_1);
            return host_1;
        }());
        var h = new host_1();
        console.log('just initialized', h.branch ? h.branch.birds.asArray() : null, h.catched.asArray());
        h.branch = new Branch();
        console.log('after set branch', h.branch.birds.asArray(), h.catched.asArray());
        h.branch.birds.push(obs.new(new Bird(), function (b) { return b.Name = 'macaw'; }));
        console.log('after add macaw', h.branch.birds.asArray(), h.catched.asArray());
    }
})(PathChangeTest || (PathChangeTest = {}));
var ListenTest;
(function (ListenTest) {
    var enabled = false;
    if (enabled) {
        var joker = (function () {
            function joker() {
                var _this = this;
                this.invoke = function (x, y) {
                    if (_this.onmouse)
                        _this.onmouse(x, y);
                };
            }
            return joker;
        }());
        var host_2 = (function () {
            function host_2() {
            }
            host_2.prototype.whenJoke = function (x, y) {
                console.log('whenJoke:', x, y);
            };
            __decorate([
                obs.property, 
                __metadata('design:type', joker)
            ], host_2.prototype, "joke", void 0);
            __decorate([
                obs.listen(function () { return host_2.prototype.joke.onmouse; }).event, 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Number, Number]), 
                __metadata('design:returntype', void 0)
            ], host_2.prototype, "whenJoke", null);
            host_2 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], host_2);
            return host_2;
        }());
        var h_1 = new host_2();
        var j = new joker();
        console.log('j: ', j.invoke);
        h_1.joke = j;
        console.log('h.joke.invoke: ', h_1.joke);
        h_1.joke.invoke(10, 18);
        obs.block(h_1, function () { return host_2.prototype.whenJoke; }, function () {
            console.log('h.joke.invoke(20, 24) when blocking');
            h_1.joke.invoke(20, 24);
        });
        h_1.joke.invoke(32, 228);
    }
})(ListenTest || (ListenTest = {}));
var decoratorlist = [];
var inheritTest;
(function (inheritTest) {
    var enabled = false;
    if (enabled) {
        var base_1 = (function () {
            function base_1() {
                this.seed0 = new sender();
                this.method = function () {
                    console.log('--- base.method invoked ---');
                };
            }
            __decorate([
                obs.property, 
                __metadata('design:type', sender)
            ], base_1.prototype, "seed0", void 0);
            __decorate([
                obs.listen(function () { return base_1.prototype.seed0.tick; }).event, 
                __metadata('design:type', Object)
            ], base_1.prototype, "method", void 0);
            base_1 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], base_1);
            return base_1;
        }());
        var host_3 = (function (_super) {
            __extends(host_3, _super);
            function host_3() {
                _super.apply(this, arguments);
                this.seed1 = new sender();
                this.seed2 = new sender();
                this.method = function () {
                    console.log('--- host.method invoked ---');
                };
            }
            __decorate([
                obs.property, 
                __metadata('design:type', sender)
            ], host_3.prototype, "seed1", void 0);
            __decorate([
                obs.property, 
                __metadata('design:type', sender)
            ], host_3.prototype, "seed2", void 0);
            __decorate([
                obs.listen(function () { return host_3.prototype.seed1.tick; }, function () { return host_3.prototype.seed2.tick; }).event, 
                __metadata('design:type', Object)
            ], host_3.prototype, "method", void 0);
            host_3 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], host_3);
            return host_3;
        }(base_1));
        var sender = (function () {
            function sender() {
                this.tick = function () {
                };
            }
            __decorate([
                obs.event, 
                __metadata('design:type', Object)
            ], sender.prototype, "tick", void 0);
            sender = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], sender);
            return sender;
        }());
        var h = new host_3();
        console.log('h.seed0.tick()');
        h.seed0.tick();
        console.log('h.seed1.tick()');
        h.seed1.tick();
        console.log('h.seed2.tick()');
        h.seed2.tick();
    }
})(inheritTest || (inheritTest = {}));
var observeTest;
(function (observeTest) {
    var enabled = true;
    if (enabled) {
        var Host_1 = (function () {
            function Host_1() {
                this.listenOb = function () {
                };
            }
            __decorate([
                obs.observable(ObservableArray).default(function () { return ObservableArray.prototype.parent; }).observe(function () { return Host_1.prototype.views; }).property, 
                __metadata('design:type', ObservableArray)
            ], Host_1.prototype, "children", void 0);
            __decorate([
                obs.observable(ObservableArray).default(function () { return ObservableArray.prototype.parent; }).property, 
                __metadata('design:type', ObservableArray)
            ], Host_1.prototype, "views", void 0);
            __decorate([
                obs.listen(function () { return Host_1.prototype.children.onchange; }).event, 
                __metadata('design:type', Object)
            ], Host_1.prototype, "listenOb", void 0);
            Host_1 = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], Host_1);
            return Host_1;
        }());
        var Child = (function () {
            function Child() {
            }
            Child = __decorate([
                obs.bindable, 
                __metadata('design:paramtypes', [])
            ], Child);
            return Child;
        }());
        var h = new Host_1();
        console.log('begin set children.', h.views);
        h.children = new ObservableArray();
        console.log('end set children.');
    }
})(observeTest || (observeTest = {}));
//# sourceMappingURL=bindable.js.map