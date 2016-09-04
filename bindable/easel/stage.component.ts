import {createjs} from './easel';
import {JQuery} from 'jquery';
import {Component, ElementRef, ChangeDetectorRef, HostListener, OnInit, AfterViewChecked, DoCheck} from '@angular/core';
import {obs} from '../bindable/bindable';
import {UIStage} from '../bindable/ui';

console.log('stage is loading...');

@Component({
    selector: '[ui-stage]',
    template: ''//,
    //template: '<canvas (window:resize)="onResize($event)"></canvas>',
    //styles: ['canvas {flex-grow:1; flex-shrink: 1; }']
})
export class Stage implements AfterViewChecked, OnInit {
    constructor(private elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef) {
    }
    //public element: HTMLElement;
    public canvas: HTMLCanvasElement;
    public stage: UIStage;
    ngOnInit() {
        this.canvas = <HTMLCanvasElement>(this.elementRef.nativeElement);
        
        this.stage = new UIStage(this.canvas);
        createjs.Touch.enable(this.stage); //enable touch? how does it work?

        (<IStageCanvas><any>(this.canvas)).stage = this.stage;
        this.stage.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        
        console.log('stage created.', this.stage);

        let mousedown = new createjs.Text('Mousedown: ', '12 Arial', 'black');
        let mousemove = new createjs.Text('Mousemove: ', '12 Arial', 'black');
        mousemove.y = 14;
        let mouseup = new createjs.Text('Mouseup: ', '12 Arial', 'black');
        mouseup.y = 28;
        this.stage.addChild(mousedown);
        this.stage.addChild(mousemove);
        this.stage.addChild(mouseup);
        this.stage.on('mousedown', (ev: createjs.MouseEvent) => {
            mousedown.text = 'Mousedown: ' + ev.stageX + ', ' + ev.stageY;
            this.stage.update();
        });
        this.stage.on('stagemousemove', (ev: createjs.MouseEvent) => {
            mousemove.text = 'Mousemove: ' + ev.stageX + ', ' + ev.stageY;
            this.stage.update();
        });
        this.stage.on('stagemouseup', (ev: createjs.MouseEvent) => {
            mouseup.text = 'Mouseup: ' + ev.stageX + ', ' + ev.stageY;
            this.stage.update();
        });
        //EaselCanvasUtil.StageAllowsDrag(this.stage);
        //EaselCanvasUtil.CanVerticalScroll(this.stage, 1250);
        this.checkSizeChange();
    }
    //onResize(event: UIEvent) {
    //}
    ngAfterViewChecked() {
        //this.checkSizeChange();
    }
    @HostListener('window:resize', ['$event'])
    onResize(ev: Event) {
        this.checkSizeChange();
    }
    private checkSizeChange() {
        //detect the size change here?
        let stageResize: IStageResize = <any>this.stage;
        let shouldUpdate: boolean = false;
        if (this.canvas.height != this.canvas.clientHeight) {
            this.canvas.height = this.canvas.clientHeight;
            if (stageResize.onHeightChanged) stageResize.onHeightChanged(this.canvas.width, this.stage);
            shouldUpdate = true;
        }
        if (this.canvas.width != this.canvas.clientWidth) {
            this.canvas.width = this.canvas.clientWidth;
            if (stageResize.onWidthChanged) stageResize.onWidthChanged(this.canvas.height, this.stage);
            shouldUpdate = true;
        }
        //console.log('size changed: ', this.canvas.width, this.canvas.height);

        obs.block(this.stage, () => UIStage.prototype.layout, () => {
            this.stage.width = this.canvas.width;
            this.stage.height = this.canvas.height;
        });
        
        if (shouldUpdate) this.stage.layout();
    }


    public testDraw() {
        
    }

}

//export class StageController {
//    $inject = ['$element', '$scope'];

//    //public circle: createjs.Shape;
//    public stage: createjs.Stage;
//    public canvas: HTMLCanvasElement;

//    constructor(public $element: JQuery, public $scope: StageScope) {

//        var canvas = $element.children('canvas');

//        this.canvas = <HTMLCanvasElement>canvas[0];

//        this.stage = new createjs.Stage(this.canvas);
//        this.stage.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);

