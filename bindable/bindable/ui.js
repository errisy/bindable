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
var easel_1 = require('../easel/easel');
var bindable_1 = require('./bindable');
var UIStage = (function (_super) {
    __extends(UIStage, _super);
    function UIStage(canvas) {
        var _this = this;
        _super.call(this, canvas);
        this.redraw = function () {
            _this.update();
        };
        this.contentChanged = function (source, key, dcs, newValue, oldValue) {
            if (oldValue && _this.contains(oldValue)) {
                _this.removeChild(oldValue);
            }
            if (newValue && !_this.contains(newValue)) {
                _this.addChild(newValue);
            }
        };
        this.layout = function () {
            bindable_1.obs.block(_this, function () { return UIStage.prototype.redraw; }, function () {
                _this.viewChildren.forEach(function (child) {
                    child.offsetX = 0;
                    child.offsetY = 0;
                    child.availableWidth = _this.width;
                    child.availableHeight = _this.height;
                    child.layout();
                });
            });
            _this.redraw();
        };
        this.onChildrenChanged = function () {
            _this.removeAllChildren();
            if (_this.viewChildren)
                easel_1.createjs.Stage.prototype.addChild.apply(_this, _this.viewChildren);
        };
        this.enableMouseOver(24);
    }
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], UIStage.prototype, "redraw", void 0);
    __decorate([
        bindable_1.obs.after(function () { return UIStage.prototype.contentChanged; }).property, 
        __metadata('design:type', easel_1.createjs.Container)
    ], UIStage.prototype, "content", void 0);
    __decorate([
        bindable_1.obs.after(function () { return UIStage.prototype.redraw; }).event, 
        __metadata('design:type', Object)
    ], UIStage.prototype, "contentChanged", void 0);
    __decorate([
        bindable_1.obs.after(function () { return UIStage.prototype.layout; }).property, 
        __metadata('design:type', Number)
    ], UIStage.prototype, "width", void 0);
    __decorate([
        bindable_1.obs.after(function () { return UIStage.prototype.layout; }).property, 
        __metadata('design:type', Number)
    ], UIStage.prototype, "height", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], UIStage.prototype, "layout", void 0);
    __decorate([
        bindable_1.obs.after(function () { return UIStage.prototype.onChildrenChanged; }).observable(bindable_1.ObservableArray).default(function () { return bindable_1.ObservableArray.prototype.parent; }).childDefault(function () { return visual.prototype.viewParent; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], UIStage.prototype, "viewChildren", void 0);
    __decorate([
        bindable_1.obs.listen(function () { return UIStage.prototype.viewChildren.onchange; }).after(function () { return UIStage.prototype.layout; }).event, 
        __metadata('design:type', Object)
    ], UIStage.prototype, "onChildrenChanged", void 0);
    UIStage = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [Object])
    ], UIStage);
    return UIStage;
}(easel_1.createjs.Stage));
exports.UIStage = UIStage;
var Button = (function (_super) {
    __extends(Button, _super);
    function Button() {
        var _this = this;
        _super.call(this);
        this.onMouseOver = function (ev) {
            //console.log('button on mouse over');
            _this.mouseStatus = 'hover';
        };
        this.onMouseOut = function (ev) {
            //console.log('button on mouse out');
            _this.mouseStatus = 'out';
        };
        this.onMouseDown = function (ev) {
            //console.log('button on mouse pressed');
            _this.mouseStatus = 'pressed';
        };
        this.onPressUp = function (ev) {
            //console.log('button on mouse hover');
            _this.mouseStatus = 'hover';
        };
        this.mouseStatus = 'out';
        this.buttonText = new easel_1.createjs.Text('button', '10pt Arial', 'black');
        this.buttonBackground = new easel_1.createjs.Shape();
        this.borderWidth = 1;
        this.spacing = 2;
        this.cornerRadius = { tl: 4, bl: 4, tr: 4, br: 4 };
        this.borderColor = 'black';
        this.borderHoverColor = 'brown';
        this.borderPressedColor = 'darkgreen';
        this.backgroundColor = 'white';
        this.backgroundHoverColor = 'yellow';
        this.backgroundPressedColor = 'purple';
        this.onDraw = function () {
            var g = _this.buttonBackground.graphics;
            g.clear();
            var bw = bindable_1.util.checkValidNumber(_this.borderWidth, 1);
            var sp = bindable_1.util.checkValidNumber(_this.spacing, 3);
            var w = _this.buttonText.getMeasuredWidth() + bw + bw + sp + sp;
            var h = _this.buttonText.getMeasuredHeight() + bw + bw + sp + sp;
            var sw = bindable_1.util.checkValidNumber(_this.borderWidth, 1);
            _this.buttonText.x = bw + sp;
            _this.buttonText.y = bw + sp;
            var tl = bindable_1.util.checkValidNumber(_this.cornerRadius.tl, 0);
            var bl = bindable_1.util.checkValidNumber(_this.cornerRadius.bl, 0);
            var tr = bindable_1.util.checkValidNumber(_this.cornerRadius.tr, 0);
            var br = bindable_1.util.checkValidNumber(_this.cornerRadius.br, 0);
            //console.log('onDraw', this.mouseStatus);
            g.setStrokeStyle(sw);
            switch (_this.mouseStatus) {
                default:
                case 'out':
                    //console.log('out', this.borderColor, this.backgroundColor);
                    g = g.beginStroke(_this.borderColor).beginFill(_this.backgroundColor);
                    break;
                case 'hover':
                    //console.log('hover', this.borderHoverColor, this.backgroundHoverColor);
                    g = g.beginStroke(_this.borderHoverColor).beginFill(_this.backgroundHoverColor);
                    break;
                case 'pressed':
                    //console.log('pressed', this.borderPressedColor, this.backgroundPressedColor);
                    g = g.beginStroke(_this.borderPressedColor).beginFill(_this.backgroundPressedColor);
                    break;
            }
            g.drawRoundRectComplex(0, 0, w, h, tl, tr, br, bl).endFill().endStroke();
            _this.buttonBackground.setBounds(0, 0, w, h);
            //console.log('buttonText getBounds:', this.buttonText.getBounds());
            //console.log('buttonBackground getBounds:', this.buttonBackground.getBounds());
        };
        this.on('mouseover', this.onMouseOver);
        this.on('mouseout', this.onMouseOut);
        this.on('mousedown', this.onMouseDown);
        this.on('pressup', this.onPressUp);
        this.addChild(this.buttonBackground, this.buttonText);
        this.buttonBackground.on('mouseover', this.onMouseOver);
    }
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], Button.prototype, "onMouseOver", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], Button.prototype, "onMouseOut", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], Button.prototype, "onMouseDown", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], Button.prototype, "onPressUp", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', Object)
    ], Button.prototype, "mouseStatus", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', easel_1.createjs.Text)
    ], Button.prototype, "buttonText", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', easel_1.createjs.Shape)
    ], Button.prototype, "buttonBackground", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return Button.prototype.buttonText.text; })
            .after(function () { return Button.prototype.onDraw; })
            .property, 
        __metadata('design:type', String)
    ], Button.prototype, "text", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return Button.prototype.buttonText.color; })
            .property, 
        __metadata('design:type', String)
    ], Button.prototype, "foreground", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return Button.prototype.buttonText.font; })
            .after(function () { return Button.prototype.onDraw; })
            .property, 
        __metadata('design:type', String)
    ], Button.prototype, "font", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', Number)
    ], Button.prototype, "borderWidth", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', Number)
    ], Button.prototype, "spacing", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', Object)
    ], Button.prototype, "cornerRadius", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', String)
    ], Button.prototype, "borderColor", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', String)
    ], Button.prototype, "borderHoverColor", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', String)
    ], Button.prototype, "borderPressedColor", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', String)
    ], Button.prototype, "backgroundColor", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', String)
    ], Button.prototype, "backgroundHoverColor", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.onDraw; }).property, 
        __metadata('design:type', String)
    ], Button.prototype, "backgroundPressedColor", void 0);
    __decorate([
        bindable_1.obs.after(function () { return Button.prototype.stage.redraw; }).event, 
        __metadata('design:type', Object)
    ], Button.prototype, "onDraw", void 0);
    Button = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], Button);
    return Button;
}(easel_1.createjs.Container));
exports.Button = Button;
var Grid = (function (_super) {
    __extends(Grid, _super);
    function Grid() {
        _super.apply(this, arguments);
        this.rows = new bindable_1.ObservableArray();
        this.columns = new bindable_1.ObservableArray();
        this.layout = function () {
        };
    }
    Grid.setGridRow = function (obj, index) {
        obj['@Grid.Row'] = index;
    };
    Grid.setGridColumn = function (obj, index) {
        obj['@Grid.Column'] = index;
    };
    __decorate([
        bindable_1.obs.default(function () { return bindable_1.ObservableArray.prototype.parent; }).childDefault(function () { return gridRow.prototype.hostArray; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], Grid.prototype, "rows", void 0);
    __decorate([
        bindable_1.obs.default(function () { return bindable_1.ObservableArray.prototype.parent; }).childDefault(function () { return gridColumn.prototype.hostArray; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], Grid.prototype, "columns", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], Grid.prototype, "layout", void 0);
    Grid = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], Grid);
    return Grid;
}(easel_1.createjs.Container));
exports.Grid = Grid;
var gridRow = (function () {
    function gridRow() {
    }
    __decorate([
        bindable_1.obs.after(function () { return gridRow.prototype.grid.layout; }).property, 
        __metadata('design:type', Number)
    ], gridRow.prototype, "height", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridRow.prototype.grid.layout; }).property, 
        __metadata('design:type', Number)
    ], gridRow.prototype, "minHeight", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridRow.prototype.grid.layout; }).property, 
        __metadata('design:type', Number)
    ], gridRow.prototype, "maxHeight", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridRow.prototype.grid.layout; }).property, 
        __metadata('design:type', Object)
    ], gridRow.prototype, "type", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridRow.prototype.grid.layout; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], gridRow.prototype, "hostArray", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return gridRow.prototype.hostArray.parent; }).property, 
        __metadata('design:type', Grid)
    ], gridRow.prototype, "grid", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], gridRow.prototype, "desiredHeight", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], gridRow.prototype, "actualHeight", void 0);
    gridRow = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], gridRow);
    return gridRow;
}());
exports.gridRow = gridRow;
var gridColumn = (function () {
    function gridColumn() {
    }
    __decorate([
        bindable_1.obs.after(function () { return gridColumn.prototype.grid.layout; }).property, 
        __metadata('design:type', Number)
    ], gridColumn.prototype, "width", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridColumn.prototype.grid.layout; }).property, 
        __metadata('design:type', Number)
    ], gridColumn.prototype, "minWidth", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridColumn.prototype.grid.layout; }).property, 
        __metadata('design:type', Number)
    ], gridColumn.prototype, "maxWidth", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridColumn.prototype.grid.layout; }).property, 
        __metadata('design:type', Object)
    ], gridColumn.prototype, "type", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gridColumn.prototype.grid.layout; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], gridColumn.prototype, "hostArray", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return gridColumn.prototype.hostArray.parent; }).property, 
        __metadata('design:type', Grid)
    ], gridColumn.prototype, "grid", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], gridColumn.prototype, "desiredWidth", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], gridColumn.prototype, "actualWidth", void 0);
    gridColumn = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], gridColumn);
    return gridColumn;
}());
exports.gridColumn = gridColumn;
var ofu = (function () {
    function ofu() {
    }
    ofu.applyLets = function (obj, lets) {
        for (var id in lets) {
            obj[id] = lets[id];
        }
    };
    ofu.applySets = function (obj, Sets) {
        Sets.forEach(function (s) { return s.setter(obj, s.values); });
    };
    return ofu;
}());
exports.ofu = ofu;
var frameworkDecorator = (function () {
    function frameworkDecorator() {
        var _this = this;
        this.binds = {};
        this.listens = {};
        this.befores = {};
        this.afters = {};
        this.sets = [];
        this.lets = {};
        this.new = function (builder) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.instanceBuilder = builder;
            _this.instanceArgs = args;
            return _this;
        };
        this.applyNew = function (builder, args) {
            _this.instanceBuilder = builder;
            _this.instanceArgs = args;
            return _this;
        };
        this.view = function (target, key, descriptor) {
            _this.type = 'view';
            ofs.setFrameworkDecorator(target, key, _this);
        };
        this.property = function (target, key, descriptor) {
            _this.type = 'property';
            ofs.setFrameworkDecorator(target, key, _this);
        };
        this.event = function (target, key, descriptor) {
            _this.type = 'event';
            ofs.setFrameworkDecorator(target, key, _this);
        };
        this.method = function (target, key, descriptor) {
            _this.type = 'method';
            ofs.setFrameworkDecorator(target, key, _this);
        };
        this.eventListens = [];
        this.memberAfters = [];
        this.memberBefores = [];
        this['@FrameworkService.FrameworkDecorator'] = true;
    }
    frameworkDecorator.prototype.bind = function (property, path, mode) {
        var key = bindable_1.obp.getPropertyName(bindable_1.obp.analyzePath(property)[0]);
        if (key && key.length > 0)
            this.binds[key] = { path: bindable_1.obp.analyzePath(path), mode: mode ? mode : bindable_1.PathBindingMode.bind };
        return this;
    };
    frameworkDecorator.prototype.listen = function (property, path) {
        var key = bindable_1.obp.getPropertyName(bindable_1.obp.analyzePath(property)[0]);
        if (key && key.length > 0) {
            if (!this.listens[key])
                this.listens[key] = [];
            this.listens[key].push(bindable_1.obp.analyzePath(path));
        }
        return this;
    };
    frameworkDecorator.prototype.after = function (property, path) {
        var key = bindable_1.obp.getPropertyName(bindable_1.obp.analyzePath(property)[0]);
        if (key && key.length > 0) {
            if (!this.afters[key])
                this.afters[key] = [];
            this.afters[key].push(bindable_1.obp.analyzePath(path));
        }
        return this;
    };
    frameworkDecorator.prototype.before = function (property, path) {
        var key = bindable_1.obp.getPropertyName(bindable_1.obp.analyzePath(property)[0]);
        if (key && key.length > 0) {
            if (!this.befores[key])
                this.befores[key] = [];
            this.befores[key].push(bindable_1.obp.analyzePath(path));
        }
        return this;
    };
    frameworkDecorator.prototype.let = function (property, value) {
        var key = bindable_1.obp.getPropertyName(bindable_1.obp.analyzePath(property)[0]);
        if (key && key.length > 0)
            this.lets[key] = value;
        return this;
    };
    frameworkDecorator.prototype.set = function (setter) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        this.sets.push({ setter: setter, values: values });
        return this;
    };
    frameworkDecorator.prototype.eventListen = function () {
        var _this = this;
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        paths.forEach(function (path) { return _this.eventListens.push(bindable_1.obp.analyzePath(path)); });
    };
    frameworkDecorator.prototype.memberAfter = function () {
        var _this = this;
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        paths.forEach(function (path) { return _this.memberAfters.push(bindable_1.obp.analyzePath(path)); });
    };
    frameworkDecorator.prototype.memberBefore = function () {
        var _this = this;
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        paths.forEach(function (path) { return _this.memberBefores.push(bindable_1.obp.analyzePath(path)); });
    };
    frameworkDecorator.prototype.propertyBind = function (path, mode) {
        this.propertyBindPath = bindable_1.obp.analyzePath(path);
        this.propertyBindMode = mode;
    };
    frameworkDecorator.prototype.getMemberDecorator = function (target, key) {
        var d = new bindable_1.memberDecorator();
        if (target)
            d.target = target;
        if (key)
            d.propertyKey = key;
        this.eventListens.forEach(function (p) { return d.listen(p); });
        this.memberBefores.forEach(function (p) { return d.before(p); });
        this.memberAfters.forEach(function (p) { return d.after(p); });
        d.bind(this.propertyBindPath, this.propertyBindMode);
        switch (this.type) {
            default:
            case 'view':
            case 'property':
                d.type = 'property';
                break;
            case 'method':
                d.type = 'method';
                break;
            case 'event':
                d.type = 'event';
                break;
        }
        return d;
    };
    frameworkDecorator.prototype.useTemplate = function (type) {
        return this;
    };
    frameworkDecorator.prototype.asEvent = function (value) {
        this.type = 'event';
        this.realValue = value;
        return this;
    };
    frameworkDecorator.prototype.asMethod = function (value) {
        this.type = 'method';
        this.realValue = value;
        return this;
    };
    frameworkDecorator.prototype.asProperty = function (value) {
        this.type = 'property';
        this.realValue = value;
        return this;
    };
    frameworkDecorator.prototype.asView = function (value) {
        this.type = 'view';
        this.realValue = value;
        return this;
    };
    frameworkDecorator.prototype.instance = function (value) {
        this.realValue = value;
        return this;
    };
    /**
     * combine new decorator to existing one;
     * @param decorator
     */
    frameworkDecorator.prototype.combine = function (decorator) {
        this.type = decorator.type;
        bindable_1.util.appendArrayDictionary(this.befores, decorator.befores);
        bindable_1.util.appendArrayDictionary(this.afters, decorator.afters);
        bindable_1.util.appendArrayDictionary(this.listens, decorator.listens);
        bindable_1.util.appendArray(this.sets, decorator.sets);
        bindable_1.util.appendDictionary(this.lets, decorator.lets);
        bindable_1.util.appendDictionary(this.binds, decorator.binds);
        bindable_1.util.appendArray(this.eventListens, decorator.eventListens);
        bindable_1.util.appendArray(this.memberAfters, decorator.memberAfters);
        bindable_1.util.appendArray(this.memberBefores, decorator.memberBefores);
        if (decorator.propertyBindPath && decorator.propertyBindPath.length > 0)
            this.propertyBindPath = decorator.propertyBindPath;
        if (decorator.instanceBuilder)
            this.instanceBuilder = decorator.instanceBuilder;
        return this;
    };
    frameworkDecorator.prototype.build = function (existing) {
        this.isBuilt = true;
        switch (this.type) {
            case 'view':
            case 'property':
                var view_1;
                if (this.realValue) {
                    view_1 = this.realValue;
                }
                else {
                    if (existing) {
                        view_1 = existing;
                    }
                    else {
                        if (this.instanceBuilder) {
                            view_1 = new (Function.prototype.bind.apply(this.instanceBuilder, this.instanceArgs));
                        }
                        else {
                            view_1 = {}; //use a plain object if nothing is defined;
                        }
                    }
                }
                ofu.applyLets(view_1, this.lets);
                ofu.applySets(view_1, this.sets);
                var newDecorators = [];
                //binds
                for (var key in this.binds) {
                    var d = bindable_1.obs.getDecorator(view_1, key);
                    if (d.instantiated) {
                        d.setBindingPath(this.binds[key].path, this.binds[key].mode);
                    }
                    else {
                        d.bind(this.binds[key].path, this.binds[key].mode);
                        if (newDecorators.indexOf(d) < 0)
                            newDecorators.push(d);
                    }
                }
                //listens
                var _loop_1 = function(key) {
                    var d = bindable_1.obs.getDecorator(view_1, key);
                    if (d.instantiated) {
                        this_1.listens[key].forEach(function (p) { return d.addListen(p); });
                    }
                    else {
                        this_1.listens[key].forEach(function (p) { return d.listen(p); });
                        if (newDecorators.indexOf(d) < 0)
                            newDecorators.push(d);
                    }
                };
                var this_1 = this;
                for (var key in this.listens) {
                    _loop_1(key);
                }
                //befores
                var _loop_2 = function(key) {
                    var d = bindable_1.obs.getDecorator(view_1, key);
                    if (d.instantiated) {
                        this_2.befores[key].forEach(function (p) { return d.befores.push({ target: view_1, path: p }); });
                    }
                    else {
                        this_2.befores[key].forEach(function (p) { return d.before(p); });
                        if (newDecorators.indexOf(d) < 0)
                            newDecorators.push(d);
                    }
                };
                var this_2 = this;
                for (var key in this.befores) {
                    _loop_2(key);
                }
                //afters
                var _loop_3 = function(key) {
                    var d = bindable_1.obs.getDecorator(view_1, key);
                    if (d.instantiated) {
                        this_3.afters[key].forEach(function (p) { return d.afters.push({ target: view_1, path: p }); });
                    }
                    else {
                        this_3.afters[key].forEach(function (p) { return d.after(p); });
                        if (newDecorators.indexOf(d) < 0)
                            newDecorators.push(d);
                    }
                };
                var this_3 = this;
                for (var key in this.afters) {
                    _loop_3(key);
                }
                newDecorators.forEach(function (d) { return d.instantiate(); });
                return view_1;
            case 'method':
            case 'event':
                return this.realValue;
        }
    };
    frameworkDecorator.appendArray = function (arr, items) {
        Array.prototype.push.apply(arr, items);
        return arr;
    };
    return frameworkDecorator;
}());
exports.frameworkDecorator = frameworkDecorator;
var viewDecorator = (function () {
    function viewDecorator() {
        var _this = this;
        this.useViewTemplate = function (templatePath, viewsPath, templateType) {
            _this.templatePath = bindable_1.obp.getPropertyName(bindable_1.obp.analyzePath(templatePath)[0]);
            _this.viewsPath = bindable_1.obp.getPropertyName(bindable_1.obp.analyzePath(viewsPath)[0]);
            _this.templateType = templateType;
            console.log('viewDecorator templatePath viewsPath: ', _this.templatePath, _this.viewsPath);
            return _this;
        };
        /**
         * this already has bindable, do not apply bindable again.
         * @param target
         */
        this.view = function (target) {
            console.log('viewDecorator: ', _this);
            var that = _this;
            var viewsPath = _this.viewsPath;
            var templatePath = _this.templatePath;
            var templateType = _this.templateType;
            var instanceFunction = function (instance, classPrototype) {
                //this only work after the latest constructor;
                if ((instance["@ObjectService.ConstructionStack"]).length > 1)
                    return instance;
                //to do: add views in the template into the views
                //console.log('that in instanceFunction: ', that);
                var views = instance[that.viewsPath];
                var tempInstance;
                if (that.templateType) {
                    tempInstance = ofs.build(that.templateType);
                    instance[that.templatePath] = tempInstance;
                }
                else {
                    if (instance[that.templatePath]) {
                        tempInstance = instance[that.templatePath];
                    }
                }
                var templatePropertyDecorator = bindable_1.obs.getDecorator(instance, that.templatePath);
                console.log('view instance: ', that.templatePath, instance[that.templatePath]);
                if (templatePropertyDecorator.type != 'property') {
                    bindable_1.obs.makeProperty(instance, that.templatePath);
                    instance[that.templatePath] = tempInstance;
                }
                var viewsPropertyDecorator = bindable_1.obs.getDecorator(instance, that.viewsPath);
                if (viewsPropertyDecorator.type != 'property') {
                    bindable_1.obs.makeProperty(instance, that.templatePath);
                }
                if (!viewsPropertyDecorator.instantiate)
                    viewsPropertyDecorator.instantiate;
                viewsPropertyDecorator.setDefault(function () { return bindable_1.ObservableArray.prototype.parent; });
                console.log(' before set observe: ', instance[that.templatePath]['views'], instance[_this.viewsPath]['parent']);
                viewsPropertyDecorator.setObserve(['.' + that.templatePath, '.views']);
                console.log(' >>>> before setting views:------------');
                //instance[that.viewsPath] = views;
                console.log(' >>>> after setting views:------------');
                {
                    var sd = bindable_1.obs.getDecorator(views, 'observationSource');
                    console.log('observationSource bindingPath: ', sd.bindingPath, views.parent);
                }
                return instance;
            };
            var od = new bindable_1.objectDecorator();
            return od.bindableBase(target, instanceFunction);
        };
    }
    return viewDecorator;
}());
exports.viewDecorator = viewDecorator;
var ofs = (function () {
    function ofs() {
    }
    ofs.new = function (builder) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (new frameworkDecorator()).applyNew(builder, args);
    };
    ofs.applyNew = function (builder, args) {
        return (new frameworkDecorator()).applyNew(builder, args);
    };
    ofs.bind = function (property, path) {
        return (new frameworkDecorator()).bind(property, path);
    };
    ofs.listen = function (property, path) {
        return (new frameworkDecorator()).listen(property, path);
    };
    ofs.after = function (property, path) {
        return (new frameworkDecorator()).after(property, path);
    };
    ofs.before = function (property, path) {
        return (new frameworkDecorator()).before(property, path);
    };
    ofs.eventListen = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        return frameworkDecorator.prototype.eventListen.apply((new frameworkDecorator()), paths);
    };
    ofs.memberAfter = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        return frameworkDecorator.prototype.memberAfter.apply((new frameworkDecorator()), paths);
    };
    ofs.memberBefore = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i - 0] = arguments[_i];
        }
        return frameworkDecorator.prototype.memberBefore.apply((new frameworkDecorator()), paths);
    };
    ofs.propertyBind = function (path, mode) {
        return (new frameworkDecorator()).propertyBind(path, mode);
    };
    ofs.useTemplate = function (type) {
        return (new frameworkDecorator()).useTemplate(type);
    };
    ofs.let = function (property, value) {
        return (new frameworkDecorator());
    };
    ofs.set = function (setter) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return (new frameworkDecorator()).set(setter, values);
    };
    Object.defineProperty(ofs, "view", {
        get: function () {
            return (new frameworkDecorator()).view;
        },
        enumerable: true,
        configurable: true
    });
    ofs.asEvent = function (value) {
        return (new frameworkDecorator()).asEvent(value);
    };
    ofs.asMethod = function (value) {
        return (new frameworkDecorator()).asMethod(value);
    };
    ofs.asProperty = function (value) {
        return (new frameworkDecorator()).asProperty(value);
    };
    ofs.asView = function (value) {
        return (new frameworkDecorator()).asView(value);
    };
    /**
     * specify a class as a template
     * @param target
     */
    ofs.template = function (target) {
        var instanceFunction = function (instance, classPrototype) {
            //nothing to do?
        };
        var od = new bindable_1.objectDecorator();
        od.bindableBase(target, instanceFunction);
    };
    ofs.useViewTemplate = function (templatePath, viewsPath, templateType) {
        return (new viewDecorator()).useViewTemplate(templatePath, viewsPath, templateType);
    };
    /**
     * convert a template class into a viewTemplate
     * @param temp
     */
    ofs.build = function (temp) {
        var instance = new temp();
        var defs = {};
        bindable_1.util.appendDictionary(defs, instance['@FrameworkService.TemplateDefinitions']);
        var newDecorators = [];
        //if definitions are not found then, this is using property
        //let items = temp;
        for (var key in instance) {
            var prop = instance[key];
            if (ofs.isFrameworkDecorator(prop)) {
                if (defs[key]) {
                    defs[key].combine(prop);
                }
                else {
                    defs[key] = prop;
                }
            }
        }
        var newDecs = [];
        var nd;
        for (var key in defs) {
            //to do create instance and set up operations
            var fieldFrameworkDecorator = defs[key];
            var instanceFieldDecorator = fieldFrameworkDecorator.getMemberDecorator(instance, key);
            if (instanceFieldDecorator.type != 'property') {
                instanceFieldDecorator = bindable_1.obs.makeProperty(instance, key);
            }
            if (!instanceFieldDecorator.instantiated)
                instanceFieldDecorator.instantiate();
            if (!fieldFrameworkDecorator.isBuilt) {
                //build them;
                var propertyInstance = fieldFrameworkDecorator.build(temp[key]);
                instance[key] = propertyInstance;
                console.log(' ### propertyInstance of key(' + key + ')', propertyInstance);
            }
            nd = undefined;
            if (nd = bindable_1.obs.applyDecorator(instance, key, instanceFieldDecorator))
                newDecs.push(nd);
        }
        //newDecs.forEach(d => d.instantiate());
        console.log(' #### rect of instance: ', instance['rect']);
        //collect the views from the instance and add them to ['@FrameworkService.Views']
        //['@FrameworkService.TemplateViews']
        var views = [];
        for (var key in defs) {
            var fd = defs[key];
            if (fd.type == 'view') {
                //let each of the view notice the viewChanged when they changed
                var d = bindable_1.obs.getDecorator(instance, key);
                d.after(function () { return template.prototype.viewChanged; });
            }
        }
        instance['@FrameworkService.TemplateDefinitions'] = defs;
        instance.viewChanged();
        return instance;
    };
    ofs.isFrameworkDecorator = function (value) {
        return value['@FrameworkService.FrameworkDecorator'];
    };
    ofs.setFrameworkDecorator = function (target, id, decorator) {
        var defs;
        if (!target['@FrameworkService.TemplateDefinitions'])
            target['@FrameworkService.TemplateDefinitions'] = {};
        defs = target['@FrameworkService.TemplateDefinitions'];
        if (defs[id]) {
            return defs[id].combine(decorator);
        }
        else {
            defs[id] = decorator;
            return decorator;
        }
    };
    return ofs;
}());
exports.ofs = ofs;
var visual = (function (_super) {
    __extends(visual, _super);
    function visual() {
        var _this = this;
        _super.apply(this, arguments);
        this.desiredWidth = Number.POSITIVE_INFINITY;
        this.desiredHeight = Number.POSITIVE_INFINITY;
        this.actualWidth = 0;
        this.actualHeight = 0;
        this.verticalAlignment = verticalAlignments.stretch;
        this.horizontalAlignment = horizontalAlignments.stretch;
        this.offsetX = 0;
        this.offsetY = 0;
        this.layout = function () {
            //needs reponse to available width and height
            _this.selfLayout(); //standard method
        };
        this.selfLayout = function () {
            switch (_this.verticalAlignment) {
                case verticalAlignments.center:
                    _this.actualHeight = _this.desiredHeight;
                    _this.y = _this.offsetY + (_this.availableHeight - _this.actualHeight) * 0.5;
                    break;
                case verticalAlignments.top:
                    _this.actualHeight = _this.desiredHeight;
                    _this.y = _this.offsetY;
                    break;
                case verticalAlignments.bottom:
                    _this.actualHeight = _this.desiredHeight;
                    _this.y = _this.offsetY + _this.availableHeight - _this.actualHeight;
                    break;
                case verticalAlignments.stretch:
                    _this.y = _this.offsetY;
                    _this.actualHeight = _this.availableHeight;
                    break;
            }
            switch (_this.horizontalAlignment) {
                case horizontalAlignments.center:
                    _this.actualWidth = _this.desiredWidth;
                    _this.x = _this.offsetX + (_this.availableWidth - _this.actualWidth) * 0.5;
                    break;
                case horizontalAlignments.left:
                    _this.actualWidth = _this.desiredWidth;
                    _this.x = _this.offsetX;
                    break;
                case horizontalAlignments.right:
                    _this.actualWidth = _this.desiredWidth;
                    _this.x = _this.offsetX + _this.availableWidth - _this.actualWidth;
                    break;
                case horizontalAlignments.stretch:
                    _this.actualWidth = _this.availableWidth;
                    _this.x = _this.offsetX;
                    break;
            }
        };
        this.redraw = function () {
            //console.log(' ############ visual redraw called...');
        };
    }
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "desiredWidth", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "desiredHeight", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "actualWidth", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "actualHeight", void 0);
    __decorate([
        bindable_1.obs.after(function () { return visual.prototype.layout; }).property, 
        __metadata('design:type', Number)
    ], visual.prototype, "verticalAlignment", void 0);
    __decorate([
        bindable_1.obs.after(function () { return visual.prototype.layout; }).property, 
        __metadata('design:type', Number)
    ], visual.prototype, "horizontalAlignment", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "availableWidth", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "availableHeight", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "offsetX", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Number)
    ], visual.prototype, "offsetY", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], visual.prototype, "layout", void 0);
    __decorate([
        bindable_1.obs.method, 
        __metadata('design:type', Object)
    ], visual.prototype, "selfLayout", void 0);
    __decorate([
        bindable_1.obs.after(function () { return visual.prototype.stage.update; }).event, 
        __metadata('design:type', Object)
    ], visual.prototype, "redraw", void 0);
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', visual)
    ], visual.prototype, "viewParent", void 0);
    __decorate([
        bindable_1.obs.bind(function () { return visual.prototype.viewParent.templateParent; }).property, 
        __metadata('design:type', template)
    ], visual.prototype, "templateParent", void 0);
    visual = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], visual);
    return visual;
}(easel_1.createjs.Container));
exports.visual = visual;
var frameworkElement = (function (_super) {
    __extends(frameworkElement, _super);
    function frameworkElement() {
        var _this = this;
        _super.call(this);
        this.onAdded = function () {
            console.log(' --------- frameworkElement is added to the UIStage');
        };
        this._count = 0;
        this.layout = function () {
            _this.desiredHeight = _this.viewChildren.map(function (child) { return child.desiredHeight; }).reduce(function (previous, current) { return Math.max(previous, current); }, 0);
            _this.desiredWidth = _this.viewChildren.map(function (child) { return child.desiredWidth; }).reduce(function (previous, current) { return Math.max(previous, current); }, 0);
            //this.desiredHeight = util.checkValidNumber(this.desiredHeight, util.checkValidNumber(this.height, this.availableHeight));
            //this.desiredWidth = util.checkValidNumber(this.desiredWidth, util.checkValidNumber(this.width, this.availableWidth));
            _this.desiredHeight = bindable_1.util.checkValidNumber(_this.height, _this.desiredHeight);
            _this.desiredWidth = bindable_1.util.checkValidNumber(_this.width, _this.desiredWidth);
            _this.desiredHeight = bindable_1.util.checkValidNumber(_this.desiredHeight, _this.availableHeight);
            _this.desiredWidth = bindable_1.util.checkValidNumber(_this.desiredWidth, _this.availableWidth);
            _this._count += 1;
            //console.log(this._count, 'frameworkElement layout...', this.desiredWidth, this.desiredHeight);
            //if (this._count > 20) return; 
            switch (_this.verticalAlignment) {
                case verticalAlignments.center:
                    _this.actualHeight = _this.desiredHeight;
                    _this.y = _this.offsetY + (_this.availableHeight - _this.actualHeight) * 0.5;
                    break;
                case verticalAlignments.top:
                    _this.actualHeight = _this.desiredHeight;
                    _this.y = _this.offsetY;
                    break;
                case verticalAlignments.bottom:
                    _this.actualHeight = _this.desiredHeight;
                    _this.y = _this.offsetY + _this.availableHeight - _this.actualHeight;
                    break;
                case verticalAlignments.stretch:
                    _this.y = _this.offsetY;
                    _this.actualHeight = _this.availableHeight;
                    break;
            }
            switch (_this.horizontalAlignment) {
                case horizontalAlignments.center:
                    _this.actualWidth = _this.desiredWidth;
                    _this.x = _this.offsetX + (_this.availableWidth - _this.actualWidth) * 0.5;
                    break;
                case horizontalAlignments.left:
                    _this.actualWidth = _this.desiredWidth;
                    _this.x = _this.offsetX;
                    break;
                case horizontalAlignments.right:
                    _this.actualWidth = _this.desiredWidth;
                    _this.x = _this.offsetX + _this.availableWidth - _this.actualWidth;
                    break;
                case horizontalAlignments.stretch:
                    _this.actualWidth = _this.availableWidth;
                    _this.x = _this.offsetX;
                    break;
            }
            _this.viewChildren.forEach(function (child) {
                if (child.layout) {
                    //console.log(this._count, 'frameworkElement Child layout...', child, this.actualWidth, this.actualHeight);
                    child.offsetX = 0;
                    child.offsetY = 0;
                    child.availableWidth = _this.actualWidth;
                    child.availableHeight = _this.actualHeight;
                    child.layout();
                }
            });
        };
        this.on('added', this.layout);
    }
    frameworkElement.prototype.onChildrenChange = function (ev) {
        //fill the views into the host;
        console.log('frameworkElement.onChildrenChange invoked', this.viewChildren.asArray());
        this.removeAllChildren();
        easel_1.createjs.Container.prototype.addChild.apply(this, this.viewChildren);
    };
    __decorate([
        bindable_1.obs.after(function () { return visual.prototype.layout; }).event, 
        __metadata('design:type', Object)
    ], frameworkElement.prototype, "onAdded", void 0);
    __decorate([
        bindable_1.obs.after(function () { return frameworkElement.prototype.layout; }).property, 
        __metadata('design:type', Number)
    ], frameworkElement.prototype, "width", void 0);
    __decorate([
        bindable_1.obs.after(function () { return frameworkElement.prototype.layout; }).property, 
        __metadata('design:type', Number)
    ], frameworkElement.prototype, "height", void 0);
    __decorate([
        bindable_1.obs.observable(bindable_1.ObservableArray).default(function () { return bindable_1.ObservableArray.prototype.parent; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], frameworkElement.prototype, "viewChildren", void 0);
    __decorate([
        bindable_1.obs.listen(function () { return frameworkElement.prototype.viewChildren.onchange; }).after(function () { return visual.prototype.layout; }).event, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], frameworkElement.prototype, "onChildrenChange", null);
    frameworkElement = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], frameworkElement);
    return frameworkElement;
}(visual));
exports.frameworkElement = frameworkElement;
var panel = (function (_super) {
    __extends(panel, _super);
    function panel() {
        _super.apply(this, arguments);
    }
    panel = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], panel);
    return panel;
}(frameworkElement));
exports.panel = panel;
(function (brushTypes) {
    brushTypes[brushTypes["solid"] = 0] = "solid";
    brushTypes[brushTypes["linear"] = 1] = "linear";
    brushTypes[brushTypes["radial"] = 2] = "radial";
    brushTypes[brushTypes["bitmap"] = 3] = "bitmap";
})(exports.brushTypes || (exports.brushTypes = {}));
var brushTypes = exports.brushTypes;
var brush = (function () {
    function brush() {
        var _this = this;
        this.gradientStops = new bindable_1.ObservableArray();
        this.type = brushTypes.solid; //solide default;
        this.x0 = 0;
        this.y0 = 0;
        this.x1 = 100;
        this.y1 = 100;
        this.r0 = 50;
        this.r1 = 100;
        this.changed = function () {
        };
        this.fill = function (g) {
            var len = _this.gradientStops.length;
            switch (_this.type) {
                case brushTypes.solid:
                    g.beginFill(_this.color);
                    break;
                case brushTypes.linear:
                    //console.log('linear fill: ', this.gradientStops.map((stop, index) => util.checkValidNumber(stop.ratio, index / len)));
                    g.beginLinearGradientFill(_this.gradientStops.map(function (stop) { return stop.color; }), _this.gradientStops.map(function (stop, index) { return bindable_1.util.checkValidNumber(stop.ratio, index / len); }), _this.x0, _this.y0, _this.x1, _this.y1);
                    break;
                case brushTypes.radial:
                    g.beginRadialGradientFill(_this.gradientStops.map(function (stop) { return stop.color; }), _this.gradientStops.map(function (stop, index) { return bindable_1.util.checkValidNumber(stop.ratio, index / len); }), _this.x0, _this.y0, _this.r0, _this.x1, _this.y1, _this.r1);
                    break;
                case brushTypes.bitmap:
                    break;
            }
        };
        this.stroke = function (g) {
            var len = _this.gradientStops.length;
            switch (_this.type) {
                case brushTypes.solid:
                    g.beginStroke(_this.color);
                    break;
                case brushTypes.linear:
                    g.beginLinearGradientStroke(_this.gradientStops.map(function (stop) { return stop.color; }), _this.gradientStops.map(function (stop, index) { return bindable_1.util.checkValidNumber(stop.ratio, index / len); }), _this.x0, _this.y0, _this.x1, _this.y1);
                    break;
                case brushTypes.radial:
                    g.beginRadialGradientStroke(_this.gradientStops.map(function (stop) { return stop.color; }), _this.gradientStops.map(function (stop, index) { return bindable_1.util.checkValidNumber(stop.ratio, index / len); }), _this.x0, _this.y0, _this.r0, _this.x1, _this.y1, _this.r1);
                    break;
                case brushTypes.bitmap:
                    break;
            }
        };
    }
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', String)
    ], brush.prototype, "color", void 0);
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).listenChildren(function () { return gradientStop.prototype.changed; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], brush.prototype, "gradientStops", void 0);
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], brush.prototype, "type", void 0);
    __decorate([
        //solide default;
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], brush.prototype, "x0", void 0);
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], brush.prototype, "y0", void 0);
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], brush.prototype, "x1", void 0);
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], brush.prototype, "y1", void 0);
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], brush.prototype, "r0", void 0);
    __decorate([
        bindable_1.obs.after(function () { return brush.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], brush.prototype, "r1", void 0);
    __decorate([
        bindable_1.obs.listen(function () { return brush.prototype.gradientStops.itemEvents.changed; }).event, 
        __metadata('design:type', Object)
    ], brush.prototype, "changed", void 0);
    brush = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], brush);
    return brush;
}());
exports.brush = brush;
var textBlock = (function (_super) {
    __extends(textBlock, _super);
    function textBlock() {
        var _this = this;
        _super.call(this);
        this._text = new easel_1.createjs.Text();
        this.redraw = function () {
            _this.desiredHeight = _this._text.getMeasuredHeight();
            _this.desiredWidth = _this._text.getMeasuredWidth();
            //this.actualHeight = this.desiredHeight;
            //this.actualWidth = this.desiredWidth;
        };
        this.addChild(this._text);
        this.horizontalAlignment = horizontalAlignments.center;
        this.verticalAlignment = verticalAlignments.center;
    }
    __decorate([
        bindable_1.obs.wrap(function () { return textBlock.prototype._text.text; })
            .after(function () { return visual.prototype.redraw; })
            .property, 
        __metadata('design:type', String)
    ], textBlock.prototype, "text", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return textBlock.prototype._text.color; })
            .after(function () { return visual.prototype.redraw; })
            .property, 
        __metadata('design:type', String)
    ], textBlock.prototype, "foreground", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return textBlock.prototype._text.font; })
            .after(function () { return visual.prototype.redraw; })
            .property, 
        __metadata('design:type', String)
    ], textBlock.prototype, "font", void 0);
    __decorate([
        bindable_1.obs.wrap(function () { return textBlock.prototype._text.lineWidth; })
            .after(function () { return visual.prototype.redraw; })
            .property, 
        __metadata('design:type', Number)
    ], textBlock.prototype, "lineWidth", void 0);
    __decorate([
        bindable_1.obs.after(function () { return textBlock.prototype.layout; }).event, 
        __metadata('design:type', Object)
    ], textBlock.prototype, "redraw", void 0);
    textBlock = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], textBlock);
    return textBlock;
}(visual));
exports.textBlock = textBlock;
var roundRect = (function (_super) {
    __extends(roundRect, _super);
    function roundRect() {
        var _this = this;
        _super.call(this);
        this._shape = new easel_1.createjs.Shape();
        this.width = 100;
        this.height = 100;
        this.tl = 4;
        this.tr = 4;
        this.bl = 4;
        this.br = 4;
        this.strokeWidth = 1;
        this.stroke = bindable_1.obs.new(new brush(), function (b) { return (b.color = 'black'); });
        this.fill = bindable_1.obs.new(new brush(), function (b) { return (b.color = 'red'); });
        this.redraw = function () {
            //console.log(' ############ overwrite redraw called...');
            var g = _this._shape.graphics;
            g.clear();
            g.setStrokeStyle(_this.strokeWidth);
            _this.stroke.stroke(g);
            _this.fill.fill(g);
            g.drawRoundRectComplex(0, 0, _this.width, _this.height, _this.tl, _this.tr, _this.br, _this.bl)
                .endFill().endStroke();
            _this.desiredHeight = _this.height;
            _this.desiredWidth = _this.width;
            _this.actualHeight = _this.height;
            _this.actualWidth = _this.width;
        };
        this._count = 0;
        this.layout = function () {
            _this._count += 1;
            //console.trace(this._count, 'roundRect layout...', this.availableWidth , this.availableHeight );
            //if (this._count > 20) return; 
            if (_this.height != _this.availableHeight)
                _this.height = _this.availableHeight;
            if (_this.width != _this.availableWidth)
                _this.width = _this.availableWidth;
        };
        //this.children = [];
        //console.log('roundRect init:', this, this.children);
        this.addChild(this._shape);
        this.desiredHeight = Number.POSITIVE_INFINITY;
        this.desiredWidth = Number.POSITIVE_INFINITY;
    }
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', Number)
    ], roundRect.prototype, "width", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', Number)
    ], roundRect.prototype, "height", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', Number)
    ], roundRect.prototype, "tl", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', Number)
    ], roundRect.prototype, "tr", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', Number)
    ], roundRect.prototype, "bl", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', Number)
    ], roundRect.prototype, "br", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', Number)
    ], roundRect.prototype, "strokeWidth", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', brush)
    ], roundRect.prototype, "stroke", void 0);
    __decorate([
        bindable_1.obs.after(function () { return roundRect.prototype.redraw; }).property, 
        __metadata('design:type', brush)
    ], roundRect.prototype, "fill", void 0);
    __decorate([
        bindable_1.obs.listen(function () { return roundRect.prototype.fill.changed; }, function () { return roundRect.prototype.stroke.changed; }).event, 
        __metadata('design:type', Object)
    ], roundRect.prototype, "redraw", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], roundRect.prototype, "layout", void 0);
    roundRect = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], roundRect);
    return roundRect;
}(visual));
exports.roundRect = roundRect;
var gradientStop = (function () {
    function gradientStop() {
        this.color = 'white';
        this.ratio = 0;
        this.changed = function () { };
    }
    __decorate([
        bindable_1.obs.after(function () { return gradientStop.prototype.changed; }).property, 
        __metadata('design:type', String)
    ], gradientStop.prototype, "color", void 0);
    __decorate([
        bindable_1.obs.after(function () { return gradientStop.prototype.changed; }).property, 
        __metadata('design:type', Number)
    ], gradientStop.prototype, "ratio", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], gradientStop.prototype, "changed", void 0);
    gradientStop = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], gradientStop);
    return gradientStop;
}());
exports.gradientStop = gradientStop;
var grid = (function (_super) {
    __extends(grid, _super);
    function grid() {
        var _this = this;
        _super.apply(this, arguments);
        this.rows = new bindable_1.ObservableArray();
        this.columns = new bindable_1.ObservableArray();
        this.layout = function () {
            //calculate rows and columns
            //need to find out auto rows and columns first, then they become fixed sizes;
            var rowUnitCount = 0;
            var occupiedHeight = 0;
            _this.rows.forEach(function (row, index) {
                switch (row.type) {
                    case 'auto':
                        row.desiredHeight = _this.viewChildren.filter(function (child) { return grid.getGridRow(child) == index; }).map(function (child) { return child.desiredHeight; }).reduce(function (previous, current) { return Math.max(previous, current); }, 0);
                        row.actualHeight = Math.min(Math.max(row.desiredHeight, row.minHeight), row.maxHeight);
                        occupiedHeight += row.actualHeight;
                        break;
                    case '*':
                        row.desiredHeight = _this.viewChildren.filter(function (child) { return grid.getGridRow(child) == index; }).map(function (child) { return child.desiredHeight; }).reduce(function (previous, current) { return Math.max(previous, current); }, 0);
                        rowUnitCount += row.height;
                        break;
                    case 'pixel':
                        row.desiredHeight = row.height;
                        row.actualHeight = row.height;
                        occupiedHeight += row.actualHeight;
                        break;
                }
            });
            _this.desiredHeight = _this.rows.map(function (row) { return row.desiredHeight; }).reduce(function (previous, current) { return previous + current; }, 0);
            _this.desiredWidth = _this.columns.map(function (column) { return column.desiredWidth; }).reduce(function (previous, current) { return previous + current; }, 0);
            _this.selfLayout();
            _this.rows.forEach(function (row, index) {
                if (row.type == '*') {
                    row.desiredHeight = (_this.availableHeight - occupiedHeight) / rowUnitCount * row.height;
                    row.actualHeight = Math.min(Math.max(row.desiredHeight, row.minHeight), row.maxHeight);
                    occupiedHeight += row.actualHeight;
                    rowUnitCount -= row.height;
                }
            });
            var columnUnitCount = 0;
            var occupiedWidth = 0;
            _this.columns.forEach(function (column, index) {
                switch (column.type) {
                    case 'auto':
                        column.desiredWidth = _this.viewChildren.filter(function (child) { return grid.getGridRow(child) == index; }).map(function (child) { return child.desiredWidth; }).reduce(function (previous, current) { return Math.max(previous, current); }, 0);
                        column.actualWidth = Math.min(Math.max(column.desiredWidth, column.minWidth), column.maxWidth);
                        occupiedWidth += column.actualWidth;
                        break;
                    case '*':
                        column.desiredWidth = _this.viewChildren.filter(function (child) { return grid.getGridRow(child) == index; }).map(function (child) { return child.desiredWidth; }).reduce(function (previous, current) { return Math.max(previous, current); }, 0);
                        columnUnitCount += column.width;
                        break;
                    case 'pixel':
                        column.desiredWidth = column.width;
                        column.actualWidth = column.width;
                        occupiedWidth += column.actualWidth;
                        break;
                }
            });
            _this.columns.forEach(function (column, index) {
                if (column.type == '*') {
                    column.desiredWidth = (_this.availableWidth - occupiedWidth) / rowUnitCount * column.width;
                    column.actualWidth = Math.min(Math.max(column.desiredWidth, column.minWidth), column.maxWidth);
                    occupiedWidth += column.actualWidth;
                    rowUnitCount -= column.width;
                }
            });
            //layout each of the children
            _this.viewChildren.forEach(function (child) {
                var rowIndex = bindable_1.util.checkValidNumber(grid.getGridRow(child), 0);
                var columnIndex = bindable_1.util.checkValidNumber(grid.getGridColumn(child), 0);
                var rowSpan = 1; // util.checkValidNumber(grid.getGridRowSpan(child), 1);
                var columnSpan = 1; //util.checkValidNumber(grid.getGridColumnSpan(child), 1);
                var t = 0;
                var b = 0;
                for (var i = 0; i < Math.min(_this.rows.length - 1, rowIndex + rowSpan - 1); i++) {
                    if (rowIndex > i)
                        t += _this.rows[i].actualHeight;
                    if (rowIndex + rowSpan > i)
                        b += _this.rows[i].actualHeight;
                }
                var l = 0;
                var r = 0;
                for (var i = 0; i < Math.min(_this.columns.length - 1, columnIndex + columnSpan - 1); i++) {
                    if (columnIndex > i)
                        l += _this.columns[i].actualWidth;
                    if (columnIndex + columnSpan > i)
                        r += _this.columns[i].actualWidth;
                }
                var h = b - t;
                var w = r - l;
                child.offsetY = l;
                child.offsetY = t;
                child.availableWidth = w;
                child.availableHeight = h;
                child.layout();
            });
        };
    }
    grid.setGridRow = function (obj, index) {
        obj['@Grid.Row'] = index;
    };
    grid.getGridRow = function (obj) {
        return obj['@Grid.Row'];
    };
    grid.setGridColumn = function (obj, index) {
        obj['@Grid.Column'] = index;
    };
    grid.getGridColumn = function (obj) {
        return obj['@Grid.Column'];
    };
    __decorate([
        bindable_1.obs.default(function () { return bindable_1.ObservableArray.prototype.parent; }).childDefault(function () { return gridRow.prototype.hostArray; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], grid.prototype, "rows", void 0);
    __decorate([
        bindable_1.obs.default(function () { return bindable_1.ObservableArray.prototype.parent; }).childDefault(function () { return gridColumn.prototype.hostArray; }).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], grid.prototype, "columns", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], grid.prototype, "layout", void 0);
    grid = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], grid);
    return grid;
}(panel));
exports.grid = grid;
(function (verticalAlignments) {
    verticalAlignments[verticalAlignments["center"] = 0] = "center";
    verticalAlignments[verticalAlignments["top"] = 1] = "top";
    verticalAlignments[verticalAlignments["bottom"] = 2] = "bottom";
    verticalAlignments[verticalAlignments["stretch"] = 3] = "stretch";
})(exports.verticalAlignments || (exports.verticalAlignments = {}));
var verticalAlignments = exports.verticalAlignments;
(function (horizontalAlignments) {
    horizontalAlignments[horizontalAlignments["center"] = 0] = "center";
    horizontalAlignments[horizontalAlignments["left"] = 1] = "left";
    horizontalAlignments[horizontalAlignments["right"] = 2] = "right";
    horizontalAlignments[horizontalAlignments["stretch"] = 3] = "stretch";
})(exports.horizontalAlignments || (exports.horizontalAlignments = {}));
var horizontalAlignments = exports.horizontalAlignments;
/**
 * base class for the template
 */
