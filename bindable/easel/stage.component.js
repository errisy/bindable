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
var easel_1 = require('./easel');
var core_1 = require('@angular/core');
var bindable_1 = require('../bindable/bindable');
var ui_1 = require('../bindable/ui');
console.log('stage is loading...');
var Stage = (function () {
    function Stage(elementRef, changeDetectorRef) {
        this.elementRef = elementRef;
        this.changeDetectorRef = changeDetectorRef;
    }
    Stage.prototype.ngOnInit = function () {
        var _this = this;
        this.canvas = (this.elementRef.nativeElement);
        this.stage = new ui_1.UIStage(this.canvas);
        easel_1.createjs.Touch.enable(this.stage); //enable touch? how does it work?
        (this.canvas).stage = this.stage;
        this.stage.transformMatrix = new easel_1.createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        console.log('stage created.', this.stage);
        var mousedown = new easel_1.createjs.Text('Mousedown: ', '12 Arial', 'black');
        var mousemove = new easel_1.createjs.Text('Mousemove: ', '12 Arial', 'black');
        mousemove.y = 14;
        var mouseup = new easel_1.createjs.Text('Mouseup: ', '12 Arial', 'black');
        mouseup.y = 28;
        this.stage.addChild(mousedown);
        this.stage.addChild(mousemove);
        this.stage.addChild(mouseup);
        this.stage.on('mousedown', function (ev) {
            mousedown.text = 'Mousedown: ' + ev.stageX + ', ' + ev.stageY;
            _this.stage.update();
        });
        this.stage.on('stagemousemove', function (ev) {
            mousemove.text = 'Mousemove: ' + ev.stageX + ', ' + ev.stageY;
            _this.stage.update();
        });
        this.stage.on('stagemouseup', function (ev) {
            mouseup.text = 'Mouseup: ' + ev.stageX + ', ' + ev.stageY;
            _this.stage.update();
        });
        //EaselCanvasUtil.StageAllowsDrag(this.stage);
        //EaselCanvasUtil.CanVerticalScroll(this.stage, 1250);
        this.checkSizeChange();
    };
    //onResize(event: UIEvent) {
    //}
    Stage.prototype.ngAfterViewChecked = function () {
        //this.checkSizeChange();
    };
    Stage.prototype.onResize = function (ev) {
        this.checkSizeChange();
    };
    Stage.prototype.checkSizeChange = function () {
        var _this = this;
        //detect the size change here?
        var stageResize = this.stage;
        var shouldUpdate = false;
        if (this.canvas.height != this.canvas.clientHeight) {
            this.canvas.height = this.canvas.clientHeight;
            if (stageResize.onHeightChanged)
                stageResize.onHeightChanged(this.canvas.width, this.stage);
            shouldUpdate = true;
        }
        if (this.canvas.width != this.canvas.clientWidth) {
            this.canvas.width = this.canvas.clientWidth;
            if (stageResize.onWidthChanged)
                stageResize.onWidthChanged(this.canvas.height, this.stage);
            shouldUpdate = true;
        }
        //console.log('size changed: ', this.canvas.width, this.canvas.height);
        bindable_1.obs.block(this.stage, function () { return ui_1.UIStage.prototype.layout; }, function () {
            _this.stage.width = _this.canvas.width;
            _this.stage.height = _this.canvas.height;
        });
        if (shouldUpdate)
            this.stage.layout();
    };
    Stage.prototype.testDraw = function () {
    };
    __decorate([
        core_1.HostListener('window:resize', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Event]), 
        __metadata('design:returntype', void 0)
    ], Stage.prototype, "onResize", null);
    Stage = __decorate([
        core_1.Component({
            selector: '[ui-stage]',
            template: '' //,
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.ChangeDetectorRef])
    ], Stage);
    return Stage;
}());
exports.Stage = Stage;
//interface StageScope extends ng.IScope {
//    stage: createjs.Stage;
//    init: () => void;
//}
//interface StageDirectiveScope extends ng.IScope {
//    stage: string;
//    init: string;
//}
//class StageDirective extends ngstd.AngularDirective<StageDirectiveScope> {
//    constructor() {
//        super();
//        this.restrict = ngstd.DirectiveRestrict.E;
//        this.template = '<canvas></canvas>';//the canvas element must be embedded in a div element to get proper clientWidth/clientHeight for resizing pixel numbers.
//        this.scope.stage = ngstd.BindingRestrict.OptionalBoth;
//        this.scope.init = ngstd.BindingRestrict.OptionalBoth;
//        this.controller = StageController;
//    }
//}
var EaselShapeEvents = (function () {
    function EaselShapeEvents() {
    }
    EaselShapeEvents.added = 'added';
    EaselShapeEvents.click = 'click';
    EaselShapeEvents.dbclick = 'dbclick';
    EaselShapeEvents.mousedown = 'mousedown';
    EaselShapeEvents.mouseout = 'mouseout';
    EaselShapeEvents.mouseover = 'mouseover';
    EaselShapeEvents.pressmove = 'pressmove';
    EaselShapeEvents.pressup = 'pressup';
    EaselShapeEvents.removed = 'removed';
    EaselShapeEvents.rollout = 'rollout';
    EaselShapeEvents.rollover = 'rollover';
    EaselShapeEvents.tick = 'tick';
    return EaselShapeEvents;
}());
var EaselStageEvents = (function () {
    function EaselStageEvents() {
    }
    EaselStageEvents.stagemousedown = 'stagemousedown';
    EaselStageEvents.stagemousemove = 'stagemousemove';
    EaselStageEvents.stagemouseup = 'stagemouseup';
    return EaselStageEvents;
}());
var EaselMatrixUtil = (function () {
    function EaselMatrixUtil() {
    }
    EaselMatrixUtil.ZoomAt = function (matrix, center, rate, minRatio, maxRatio) {
        if (minRatio === void 0) { minRatio = 0.01; }
        if (maxRatio === void 0) { maxRatio = 10; }
        /* IMPORTANT
        transform system equation:
        renderX = ratio * mouseX + offsetX
        renderY = ratio * mouseY + offsetY
        */
        var newMatrix;
        var oldRatio = matrix.a;
        var newRatio = oldRatio * Math.pow(1.25, rate);
        if (newRatio > maxRatio)
            newRatio = maxRatio;
        if (newRatio < minRatio)
            newRatio = minRatio;
        var offsetX = center.x - newRatio * (center.x - matrix.tx) / oldRatio;
        var offsetY = center.y - newRatio * (center.y - matrix.ty) / oldRatio;
        return new easel_1.createjs.Matrix2D(newRatio, 0, 0, newRatio, offsetX, offsetY);
    };
    EaselMatrixUtil.VerticalScroll = function (matrix, offset) {
        return new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty + offset);
    };
    EaselMatrixUtil.HorizontalScroll = function (matrix, offset) {
        return new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + offset, matrix.ty);
    };
    EaselMatrixUtil.ApplyMouseOffset = function (matrix, mouseOffsetX, mouseOffsetY) {
        return new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + mouseOffsetX, matrix.ty + mouseOffsetY);
    };
    return EaselMatrixUtil;
}());
var EaselCanvasUtil = (function () {
    function EaselCanvasUtil() {
    }
    EaselCanvasUtil.DraggableObjectMouseDown = function (ev) {
        if (ev.nativeEvent.button == 0) {
            var obj = ev.currentTarget;
            var draggable = ev.currentTarget;
            var draggableStage = obj.stage;
            draggable.objectBeginX = obj.x;
            draggable.objectBeginY = obj.y;
            draggable.stageBeginX = ev.stageX;
            draggable.stageBeginY = ev.stageY;
            draggableStage.draggingObject = obj;
        }
    };
    EaselCanvasUtil.DraggableObjectMouseDownInContainer = function (container) {
        return function (ev) {
            if (ev.nativeEvent.button == 0) {
                var obj = ev.currentTarget;
                var draggable = ev.currentTarget;
                var draggableContainer = container;
                draggable.objectBeginX = obj.x;
                draggable.objectBeginY = obj.y;
                draggable.stageBeginX = ev.stageX;
                draggable.stageBeginY = ev.stageY;
                draggableContainer.draggingObject = obj;
            }
        };
    };
    //private static DraggableObjectTouchStartInContainer(container: createjs.Container): (ev: createjs.MouseEvent) => void {
    //    return (ev: createjs.Touch) => {
    //        if (ev.nativeEvent.button == 0) {
    //            var obj: createjs.DisplayObject = <createjs.DisplayObject>ev.currentTarget;
    //            var draggable: IDraggableObject = <IDraggableObject>ev.currentTarget;
    //            var draggableContainer: IDraggableContainer = <any>container;
    //            draggable.objectBeginX = obj.x;
    //            draggable.objectBeginY = obj.y;
    //            draggable.stageBeginX = ev.stageX;
    //            draggable.stageBeginY = ev.stageY;
    //            draggableContainer.draggingObject = obj;
    //        }
    //    }
    //}
    EaselCanvasUtil.DraggingStageMouseMove = function (ev) {
        var stage = ev.target;
        var draggableStage = ev.target;
        if (draggableStage.draggingObject) {
            var obj = draggableStage.draggingObject;
            var draggable = obj;
            obj.x = (ev.stageX - draggable.stageBeginX) / stage.transformMatrix.a + draggable.objectBeginX;
            obj.y = (ev.stageY - draggable.stageBeginY) / stage.transformMatrix.a + draggable.objectBeginY;
            stage.update();
        }
    };
    EaselCanvasUtil.DraggingStageMouseMoveInContainer = function (container) {
        return function (ev) {
            var stage = ev.target;
            var draggableContainer = container;
            if (draggableContainer.draggingObject) {
                var obj = draggableContainer.draggingObject;
                var draggable = obj;
                obj.x = (ev.stageX - draggable.stageBeginX) / container.transformMatrix.a + draggable.objectBeginX;
                obj.y = (ev.stageY - draggable.stageBeginY) / container.transformMatrix.a + draggable.objectBeginY;
                stage.update();
            }
        };
    };
    EaselCanvasUtil.DraggingStageMouseUp = function (ev) {
        var stage = ev.target;
        var draggableStage = ev.target;
        if (draggableStage.draggingObject) {
            var obj = draggableStage.draggingObject;
            var draggable = obj;
            obj.x = (ev.stageX - draggable.stageBeginX) / stage.transformMatrix.a + draggable.objectBeginX;
            obj.y = (ev.stageY - draggable.stageBeginY) / stage.transformMatrix.a + draggable.objectBeginY;
            draggableStage.draggingObject = null;
            stage.update();
        }
    };
    EaselCanvasUtil.DraggingStageMouseUpInContainer = function (container) {
        return function (ev) {
            var stage = ev.target;
            var draggableContainer = container;
            if (draggableContainer.draggingObject) {
                var obj = draggableContainer.draggingObject;
                var draggable = obj;
                obj.x = (ev.stageX - draggable.stageBeginX) / container.transformMatrix.a + draggable.objectBeginX;
                obj.y = (ev.stageY - draggable.stageBeginY) / container.transformMatrix.a + draggable.objectBeginY;
                draggableContainer.draggingObject = null;
                stage.update();
            }
        };
    };
    /**
     * Configure a stage to allow dragging of displayObject. This shall be used with 'CanDrag'.
     * @param stage
     */
    EaselCanvasUtil.StageAllowsDrag = function (stage) {
        stage.on(EaselStageEvents.stagemousemove, EaselCanvasUtil.DraggingStageMouseMove);
        stage.on(EaselStageEvents.stagemouseup, EaselCanvasUtil.DraggingStageMouseUp);
    };
    EaselCanvasUtil.ContainerAllowsDrag = function (container) {
        container.stage.on(EaselStageEvents.stagemousemove, EaselCanvasUtil.DraggingStageMouseMoveInContainer(container));
        container.stage.on(EaselStageEvents.stagemouseup, EaselCanvasUtil.DraggingStageMouseUpInContainer(container));
    };
    /**
     * Configure a displayObject to allow dragging. You must apply 'StageAllowsDrag' to enable support of this feature.
     * @param displayObject
     */
    EaselCanvasUtil.CanDrag = function (displayObject, container) {
        displayObject.on(EaselShapeEvents.mousedown, EaselCanvasUtil.DraggableObjectMouseDownInContainer(container));
    };
    /**
     * Configure a stage to allow zoom at mouse pointer and scroll. This will set the canvas size unlimited. It allows free zoom and scroll.
     * @param stage the stage to configure;
     * @param minScale the minimal scale that the stage can be zoomed to;
     * @param maxScale the maximal scale that the stage can be zoomed to;
     */
    EaselCanvasUtil.StageCanZoomAtMouseAndScroll = function (stage, minScale, maxScale) {
        if (minScale === void 0) { minScale = 0.01; }
        if (maxScale === void 0) { maxScale = 10; }
        stage.transformMatrix = new easel_1.createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var stageCanvas = (stage.canvas);
        stageCanvas.stage = stage;
        var Zoom = stage;
        Zoom.minScale = minScale;
        Zoom.maxScale = maxScale;
        (stage.canvas).addEventListener('mousewheel', EaselCanvasUtil.ZoomAndScroll, true);
    };
    EaselCanvasUtil.ContainerCanZoomAtMouseAndScroll = function (container, canvas, stage, minScale, maxScale) {
        if (minScale === void 0) { minScale = 0.01; }
        if (maxScale === void 0) { maxScale = 10; }
        container.transformMatrix = new easel_1.createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        //var stageCanvas: IStageCanvas = <any>(container.canvas);
        //stageCanvas.stage = container;
        var Zoom = container;
        Zoom.minScale = minScale;
        Zoom.maxScale = maxScale;
        canvas.addEventListener('mousewheel', EaselCanvasUtil.ZoomAndScrollContainer(container, stage), true);
    };
    EaselCanvasUtil.ZoomAndScroll = function (ev) {
        event.preventDefault();
        var stageCanvas = (ev.target);
        var stage = stageCanvas.stage;
        var zoom = stage;
        if (ev.ctrlKey) {
            stage.transformMatrix = EaselMatrixUtil.ZoomAt(stage.transformMatrix, new easel_1.createjs.Point(stage.mouseX, stage.mouseY), ev.wheelDelta / 120, zoom.minScale, zoom.maxScale);
            stage.update();
        }
        else {
            if (ev.shiftKey) {
                stage.transformMatrix = EaselMatrixUtil.HorizontalScroll(stage.transformMatrix, ev.wheelDelta / 2);
                stage.update();
            }
            else {
                stage.transformMatrix = EaselMatrixUtil.VerticalScroll(stage.transformMatrix, ev.wheelDelta / 2);
                stage.update();
            }
        }
    };
    EaselCanvasUtil.ZoomAndScrollContainer = function (container, stage) {
        return function (ev) {
            event.preventDefault();
            console.log('container zooming');
            var zoom = container;
            if (ev.ctrlKey) {
                container.transformMatrix = EaselMatrixUtil.ZoomAt(container.transformMatrix, new easel_1.createjs.Point(stage.mouseX, stage.mouseY), ev.wheelDelta / 120, zoom.minScale, zoom.maxScale);
                stage.update();
            }
            else {
                if (ev.shiftKey) {
                    container.transformMatrix = EaselMatrixUtil.HorizontalScroll(container.transformMatrix, ev.wheelDelta / 2);
                    stage.update();
                }
                else {
                    container.transformMatrix = EaselMatrixUtil.VerticalScroll(container.transformMatrix, ev.wheelDelta / 2);
                    stage.update();
                }
            }
        };
    };
    /**
     * Configure the stage to allow vertical scroll.
     * @param stage the stage to configure.
     * @param height the initial height for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the height;
     */
    EaselCanvasUtil.CanVerticalScroll = function (stage, height) {
        if (!stage.transformMatrix)
            stage.transformMatrix = new easel_1.createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var stageCanvas = (stage.canvas);
        stageCanvas.stage = stage;
        var scroll = stage;
        var stageResize = stage;
        scroll.getYOffset = function () { return stage.transformMatrix.ty; };
        scroll.setYOffset = function (y) {
            var matrix = stage.transformMatrix;
            if (y < ((stage.canvas).height - scroll.totalHeight))
                y = (stage.canvas).height - scroll.totalHeight;
            if (y > 0)
                y = 0;
            stage.transformMatrix = new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, y);
            stageResize.onHeightChanged = EaselCanvasUtil.HeightChanged;
        };
        scroll.totalHeight = height;
        (stage.canvas).addEventListener('mousewheel', EaselCanvasUtil.VerticalScroll, true);
    };
    EaselCanvasUtil.VerticalScroll = function (ev) {
        event.preventDefault();
        var stageCanvas = (ev.target);
        var scroll = (stageCanvas.stage);
        scroll.setYOffset(scroll.getYOffset() + ev.wheelDelta / 2);
        stageCanvas.stage.update();
    };
    EaselCanvasUtil.HeightChanged = function (newHeight, stage) {
        var scroll = stage;
        scroll.setYOffset(scroll.getYOffset());
        stage.update();
    };
    /**
     * Configure the stage to allow vertical scroll.
     * @param stage the stage to configure.
     * @param width the initial width for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the width;
     */
    EaselCanvasUtil.CanHorizontalScroll = function (stage, width) {
        if (!stage.transformMatrix)
            stage.transformMatrix = new easel_1.createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var stageCanvas = (stage.canvas);
        stageCanvas.stage = stage;
        var scroll = stage;
        var stageResize = stage;
        scroll.getXOffset = function () { return stage.transformMatrix.tx; };
        scroll.setXOffset = function (x) {
            var matrix = stage.transformMatrix;
            if (x < ((stage.canvas).width - scroll.totalWidth))
                x = (stage.canvas).width - scroll.totalWidth;
            if (x > 0)
                x = 0;
            stage.transformMatrix = new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, x, matrix.ty);
            stageResize.onWidthChanged = EaselCanvasUtil.WidthChanged;
        };
        scroll.totalWidth = width;
        (stage.canvas).addEventListener('mousewheel', EaselCanvasUtil.HorizontalScroll, true);
    };
    EaselCanvasUtil.HorizontalScroll = function (ev) {
        event.preventDefault();
        var stageCanvas = (ev.target);
        var scroll = (stageCanvas.stage);
        scroll.setXOffset(scroll.getXOffset() + ev.wheelDelta / 2);
        stageCanvas.stage.update();
    };
    EaselCanvasUtil.WidthChanged = function (newWidth, stage) {
        var scroll = stage;
        scroll.setXOffset(scroll.getXOffset());
        stage.update();
    };
    EaselCanvasUtil.Scroll = function (ev) {
        event.preventDefault();
        var stageCanvas = (ev.target);
        var scroll = (stageCanvas.stage);
        if (ev.shiftKey) {
            scroll.setXOffset(scroll.getXOffset() + ev.wheelDelta / 2);
            stageCanvas.stage.update();
        }
        else {
            scroll.setYOffset(scroll.getYOffset() + ev.wheelDelta / 2);
            stageCanvas.stage.update();
        }
    };
    /**
     * Configure the stage to allow both horizontal and vertical scroll.
     * @param stage the stage to configure.
     * @param width the initial width for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the width;
     * @param height the initial height for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the height;
     */
    EaselCanvasUtil.CanScroll = function (stage, width, height) {
        if (!stage.transformMatrix)
            stage.transformMatrix = new easel_1.createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var scroll = stage;
        var stageResize = stage;
        scroll.getXOffset = function () { return stage.transformMatrix.tx; };
        scroll.setXOffset = function (x) {
            var matrix = stage.transformMatrix;
            if (x < 0)
                x = 0;
            if (x > (scroll.totalWidth - (stage.canvas).width))
                x = scroll.totalWidth - (stage.canvas).width;
            stage.transformMatrix = new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, x, matrix.ty);
        };
        scroll.totalWidth = width;
        scroll.getYOffset = function () { return stage.transformMatrix.ty; };
        scroll.setYOffset = function (y) {
            var matrix = stage.transformMatrix;
            if (y < 0)
                y = 0;
            if (y > (scroll.totalHeight - (stage.canvas).height))
                y = scroll.totalHeight - (stage.canvas).height;
            stage.transformMatrix = new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, y);
        };
        scroll.totalHeight = height;
    };
    EaselCanvasUtil.BringToFront = function (ev) {
        if (ev.nativeEvent.button == 0) {
            var displayObject = ev.currentTarget;
            if (displayObject.stage) {
                var children = displayObject.stage.children;
                var index = children.indexOf(displayObject);
                if (index > -1 && index < children.length) {
                    children.splice(index, 1);
                    children.push(displayObject);
                    displayObject.stage.update();
                }
            }
        }
    };
    /**
     * Configure a displayObject to allow 'Bring to Front' on left mouse down.
     * @param displayObject the DisplayObject to configure.
     */
    EaselCanvasUtil.CanBringToFront = function (displayObject) {
        displayObject.on(EaselShapeEvents.mousedown, EaselCanvasUtil.BringToFront);
    };
    /**
     * Configure a stage to allow grabbing by mouse middle button;
     * @param stage the stage to configure.
     */
    EaselCanvasUtil.CanGrabStage = function (stage) {
        // to do 
        var canvas = stage.canvas;
        var stageCanvas = canvas;
        // let the canvas hold a reference of the stage
        if (!stageCanvas.stage)
            stageCanvas.stage = stage;
        // make sure the stage has a valid matrix;
        if (!stage.transformMatrix)
            stage.transformMatrix = new easel_1.createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        // add listener to process the mouse events;
        canvas.onmousedown = EaselCanvasUtil.CanvasBeginGrab;
        canvas.onmousemove = EaselCanvasUtil.CanvasOnGrab;
        canvas.onmouseup = EaselCanvasUtil.CanvasEndGrab;
    };
    EaselCanvasUtil.CanvasBeginGrab = function (ev) {
        if (ev.button == 1) {
            var stageCanvas = (ev.target);
            var stage = stageCanvas.stage;
            var grab = stage;
            grab.mouseBeginX = ev.x;
            grab.mouseBeginY = ev.y;
            grab.stageBeginX = stage.transformMatrix.tx;
            grab.stageBeginY = stage.transformMatrix.ty;
            grab.isGrabbing = true;
        }
    };
    EaselCanvasUtil.CanvasOnGrab = function (ev) {
        var stageCanvas = (ev.target);
        var stage = stageCanvas.stage;
        var grab = stage;
        if (ev.button == 1 && grab.isGrabbing) {
            var matrix = stage.transformMatrix;
            stage.transformMatrix = new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, grab.stageBeginX + ev.x - grab.mouseBeginX, grab.stageBeginY + ev.y - grab.mouseBeginY);
            stage.update();
        }
    };
    EaselCanvasUtil.CanvasEndGrab = function (ev) {
        var stageCanvas = (ev.target);
        var stage = stageCanvas.stage;
        var grab = stage;
        if (ev.button == 1 && grab.isGrabbing) {
            var matrix = stage.transformMatrix;
            stage.transformMatrix = new easel_1.createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, grab.stageBeginX + ev.x - grab.mouseBeginX, grab.stageBeginY + ev.y - grab.mouseBeginY);
            grab.isGrabbing = false;
            stage.update();
        }
    };
    EaselCanvasUtil.CanReceiveByStageMouseEvents = function (stage, handler) {
        stage.on('stagemousedown', handler.onStageMouseDown);
        stage.on('stagemousemove', handler.onStageMouseMove);
        stage.on('stagemouseup', handler.onStageMouseUp);
    };
    EaselCanvasUtil.CanGrabByStage = function (stage, container) {
        stage.on('stagemousedown', EaselCanvasUtil.BeginGrabByStage(stage, container));
    };
    EaselCanvasUtil.BeginGrabByStage = function (stage, container) {
        return function (ev) {
            var gStage = stage;
            gStage.grabbingContainer = container;
            var grab = container;
            grab.locationBeginX = container.x;
            grab.locationBeginY = container.y;
            grab.mouseBeginX = ev.stageX;
            grab.mouseBeginY = ev.stageY;
            //set up the grabbing event;
            stage.on('stagemousemove', EaselCanvasUtil.StageGrabMove(stage));
            stage.on('stagemouseup', EaselCanvasUtil.StageGrabUp(stage));
        };
    };
    EaselCanvasUtil.StageGrabMove = function (stage) {
        return function (ev) {
            var gStage = stage;
            if (gStage.grabbingContainer) {
                var grab = gStage.grabbingContainer;
                gStage.grabbingContainer.x = grab.locationBeginX + (ev.stageX - grab.mouseBeginX);
                gStage.grabbingContainer.y = grab.locationBeginY + (ev.stageY - grab.mouseBeginY);
            }
        };
    };
    EaselCanvasUtil.StageGrabUp = function (stage) {
        return function (ev) {
            var gStage = stage;
            if (gStage.grabbingContainer) {
                var grab = gStage.grabbingContainer;
                gStage.grabbingContainer.x = grab.locationBeginX + (ev.stageX - grab.mouseBeginX);
                gStage.grabbingContainer.y = grab.locationBeginY + (ev.stageY - grab.mouseBeginY);
                gStage.grabbingContainer = undefined;
            }
        };
    };
    return EaselCanvasUtil;
}());
exports.EaselCanvasUtil = EaselCanvasUtil;
var CanvasKeyEventDispatcher = (function () {
    function CanvasKeyEventDispatcher() {
    }
    return CanvasKeyEventDispatcher;
}());
/**
 * Setting up key event handlers for canvas elements;
 * CanvasKeyEventService is for the detecting key events, because originally, key events can't be fired in canvas element.
 * We must catch key events in document and fire to canvas manually. And be carefully that this may cause memory leaking as you need to remove the reference to the canvas element.
 * Make sure you call the Unregister before dispose a canvas element.
 */