//        EaselCanvasUtil.StageAllowsDrag(this.stage);
//        EaselCanvasUtil.CanVerticalScroll(this.stage, 1250);

//        //this.stage.addChild(this.circle);
//        //this.stage.update();

//        var isVisible: boolean = true;

//        //set up method for the stage
//        var selectabele: ISelectableView = <any>(this.stage);
//        selectabele.select = () => {
//            isVisible = true;
//        };
//        selectabele.deselect = () => {
//            isVisible = false;
//        };

//        CanvasKeyEventService.Register(this.canvas, this.onKeyDown, this.onKeyUp);
//        var stageResize: IStageResize = <any>this.stage;
//        //Parent must be set overflow:hidden to avoid automatic fitting to children size changes.
//        $scope.$watch(() => $element.parent().width(), (newValue: number, oldValue: number) => {
//            console.log(isVisible);
//            if (!isVisible) return;
//            this.canvas.width = newValue; // - ($element.parent().outerWidth() - $element.parent().innerWidth() + 1);
//            if (stageResize.onWidthChanged) stageResize.onWidthChanged(newValue, this.stage);
//            console.log('canvas changing width: ' + newValue);
//            this.stage.update();
//        });
//        $scope.$watch(() => $element.parent().height(), (newValue: number, oldValue: number) => {
//            console.log(isVisible);
//            if (!isVisible) return;
//            this.canvas.height = newValue; // - ($element.parent().outerHeight() - $element.parent().innerHeight()+1);
//            if (stageResize.onHeightChanged) stageResize.onHeightChanged(newValue, this.stage);
//            console.log('canvas changing height: ' + newValue);
//            this.stage.update();
//        });
//        $scope.$on("$destroy", () => {
//            $scope.stage = null; // use binding to disengage the stage reference. No sure if this will avoid memory leaking.
//        });
//        $scope.$watch(() => $scope.init, (newValue, oldValue) => {
//            if (newValue) newValue();
//        });
//        //$scope.$apply(() => );
//        $scope.stage = this.stage;

//        //console.log($scope.init);
//        if ($scope.init) {
//            $scope.init();
//        }
//    }
//    private isVisible: boolean = true;


//    public onKeyDown = (eKey: KeyboardEvent): void => {
//        switch (eKey.keyCode) {
//            case 32:
//                break;
//        }
//        eKey.preventDefault();
//    }
//    public onKeyUp = (eKey: KeyboardEvent): void => {
//        switch (eKey.keyCode) {
//            case 32:
//                break;
//        }
//        eKey.preventDefault();
//    }
//}

export interface IStageResize /**extends ng.IScope**/ {
    onWidthChanged: (width: number, stage: createjs.Stage) => void;
    onHeightChanged: (height: number, stage: createjs.Stage) => void;
}

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

class EaselShapeEvents {
    static added: string = 'added';
    static click: string = 'click';
    static dbclick: string = 'dbclick';
    static mousedown: string = 'mousedown';
    static mouseout: string = 'mouseout';
    static mouseover: string = 'mouseover';
    static pressmove: string = 'pressmove';
    static pressup: string = 'pressup';
    static removed: string = 'removed';
    static rollout: string = 'rollout';
    static rollover: string = 'rollover';
    static tick: string = 'tick';
}
class EaselStageEvents {
    static stagemousedown: string = 'stagemousedown';
    static stagemousemove: string = 'stagemousemove';
    static stagemouseup: string = 'stagemouseup';
}

class EaselMatrixUtil {
    static ZoomAt(matrix: createjs.Matrix2D, center: createjs.Point, rate: number, minRatio: number = 0.01, maxRatio: number = 10): createjs.Matrix2D {
        /* IMPORTANT
        transform system equation:
        renderX = ratio * mouseX + offsetX
        renderY = ratio * mouseY + offsetY
        */
        var newMatrix: createjs.Matrix2D;
        var oldRatio = matrix.a;
        var newRatio = oldRatio * Math.pow(1.25, rate);
        if (newRatio > maxRatio) newRatio = maxRatio;
        if (newRatio < minRatio) newRatio = minRatio;
        var offsetX = center.x - newRatio * (center.x - matrix.tx) / oldRatio;
        var offsetY = center.y - newRatio * (center.y - matrix.ty) / oldRatio;
        return new createjs.Matrix2D(newRatio, 0, 0, newRatio, offsetX, offsetY);
    }
    static VerticalScroll(matrix: createjs.Matrix2D, offset: number): createjs.Matrix2D {
        return new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty + offset);
    }
    static HorizontalScroll(matrix: createjs.Matrix2D, offset: number): createjs.Matrix2D {
        return new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + offset, matrix.ty);
    }
    static ApplyMouseOffset(matrix: createjs.Matrix2D, mouseOffsetX: number, mouseOffsetY: number): createjs.Matrix2D {
        return new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + mouseOffsetX, matrix.ty + mouseOffsetY);
    }
}