var template = (function () {
    function template() {
        var _this = this;
        this.viewChanged = function () {
            console.log(' *** this.views: ', _this.views.asArray());
            _this.views.clear();
            console.log(' *** this.views: ', _this.views.asArray());
            var defs = _this['@FrameworkService.TemplateDefinitions'];
            console.log(' *** All defs in template: ', bindable_1.util.reduceOf(defs, function (pre, key) { return pre ? (pre + ', ' + key) : key; }));
            for (var key in defs) {
                console.log(' *** key in defs: ', key.toString());
                var fd = defs[key];
                if (fd.type == 'view') {
                    var view = _this[key];
                    if (view)
                        _this.views.push(view);
                }
            }
            console.log(' *** this.views: ', _this.views.asArray());
        };
    }
    __decorate([
        bindable_1.obs.property, 
        __metadata('design:type', Object)
    ], template.prototype, "parentControl", void 0);
    __decorate([
        bindable_1.obs.observable(bindable_1.ObservableArray).property, 
        __metadata('design:type', bindable_1.ObservableArray)
    ], template.prototype, "views", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Object)
    ], template.prototype, "viewChanged", void 0);
    template = __decorate([
        bindable_1.obs.bindable, 
        __metadata('design:paramtypes', [])
    ], template);
    return template;
}());
exports.template = template;
var control = (function (_super) {
    __extends(control, _super);
    function control() {
        _super.apply(this, arguments);
    }
    control = __decorate([
        ofs.useViewTemplate(function () { return control.prototype.template; }, function () { return frameworkElement.prototype.viewChildren; }, (function (_super) {
            __extends(controlTemplate, _super);
            function controlTemplate() {
                _super.apply(this, arguments);
                this.rect = ofs
                    .new(roundRect)
                    .let(function () { return roundRect.prototype.fill; }, bindable_1.obs.new(new brush(), function (b) { return (b.color = '#bbf'); }))
                    .asView();
                this.Text = ofs
                    .new(textBlock)
                    .let(function () { return textBlock.prototype.text; }, 'I am here')
                    .let(function () { return textBlock.prototype.foreground; }, 'blue')
                    .let(function () { return textBlock.prototype.font; }, '15pt Arial')
                    .asView();
            }
            return controlTemplate;
        }(template))).view, 
        __metadata('design:paramtypes', [])
    ], control);
    return control;
}(frameworkElement));
exports.control = control;
var contentControl = (function (_super) {
    __extends(contentControl, _super);
    function contentControl() {
        _super.apply(this, arguments);
    }
    contentControl.prototype.contentChanged = function () {
    };
    __decorate([
        bindable_1.obs.after(function () { return contentControl.prototype.contentChanged; }).property, 
        __metadata('design:type', Object)
    ], contentControl.prototype, "content", void 0);
    __decorate([
        bindable_1.obs.event, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], contentControl.prototype, "contentChanged", null);
    return contentControl;
}(control));
exports.contentControl = contentControl;
var contentPresenter = (function (_super) {
    __extends(contentPresenter, _super);
    function contentPresenter() {
        _super.apply(this, arguments);
    }
    return contentPresenter;
}(panel));
exports.contentPresenter = contentPresenter;
var frameworkMethodDecorator = (function () {
    function frameworkMethodDecorator() {
    }
    return frameworkMethodDecorator;
}());
exports.frameworkMethodDecorator = frameworkMethodDecorator;
//module frameworkTest {
//    let c = new control();
//    let member = c.template['rect'];
//    console.log('control template built: ', c.viewChildren.asArray(), member, c.template.views.asArray());
//} 
//# sourceMappingURL=ui.js.map