var CanvasKeyEventService = (function () {
    function CanvasKeyEventService() {
    }
    /**
     * Register the canvas element to the KeyEvent Service.
     * @param canvas the canvas you want to register
     * @param keydown the keydown event handler
     * @param keyup the keyup event handler
     */
    CanvasKeyEventService.Register = function (canvas, keydown, keyup) {
        if (!CanvasKeyEventService.isRunning) {
            document.addEventListener('mousedown', CanvasKeyEventService.onDocumentMouseDown);
            document.addEventListener('keydown', CanvasKeyEventService.onDocumentKeyDown);
            document.addEventListener('keyup', CanvasKeyEventService.onDocumentKeyUp);
            CanvasKeyEventService.isRunning = true;
        }
        //check if it is registered before.
        var found = false;
        var indicesForRemoval = []; //We need to a way to detect disposed canvas elements.
        for (var i = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas) {
                if (dis.canvas == canvas) {
                    dis.keydown = keydown;
                    dis.keyup = keyup;
                    found = true;
                }
            }
            else {
                indicesForRemoval.push(i);
            }
        }
        //to remove, we must start from largest number;
        for (var i = indicesForRemoval.length - 1; i > -1; i--) {
            CanvasKeyEventService.dispatchers.splice(i, 1);
        }
        if (!found) {
            var dis = new CanvasKeyEventDispatcher();
            dis.canvas = canvas;
            dis.keydown = keydown;
            dis.keyup = keyup;
            CanvasKeyEventService.dispatchers.push(dis);
        }
    };
    CanvasKeyEventService.Unregister = function (canvas) {
        var found = false;
        var index;
        for (var i = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas == canvas) {
                found = true;
                index = i;
            }
        }
        if (found)
            CanvasKeyEventService.dispatchers = CanvasKeyEventService.dispatchers.splice(index, 1);
    };
    CanvasKeyEventService.onDocumentMouseDown = function (eMouse) {
        CanvasKeyEventService.lastDownTarget = eMouse.target;
    };
    CanvasKeyEventService.onDocumentKeyDown = function (eKey) {
        for (var i = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas == CanvasKeyEventService.lastDownTarget)
                if (dis.keydown)
                    dis.keydown(eKey);
        }
    };
    CanvasKeyEventService.onDocumentKeyUp = function (eKey) {
        for (var i = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas == CanvasKeyEventService.lastDownTarget)
                if (dis.keyup)
                    dis.keyup(eKey);
        }
    };
    CanvasKeyEventService.isRunning = false;
    CanvasKeyEventService.dispatchers = [];
    return CanvasKeyEventService;
}());
//# sourceMappingURL=stage.component.js.map