interface IDraggableObject {
    objectBeginX: number;
    objectBeginY: number;
    stageBeginX: number;
    stageBeginY: number;
}
interface IDraggableContainer {
    draggingObject: createjs.DisplayObject;
}
interface IStageCanvas {
    stage: createjs.Stage;
}
interface IScroll {
    totalWidth: number;
    totalHeight: number;
    getXOffset: () => number;
    getYOffset: () => number;
    setXOffset: (x: number) => void;
    setYOffset: (y: number) => void;
}
interface IGrabbableStage {
    stageBeginX: number;
    stageBeginY: number;
    mouseBeginX: number;
    mouseBeginY: number;
    isGrabbing: boolean;
}
interface IZoom {
    minScale: number;
    maxScale: number;
}
export class EaselCanvasUtil {
    private static DraggableObjectMouseDown(ev: createjs.MouseEvent) {
        if (ev.nativeEvent.button == 0) {
            var obj: createjs.DisplayObject = <createjs.DisplayObject>ev.currentTarget;
            var draggable: IDraggableObject = <IDraggableObject>ev.currentTarget;
            var draggableStage: IDraggableContainer = <any>obj.stage;
            draggable.objectBeginX = obj.x;
            draggable.objectBeginY = obj.y;
            draggable.stageBeginX = ev.stageX;
            draggable.stageBeginY = ev.stageY;
            draggableStage.draggingObject = obj;
        }
    }
    private static DraggableObjectMouseDownInContainer(container: createjs.Container): (ev: createjs.MouseEvent)=>void {
        return (ev: createjs.MouseEvent) => {
            if (ev.nativeEvent.button == 0) {
                var obj: createjs.DisplayObject = <createjs.DisplayObject>ev.currentTarget;
                var draggable: IDraggableObject = <IDraggableObject>ev.currentTarget;
                var draggableContainer: IDraggableContainer = <any>container;
                draggable.objectBeginX = obj.x;
                draggable.objectBeginY = obj.y;
                draggable.stageBeginX = ev.stageX;
                draggable.stageBeginY = ev.stageY;
                draggableContainer.draggingObject = obj;
            }
        }
    }
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
    private static DraggingStageMouseMove(ev: createjs.MouseEvent) {
        var stage: createjs.Stage = ev.target;
        var draggableStage: IDraggableContainer = <any>ev.target;
        if (draggableStage.draggingObject) {
            var obj: createjs.DisplayObject = draggableStage.draggingObject;
            var draggable: IDraggableObject = <any>obj;
            obj.x = (ev.stageX - draggable.stageBeginX) / stage.transformMatrix.a + draggable.objectBeginX;
            obj.y = (ev.stageY - draggable.stageBeginY) / stage.transformMatrix.a + draggable.objectBeginY;
            stage.update();
        }
    }
    private static DraggingStageMouseMoveInContainer(container: createjs.Container): (ev: createjs.MouseEvent) => void {
        return (ev: createjs.MouseEvent) => {
            var stage: createjs.Stage = ev.target;
            var draggableContainer: IDraggableContainer = <any>container;
            if (draggableContainer.draggingObject) {
                var obj: createjs.DisplayObject = draggableContainer.draggingObject;
                var draggable: IDraggableObject = <any>obj;
                obj.x = (ev.stageX - draggable.stageBeginX) / container.transformMatrix.a + draggable.objectBeginX;
                obj.y = (ev.stageY - draggable.stageBeginY) / container.transformMatrix.a + draggable.objectBeginY;
                stage.update();
            }
        }
    }
    private static DraggingStageMouseUp(ev: createjs.MouseEvent) {
        var stage: createjs.Stage = ev.target;
        var draggableStage: IDraggableContainer = <any>ev.target;
        if (draggableStage.draggingObject) {
            var obj: createjs.DisplayObject = draggableStage.draggingObject;
            var draggable: IDraggableObject = <any>obj;
            obj.x = (ev.stageX - draggable.stageBeginX) / stage.transformMatrix.a + draggable.objectBeginX;
            obj.y = (ev.stageY - draggable.stageBeginY) / stage.transformMatrix.a + draggable.objectBeginY;
            draggableStage.draggingObject = null;
            stage.update();
        }
    }
    private static DraggingStageMouseUpInContainer(container: createjs.Container): (ev: createjs.MouseEvent) => void {
        return (ev: createjs.MouseEvent) => {
            var stage: createjs.Stage = ev.target;
            var draggableContainer: IDraggableContainer = <any>container;
            if (draggableContainer.draggingObject) {
                var obj: createjs.DisplayObject = draggableContainer.draggingObject;
                var draggable: IDraggableObject = <any>obj;
                obj.x = (ev.stageX - draggable.stageBeginX) / container.transformMatrix.a + draggable.objectBeginX;
                obj.y = (ev.stageY - draggable.stageBeginY) / container.transformMatrix.a + draggable.objectBeginY;
                draggableContainer.draggingObject = null;
                stage.update();
            }
        }
    }
    /**
     * Configure a stage to allow dragging of displayObject. This shall be used with 'CanDrag'.
     * @param stage
     */
    static StageAllowsDrag(stage: createjs.Stage) {
        stage.on(EaselStageEvents.stagemousemove, EaselCanvasUtil.DraggingStageMouseMove);
        stage.on(EaselStageEvents.stagemouseup, EaselCanvasUtil.DraggingStageMouseUp);
    }
    static ContainerAllowsDrag(container: createjs.Container) {
        container.stage.on(EaselStageEvents.stagemousemove, EaselCanvasUtil.DraggingStageMouseMoveInContainer(container));
        container.stage.on(EaselStageEvents.stagemouseup, EaselCanvasUtil.DraggingStageMouseUpInContainer(container));
    }

