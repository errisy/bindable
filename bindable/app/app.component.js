"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ace_component_1 = require('./ace.component');
var test_label_component_1 = require('./test-label.component');
var stage_component_1 = require('../easel/stage.component');
var easel_1 = require('../easel/easel');
var file_service_1 = require('../bindable/file.service');
var ui_1 = require('../bindable/ui');
var bindable_1 = require('../bindable/bindable');
var AppComponent = (function () {
    function AppComponent(elementRef, fileService, ngZone, changeDetectorRef, applicationRef) {
        var _this = this;
        this.fileService = fileService;
        this.ngZone = ngZone;
        this.changeDetectorRef = changeDetectorRef;
        this.applicationRef = applicationRef;
        this.count = 0;
        this.hideElement = false;
        //view controller;
        this.ProperyPanelHeight = '80px';
        //@HostListener('mousedown', ['$event'])
        //public viewMouseDown: (ev: MouseEvent) => void = (ev: MouseEvent) => {  this.mousevalue = 'move down default: ' + ev.clientX + ', ' + ev.clientY; };
        this.viewMouseMove = function (ev) { _this.mousevalue = 'move move default: ' + ev.clientX + ', ' + ev.clientY; };
        this.viewMouseUp = function (ev) { _this.mousevalue = 'move up default: ' + ev.clientX + ', ' + ev.clientY; };
        //@HostListener('touchstart', ['$event'])
        //public viewTouchStart: (ev: TouchEvent) => void = (ev: TouchEvent) => { ev.preventDefault(); this.testvalue = 'touch start default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
        this.viewTouchMove = function (ev) { _this.testvalue = 'touch move default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
        this.viewTouchEnd = function (ev) { _this.testvalue = 'touch end default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
        this.viewTouchCancel = function (ev) { _this.testvalue = 'touch cancel default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
        this.testvalue = 'test output';
        this.mousevalue = 'mouse value';
        console.log('this constructor:', this);
        this.elementRef = elementRef;
    }
    AppComponent.prototype.editorInitialized = function (eventArgs) {
        console.log('editorInitialized', eventArgs);
        //this.buttonClicked();
    };
    AppComponent.prototype.ngOnInit = function () {
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        //this.buttonClicked();
        //let obj = new createjs.Text('hello', 'Arial', 'blue');
        //obj.x = 20;
        //obj.y = obj.getMeasuredLineHeight();
        var button = new ui_1.Button();
        button.text = 'hello world!';
        button.font = '20pt Arial';
        button.foreground = 'red';
        button.backgroundColor = '#dd9';
        button.backgroundHoverColor = 'yellow';
        button.backgroundPressedColor = 'pink';
        button.x = 240;
        button.y = 200;
        button.spacing = 10;
        button.borderWidth = 3;
        console.log('values: ', button.backgroundColor, button.backgroundHoverColor, button.backgroundPressedColor);
        var rr = new ui_1.roundRect();
        var count = 0;
        var g75 = new ui_1.gradientStop();
        g75.color = 'yellow';
        g75.ratio = 0.75;
        //setInterval(() => {
        //    count += 1;
        //    //button.text = count.toString();
        //    //console.log(button.text);
        //    //rr.width = 80 + ((count * 2) % 120);
        //    g75.ratio = 0.2 + (count % 100) / 200;
        //    rr.strokeWidth = (count % 10) + 1;
        //    //console.log('g75:', g75.ratio);
        //}, 50);
        //g75.ratio = 0.6 + (85 % 100) / 500;
        rr.width = 120;
        rr.fill.gradientStops.push(bindable_1.obs.new(new ui_1.gradientStop(), function (g) { return (g.color = 'red', g.ratio = 0); }), bindable_1.obs.new(new ui_1.gradientStop(), function (g) { return (g.color = 'green', g.ratio = 0.25); }), bindable_1.obs.new(new ui_1.gradientStop(), function (g) { return (g.color = 'blue', g.ratio = 0.5); }), g75, bindable_1.obs.new(new ui_1.gradientStop(), function (g) { return (g.color = 'red', g.ratio = 1); }));
        rr.fill.y1 = 800;
        rr.fill.x1 = 1200;
        rr.fill.type = ui_1.brushTypes.linear;
        console.log('after add ', rr.children);
        console.log('redraw', rr.redraw, rr.width, rr.height, rr.tl, rr.tr);
        rr.redraw();
        var md = bindable_1.obs.getDecorator(rr, 'redraw', true);
        console.log('redraw Decorator', md);
        var cc = new ui_1.control();
        console.log('------ control children: ', cc.viewChildren.length, cc.children);
        cc.width = 120;
        cc.height = 240;
        cc.horizontalAlignment = ui_1.horizontalAlignments.center;
        cc.verticalAlignment = ui_1.verticalAlignments.bottom;
        console.log('------ add control to stage: ');
        //this.mainView.stage.addChild(cc);
        //this.mainView.stage.addChild(button);
        this.mainView.stage.viewChildren.push(rr, cc);
        //this.mainView.stage.addChild(obj);
        //this.mainView.stage.update();
        //EaselCanvasUtil.CanDrag(obj);
        //EaselCanvasUtil.StageAllowsDrag(this.mainView.stage);
        //EaselCanvasUtil.CanZoomAtMouseAndScroll(this.mainView.stage, 0.1, 10);
        //this.getGeneBankFile();
    };
    AppComponent.prototype.switch = function () {
        //this.hideElement = !this.hideElement;
        //console.log('swtich: ', this.hideElement);
        //this.mainView.stage.update();
    };
    AppComponent.prototype.getGeneBankFile = function () {
        var _this = this;
        this.fileService.GetFile('/plasmids/pKD46.gb').subscribe(function (value) {
            _this.displayGeneFile(value);
        });
        this.fileService.GetFile('/plasmids/pKD46L.gb').subscribe(function (value) {
            _this.displayGeneFile(value);
        });
    };
    AppComponent.prototype.displayGeneFile = function (genebankstring) {
        var project = new easel_1.createjs.Container();
        this.mainView.stage.addChild(project);
        stage_component_1.EaselCanvasUtil.ContainerAllowsDrag(project);
        stage_component_1.EaselCanvasUtil.ContainerCanZoomAtMouseAndScroll(project, this.mainView.canvas, this.mainView.stage, 0.1, 10);
        this.mainView.stage.update();
        console.log('genebank file loaded.');
    };
    AppComponent.prototype.swtichProperyPanel = function () {
        var height = Number(/(\d+)px/ig.exec(this.ProperyPanelHeight)[1]);
        if (height <= 12) {
            //should expand
            if (this.propertyPanelDisplayHeight < 24)
                this.propertyPanelDisplayHeight = 120;
            this.ProperyPanelHeight = this.propertyPanelDisplayHeight + 'px';
        }
        else {
            //should shrink to 12px;
            this.propertyPanelDisplayHeight = height;
            this.ProperyPanelHeight = '12px';
        }
    };
    AppComponent.prototype.beginResizeProperyPanel = function (clientY, isTouch) {
        var _this = this;
        var beginY = clientY;
        var height = Number(/(\d+)px/ig.exec(this.ProperyPanelHeight)[1]);
        var that = this;
        var onMove = function (currentY) {
            var dragHeight = height + (beginY - currentY);
            if (dragHeight > window.innerHeight - 180)
                dragHeight = window.innerHeight - 180;
            if (dragHeight <= 12) {
                dragHeight = 12;
            }
            that.ProperyPanelHeight = dragHeight + 'px';
            _this.testvalue = 'touch moving: ' + that.ProperyPanelHeight;
            _this.changeDetectorRef.detectChanges();
        };
        if (isTouch) {
            this.viewTouchMove = function (ev) { return onMove(ev.touches[0].clientY); };
            this.viewTouchEnd = function (ev) { return onMove(ev.touches[0].clientY); };
            window.ontouchend = function () {
                console.log('touch up fired');
                that.viewTouchMove = that.defaultTouchEventHandler;
                that.viewTouchEnd = that.defaultTouchEventHandler;
                window.ontouchend = undefined;
            };
        }
        else {
            this.viewMouseMove = function (ev) { return onMove(ev.clientY); };
            this.viewMouseUp = function (ev) { return onMove(ev.clientY); };
            window.onmouseup = function () {
                console.log('mouse up fired');
                that.viewMouseMove = that.defaultMouseEventHandler;
                that.viewMouseUp = that.defaultMouseEventHandler;
                window.onmouseup = undefined;
            };
            this.mousevalue = 'mouse down: ' + clientY;
        }
        this.testvalue = 'begin resize';
    };
    AppComponent.prototype.defaultMouseEventHandler = function (ev) {
    };
    AppComponent.prototype.defaultTouchEventHandler = function (ev) {
    };
    __decorate([
        core_1.ViewChild('editor'), 
        __metadata('design:type', ace_component_1.AceComponent)
    ], AppComponent.prototype, "editor", void 0);
    __decorate([
        core_1.ContentChildren(ace_component_1.AceComponent), 
        __metadata('design:type', core_1.QueryList)
    ], AppComponent.prototype, "children", void 0);
    __decorate([
        core_1.ViewChild('stage'), 
        __metadata('design:type', stage_component_1.Stage)
    ], AppComponent.prototype, "mainView", void 0);
    __decorate([
        core_1.HostListener('mousemove', ['$event']), 
        __metadata('design:type', Function)
    ], AppComponent.prototype, "viewMouseMove", void 0);
    __decorate([
        core_1.HostListener('mouseup', ['$event']), 
        __metadata('design:type', Function)
    ], AppComponent.prototype, "viewMouseUp", void 0);
    __decorate([
        core_1.HostListener('touchmove', ['$event']), 
        __metadata('design:type', Function)
    ], AppComponent.prototype, "viewTouchMove", void 0);
    __decorate([
        core_1.HostListener('touchend', ['$event']), 
        __metadata('design:type', Function)
    ], AppComponent.prototype, "viewTouchEnd", void 0);
    __decorate([
        core_1.HostListener('touchcancel', ['$event']), 
        __metadata('design:type', Function)
    ], AppComponent.prototype, "viewTouchCancel", void 0);
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: '/app/app.component.html',
            directives: [ace_component_1.AceComponent, test_label_component_1.TestLabelComponent, stage_component_1.Stage],
            providers: [file_service_1.FileService],
            changeDetection: core_1.ChangeDetectionStrategy.CheckAlways
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, file_service_1.FileService, core_1.NgZone, core_1.ChangeDetectorRef, core_1.ApplicationRef])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map