    /**
     * Configure a displayObject to allow dragging. You must apply 'StageAllowsDrag' to enable support of this feature.
     * @param displayObject
     */
    static CanDrag(displayObject: createjs.DisplayObject, container: createjs.Container) {
        displayObject.on(EaselShapeEvents.mousedown, EaselCanvasUtil.DraggableObjectMouseDownInContainer(container));
    }
    /**
     * Configure a stage to allow zoom at mouse pointer and scroll. This will set the canvas size unlimited. It allows free zoom and scroll.
     * @param stage the stage to configure;
     * @param minScale the minimal scale that the stage can be zoomed to;
     * @param maxScale the maximal scale that the stage can be zoomed to;
     */
    static StageCanZoomAtMouseAndScroll(stage: createjs.Stage, minScale: number = 0.01, maxScale: number = 10) {
        stage.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var stageCanvas: IStageCanvas = <any>(stage.canvas);
        stageCanvas.stage = stage;
        var Zoom: IZoom = <any>stage;
        Zoom.minScale = minScale;
        Zoom.maxScale = maxScale;
        (<HTMLCanvasElement>(stage.canvas)).addEventListener('mousewheel', EaselCanvasUtil.ZoomAndScroll, true);
    }
    static ContainerCanZoomAtMouseAndScroll(container: createjs.Container, canvas: HTMLCanvasElement | Object, stage: createjs.Stage, minScale: number = 0.01, maxScale: number = 10) {
        container.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        //var stageCanvas: IStageCanvas = <any>(container.canvas);
        //stageCanvas.stage = container;
        var Zoom: IZoom = <any>container;
        Zoom.minScale = minScale;
        Zoom.maxScale = maxScale;
        (<HTMLCanvasElement>canvas).addEventListener('mousewheel', EaselCanvasUtil.ZoomAndScrollContainer(container, stage), true);
    }
    private static ZoomAndScroll(ev: MouseWheelEvent) {
        event.preventDefault();
        var stageCanvas: IStageCanvas = <any>(ev.target);
        var stage = stageCanvas.stage;
        var zoom: IZoom = <any>stage;
        if (ev.ctrlKey) { // Zoom at mouse pointer when Ctrl is pressed.
            stage.transformMatrix = EaselMatrixUtil.ZoomAt(stage.transformMatrix, new createjs.Point(stage.mouseX, stage.mouseY), ev.wheelDelta / 120, zoom.minScale, zoom.maxScale);
            stage.update();
        }
        else {
            if (ev.shiftKey) { // Horizontal scroll when Shift is pressed.
                stage.transformMatrix = EaselMatrixUtil.HorizontalScroll(stage.transformMatrix, ev.wheelDelta / 2);
                stage.update();
            }
            else { // Vertical scroll when no modifier key is pressed.
                stage.transformMatrix = EaselMatrixUtil.VerticalScroll(stage.transformMatrix, ev.wheelDelta / 2);
                stage.update();
            }
        }
    }
    private static ZoomAndScrollContainer(container: createjs.Container, stage: createjs.Stage): (ev: MouseWheelEvent) => void {
        return (ev: MouseWheelEvent) => {
            event.preventDefault();
            console.log('container zooming');
            var zoom: IZoom = <any>container;
            if (ev.ctrlKey) { // Zoom at mouse pointer when Ctrl is pressed.
                container.transformMatrix = EaselMatrixUtil.ZoomAt(container.transformMatrix, new createjs.Point(stage.mouseX, stage.mouseY), ev.wheelDelta / 120, zoom.minScale, zoom.maxScale);
                stage.update();
            }
            else {
                if (ev.shiftKey) { // Horizontal scroll when Shift is pressed.
                    container.transformMatrix = EaselMatrixUtil.HorizontalScroll(container.transformMatrix, ev.wheelDelta / 2);
                    stage.update();
                }
                else { // Vertical scroll when no modifier key is pressed.
                    container.transformMatrix = EaselMatrixUtil.VerticalScroll(container.transformMatrix, ev.wheelDelta / 2);
                    stage.update();
                }
            }
        }
    }
    /**
     * Configure the stage to allow vertical scroll.
     * @param stage the stage to configure.
     * @param height the initial height for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the height;
     */
    static CanVerticalScroll(stage: createjs.Stage, height: number) {
        if (!stage.transformMatrix) stage.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var stageCanvas: IStageCanvas = <any>(stage.canvas);
        stageCanvas.stage = stage;
        var scroll: IScroll = <any>stage;
        var stageResize: IStageResize = <any>stage;

        scroll.getYOffset = () => stage.transformMatrix.ty;
        scroll.setYOffset = (y: number) => {
            var matrix = stage.transformMatrix;
            if (y < ((<HTMLCanvasElement>(stage.canvas)).height - scroll.totalHeight)) y = (<HTMLCanvasElement>(stage.canvas)).height - scroll.totalHeight;
            if (y > 0) y = 0;
            stage.transformMatrix = new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, y);
            stageResize.onHeightChanged = EaselCanvasUtil.HeightChanged;
        };
        scroll.totalHeight = height;
        (<HTMLCanvasElement>(stage.canvas)).addEventListener('mousewheel', EaselCanvasUtil.VerticalScroll, true);
    }
    private static VerticalScroll(ev: MouseWheelEvent) {
        event.preventDefault();
        var stageCanvas: IStageCanvas = <any>(ev.target);
        var scroll: IScroll = <any>(stageCanvas.stage);
        scroll.setYOffset(scroll.getYOffset() + ev.wheelDelta / 2);
        stageCanvas.stage.update();
    }
    private static HeightChanged(newHeight: number, stage: createjs.Stage) {
        var scroll: IScroll = <any>stage;
        scroll.setYOffset(scroll.getYOffset());
        stage.update();
    }
    /**
     * Configure the stage to allow vertical scroll.
     * @param stage the stage to configure.
     * @param width the initial width for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the width;
     */
    static CanHorizontalScroll(stage: createjs.Stage, width: number) {
        if (!stage.transformMatrix) stage.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var stageCanvas: IStageCanvas = <any>(stage.canvas);
        stageCanvas.stage = stage;
        var scroll: IScroll = <any>stage;
        var stageResize: IStageResize = <any>stage;

        scroll.getXOffset = () => stage.transformMatrix.tx;
        scroll.setXOffset = (x: number) => {
            var matrix = stage.transformMatrix;
            if (x < ((<HTMLCanvasElement>(stage.canvas)).width - scroll.totalWidth)) x = (<HTMLCanvasElement>(stage.canvas)).width - scroll.totalWidth;
            if (x > 0) x = 0;
            stage.transformMatrix = new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, x, matrix.ty);
            stageResize.onWidthChanged = EaselCanvasUtil.WidthChanged;
        };
        scroll.totalWidth = width;
        (<HTMLCanvasElement>(stage.canvas)).addEventListener('mousewheel', EaselCanvasUtil.HorizontalScroll, true);
    }
    private static HorizontalScroll(ev: MouseWheelEvent) {
        event.preventDefault();
        var stageCanvas: IStageCanvas = <any>(ev.target);
        var scroll: IScroll = <any>(stageCanvas.stage);
        scroll.setXOffset(scroll.getXOffset() + ev.wheelDelta / 2);
        stageCanvas.stage.update();
    }
    private static WidthChanged(newWidth: number, stage: createjs.Stage) {
        var scroll: IScroll = <any>stage;
        scroll.setXOffset(scroll.getXOffset());
        stage.update();
    }
    private static Scroll(ev: MouseWheelEvent) {
        event.preventDefault();
        var stageCanvas: IStageCanvas = <any>(ev.target);
        var scroll: IScroll = <any>(stageCanvas.stage);
        if (ev.shiftKey) {
            scroll.setXOffset(scroll.getXOffset() + ev.wheelDelta / 2);
            stageCanvas.stage.update();
        }
        else {
            scroll.setYOffset(scroll.getYOffset() + ev.wheelDelta / 2);
            stageCanvas.stage.update();
        }
    }
    /**
     * Configure the stage to allow both horizontal and vertical scroll.
     * @param stage the stage to configure.
     * @param width the initial width for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the width;
     * @param height the initial height for vertical scroll. To access/modify the height, you must apply IScroll over stage to get/set the height;
     */
    static CanScroll(stage: createjs.Stage, width: number, height: number) {
        if (!stage.transformMatrix) stage.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        var scroll: IScroll = <any>stage;
        var stageResize: IStageResize = <any>stage;

        scroll.getXOffset = () => stage.transformMatrix.tx;
        scroll.setXOffset = (x: number) => {
            var matrix = stage.transformMatrix;
            if (x < 0) x = 0;
            if (x > (scroll.totalWidth - (<HTMLCanvasElement>(stage.canvas)).width)) x = scroll.totalWidth - (<HTMLCanvasElement>(stage.canvas)).width;
            stage.transformMatrix = new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, x, matrix.ty);
        };
        scroll.totalWidth = width;

        scroll.getYOffset = () => stage.transformMatrix.ty;
        scroll.setYOffset = (y: number) => {
            var matrix = stage.transformMatrix;
            if (y < 0) y = 0;
            if (y > (scroll.totalHeight - (<HTMLCanvasElement>(stage.canvas)).height)) y = scroll.totalHeight - (<HTMLCanvasElement>(stage.canvas)).height;
            stage.transformMatrix = new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, y);
        };
        scroll.totalHeight = height;
    }
    private static BringToFront(ev: createjs.MouseEvent) {
        if (ev.nativeEvent.button == 0) {
            var displayObject: createjs.DisplayObject = ev.currentTarget;
            if (displayObject.stage) {
                var children: createjs.DisplayObject[] = displayObject.stage.children;
                var index: number = children.indexOf(displayObject);
                if (index > -1 && index < children.length) {
                    children.splice(index, 1);
                    children.push(displayObject);
                    displayObject.stage.update();
                }
            }
        }
    }
    /**
     * Configure a displayObject to allow 'Bring to Front' on left mouse down.
     * @param displayObject the DisplayObject to configure.
     */
    static CanBringToFront(displayObject: createjs.DisplayObject) {
        displayObject.on(EaselShapeEvents.mousedown, EaselCanvasUtil.BringToFront);
    }

    /**
     * Configure a stage to allow grabbing by mouse middle button;
     * @param stage the stage to configure.
     */
    static CanGrabStage(stage: createjs.Stage) {
        // to do 
        var canvas: HTMLCanvasElement = <any>stage.canvas;
        var stageCanvas: IStageCanvas = <any>canvas;
        // let the canvas hold a reference of the stage
        if (!stageCanvas.stage) stageCanvas.stage = stage;
        // make sure the stage has a valid matrix;
        if (!stage.transformMatrix) stage.transformMatrix = new createjs.Matrix2D(1, 0, 0, 1, 0, 0);
        // add listener to process the mouse events;
        canvas.onmousedown = EaselCanvasUtil.CanvasBeginGrab;
        canvas.onmousemove = EaselCanvasUtil.CanvasOnGrab;
        canvas.onmouseup = EaselCanvasUtil.CanvasEndGrab;
    }
    private static CanvasBeginGrab(ev: MouseEvent) {
        if (ev.button == 1) {
            var stageCanvas: IStageCanvas = <any>(ev.target);
            var stage: createjs.Stage = stageCanvas.stage;
            var grab: IGrabbableStage = <any>stage;
            grab.mouseBeginX = ev.x;
            grab.mouseBeginY = ev.y;
            grab.stageBeginX = stage.transformMatrix.tx;
            grab.stageBeginY = stage.transformMatrix.ty;
            grab.isGrabbing = true;
        }
    }
    private static CanvasOnGrab(ev: MouseEvent) {
        var stageCanvas: IStageCanvas = <any>(ev.target);
        var stage: createjs.Stage = stageCanvas.stage;
        var grab: IGrabbableStage = <any>stage;
        if (ev.button == 1 && grab.isGrabbing) {
            var matrix = stage.transformMatrix;
            stage.transformMatrix = new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, grab.stageBeginX + ev.x - grab.mouseBeginX, grab.stageBeginY + ev.y - grab.mouseBeginY);
            stage.update();
        }
    }
    private static CanvasEndGrab(ev: MouseEvent) {
        var stageCanvas: IStageCanvas = <any>(ev.target);
        var stage: createjs.Stage = stageCanvas.stage;
        var grab: IGrabbableStage = <any>stage;
        if (ev.button == 1 && grab.isGrabbing) {
            var matrix = stage.transformMatrix;
            stage.transformMatrix = new createjs.Matrix2D(matrix.a, matrix.b, matrix.c, matrix.d, grab.stageBeginX + ev.x - grab.mouseBeginX, grab.stageBeginY + ev.y - grab.mouseBeginY);
            grab.isGrabbing = false;
            stage.update();
        }
    }

    static CanReceiveByStageMouseEvents(stage: createjs.Stage, handler: IStageMouseEvent) {
        stage.on('stagemousedown', handler.onStageMouseDown);
        stage.on('stagemousemove', handler.onStageMouseMove);
        stage.on('stagemouseup', handler.onStageMouseUp);
    }
    static CanGrabByStage(stage: createjs.Stage, container: createjs.Container) {
        stage.on('stagemousedown', EaselCanvasUtil.BeginGrabByStage(stage, container));
    }
    private static BeginGrabByStage(stage: createjs.Stage, container: createjs.Container) {
        return (ev: createjs.MouseEvent) => {
            let gStage: IGrabStage = <any>stage;
            gStage.grabbingContainer = container;
            let grab: IGrabbable =<any> container;
            grab.locationBeginX = container.x;
            grab.locationBeginY = container.y;
            grab.mouseBeginX = ev.stageX;
            grab.mouseBeginY = ev.stageY;
            //set up the grabbing event;
            stage.on('stagemousemove', EaselCanvasUtil.StageGrabMove(stage));
            stage.on('stagemouseup', EaselCanvasUtil.StageGrabUp(stage));
        }
    }
    private static StageGrabMove(stage: createjs.Stage) {
        return (ev: createjs.MouseEvent) => {
            let gStage: IGrabStage = <any>stage;
            if (gStage.grabbingContainer) {
                let grab: IGrabbable = <any>gStage.grabbingContainer;
                gStage.grabbingContainer.x = grab.locationBeginX + (ev.stageX - grab.mouseBeginX);
                gStage.grabbingContainer.y = grab.locationBeginY + (ev.stageY - grab.mouseBeginY);
            }
        }
    }
    private static StageGrabUp(stage: createjs.Stage) {
        return (ev: createjs.MouseEvent) => {
            let gStage: IGrabStage = <any>stage;
            if (gStage.grabbingContainer) {
                let grab: IGrabbable = <any>gStage.grabbingContainer;
                gStage.grabbingContainer.x = grab.locationBeginX + (ev.stageX - grab.mouseBeginX); 
                gStage.grabbingContainer.y = grab.locationBeginY + (ev.stageY - grab.mouseBeginY); 
                gStage.grabbingContainer = undefined;
            }
        }
    }
}
export interface IGrabStage {
    grabbingContainer: createjs.Container;
}
export interface IGrabbable {
    locationBeginX: number;
    locationBeginY: number;
    mouseBeginX: number;
    mouseBeginY: number;
}
export interface IStageMouseEvent {
    onStageMouseDown(ev: createjs.MouseEvent):any;
    onStageMouseMove(ev: createjs.MouseEvent): any;
    onStageMouseUp(ev: createjs.MouseEvent): any;
}

class CanvasKeyEventDispatcher {
    public canvas: HTMLCanvasElement;
    public keydown: (eKey: KeyboardEvent) => void;
    public keyup: (eKey: KeyboardEvent) => void;
}

/**
 * Setting up key event handlers for canvas elements;
 * CanvasKeyEventService is for the detecting key events, because originally, key events can't be fired in canvas element.
 * We must catch key events in document and fire to canvas manually. And be carefully that this may cause memory leaking as you need to remove the reference to the canvas element.
 * Make sure you call the Unregister before dispose a canvas element.
 */
class CanvasKeyEventService {
    static isRunning: boolean = false;
    static dispatchers: CanvasKeyEventDispatcher[] = [];
    static lastDownTarget: any;
    /**
     * Register the canvas element to the KeyEvent Service.
     * @param canvas the canvas you want to register
     * @param keydown the keydown event handler
     * @param keyup the keyup event handler
     */
    static Register(canvas: HTMLCanvasElement, keydown: (eKey: KeyboardEvent) => void, keyup: (eKey: KeyboardEvent) => void) {
        if (!CanvasKeyEventService.isRunning) {
            document.addEventListener('mousedown', CanvasKeyEventService.onDocumentMouseDown);
            document.addEventListener('keydown', CanvasKeyEventService.onDocumentKeyDown);
            document.addEventListener('keyup', CanvasKeyEventService.onDocumentKeyUp);
            CanvasKeyEventService.isRunning = true;
        }
        //check if it is registered before.
        var found: boolean = false;
        var indicesForRemoval: number[] = [];//We need to a way to detect disposed canvas elements.
        for (var i: number = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas) {
                if (dis.canvas == canvas) {
                    dis.keydown = keydown;
                    dis.keyup = keyup;
                    found = true;
                }
            } else {
                indicesForRemoval.push(i);
            }
        }
        //to remove, we must start from largest number;
        for (var i: number = indicesForRemoval.length - 1; i > -1; i--) {
            CanvasKeyEventService.dispatchers.splice(i, 1);
        }
        if (!found) {
            var dis = new CanvasKeyEventDispatcher();
            dis.canvas = canvas;
            dis.keydown = keydown;
            dis.keyup = keyup;
            CanvasKeyEventService.dispatchers.push(dis);
        }
    }
    static Unregister(canvas: HTMLCanvasElement) {
        var found: boolean = false;
        var index: number;
        for (var i: number = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas == canvas) {
                found = true;
                index = i;
            }
        }
        if (found) CanvasKeyEventService.dispatchers = CanvasKeyEventService.dispatchers.splice(index, 1);
    }
    static onDocumentMouseDown(eMouse: MouseEvent) {
        CanvasKeyEventService.lastDownTarget = eMouse.target;
    }
    static onDocumentKeyDown(eKey: KeyboardEvent) {
        for (var i: number = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas == CanvasKeyEventService.lastDownTarget) if (dis.keydown) dis.keydown(eKey);
        }
    }
    static onDocumentKeyUp(eKey: KeyboardEvent) {
        for (var i: number = 0; i < CanvasKeyEventService.dispatchers.length; i++) {
            var dis = CanvasKeyEventService.dispatchers[i];
            if (dis.canvas == CanvasKeyEventService.lastDownTarget) if (dis.keyup) dis.keyup(eKey);
        }
    }
}