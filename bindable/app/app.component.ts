import {Component, ElementRef, ViewChild, ContentChild, QueryList, ContentChildren, OnInit, TemplateRef, AfterViewInit, HostListener, EventEmitter, NgZone, ChangeDetectorRef, ApplicationRef, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AceComponent} from './ace.component';
import {TestLabelComponent} from './test-label.component';
import {CodeService} from './code.service';
import {Stage, EaselCanvasUtil} from '../easel/stage.component';
import {createjs} from '../easel/easel';
import {FileService} from '../bindable/file.service';
import {Button, roundRect, brush, gradientStop, brushTypes, control, horizontalAlignments , verticalAlignments} from '../bindable/ui';
import {obs, memberDecorator} from '../bindable/bindable';
@Component({ //\\<div ace [code] = "editorCode" style= "width:50%;height:300px;" > </div>
    selector: 'my-app',
    templateUrl: '/app/app.component.html',
    directives: [AceComponent, TestLabelComponent, Stage],
    providers: [FileService],
    changeDetection: ChangeDetectionStrategy.CheckAlways
})
export class AppComponent implements OnInit, AfterViewInit {
    elementRef: ElementRef; 
    private $ChangeDetectorRef: ChangeDetectorRef;
    @ViewChild('editor') private editor: AceComponent;
    @ContentChildren(AceComponent) private children: QueryList<AceComponent>;
    @ViewChild('stage') private mainView: Stage;
    constructor(elementRef: ElementRef, private fileService: FileService, private ngZone: NgZone, private changeDetectorRef: ChangeDetectorRef, private applicationRef: ApplicationRef) {
        console.log('this constructor:', this);
        this.elementRef = elementRef;
    }
    public windowvalue: string;
    private count: number = 0;
    editorInitialized(eventArgs: any) {
        console.log('editorInitialized', eventArgs);
        //this.buttonClicked();
    }
    private editorCode: string;
    ngOnInit() {
        
    }
    ngAfterViewInit() {
        //this.buttonClicked();
        //let obj = new createjs.Text('hello', 'Arial', 'blue');
        //obj.x = 20;
        //obj.y = obj.getMeasuredLineHeight();

        let button = new Button();
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

        let rr = new roundRect();

        let count = 0;
        let g75 = new gradientStop();
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

        rr.fill.gradientStops.push(
            obs.new(new gradientStop(), g => (g.color = 'red', g.ratio = 0)),
            obs.new(new gradientStop(), g => (g.color = 'green', g.ratio = 0.25)),
            obs.new(new gradientStop(), g => (g.color = 'blue', g.ratio = 0.5)),
            g75,
            obs.new(new gradientStop(), g => (g.color = 'red', g.ratio = 1))
        );
        rr.fill.y1 = 800;
        rr.fill.x1 = 1200;

        rr.fill.type = brushTypes.linear;

        console.log('after add ', rr.children);
        
        console.log('redraw', rr.redraw, rr.width, rr.height, rr.tl, rr.tr);

        rr.redraw();
        let md = obs.getDecorator(rr, 'redraw', true);

        console.log('redraw Decorator', md);

        let cc = new control();

        console.log('------ control children: ', cc.viewChildren.length, cc.children);
 
        cc.width = 120;
        cc.height = 240;
        cc.horizontalAlignment = horizontalAlignments.center;
        cc.verticalAlignment = verticalAlignments.bottom;

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
    }
    public hideElement: boolean = false;
    switch() {
        //this.hideElement = !this.hideElement;
        //console.log('swtich: ', this.hideElement);
        //this.mainView.stage.update();

    }
    getGeneBankFile() {
        this.fileService.GetFile('/plasmids/pKD46.gb').subscribe(value => {
            this.displayGeneFile(value);
        });
        this.fileService.GetFile('/plasmids/pKD46L.gb').subscribe(value => {
            this.displayGeneFile(value);
        });
    }
    displayGeneFile(genebankstring: string) {

        let project = new createjs.Container();
        this.mainView.stage.addChild(project);

        EaselCanvasUtil.ContainerAllowsDrag(project);
        EaselCanvasUtil.ContainerCanZoomAtMouseAndScroll(project, this.mainView.canvas, this.mainView.stage, 0.1, 10);



        this.mainView.stage.update();
        console.log('genebank file loaded.');
    }

    //view controller;
    public ProperyPanelHeight: string = '80px';
    private propertyPanelDisplayHeight: number;
    swtichProperyPanel() {
        let height = Number(/(\d+)px/ig.exec(this.ProperyPanelHeight)[1]);
        if (height <= 12) {
            //should expand
            if (this.propertyPanelDisplayHeight < 24) this.propertyPanelDisplayHeight = 120; 
            this.ProperyPanelHeight = this.propertyPanelDisplayHeight + 'px';
        }
        else {
            //should shrink to 12px;
            this.propertyPanelDisplayHeight = height;
            this.ProperyPanelHeight = '12px';
        }
    }
    beginResizeProperyPanel(clientY: number, isTouch?: boolean) {
        let beginY = clientY;
        let height = Number(/(\d+)px/ig.exec(this.ProperyPanelHeight)[1]);
        let that = this;
        let onMove = (currentY: number) => {
            let dragHeight = height + (beginY - currentY);
            if (dragHeight > window.innerHeight - 180) dragHeight = window.innerHeight - 180;
            if (dragHeight <= 12) {
                dragHeight = 12;
            }
            that.ProperyPanelHeight = dragHeight + 'px';
            this.testvalue = 'touch moving: ' + that.ProperyPanelHeight;
            this.changeDetectorRef.detectChanges();
        };
        if (isTouch) {
            this.viewTouchMove = ev => onMove(ev.touches[0].clientY);
            this.viewTouchEnd = ev => onMove(ev.touches[0].clientY);
            window.ontouchend = () => {
                console.log('touch up fired');
                that.viewTouchMove = that.defaultTouchEventHandler;
                that.viewTouchEnd = that.defaultTouchEventHandler;
                window.ontouchend = undefined;
            };
        }
        else {
            this.viewMouseMove = ev => onMove(ev.clientY);
            this.viewMouseUp = ev => onMove(ev.clientY);
            window.onmouseup = () => {
                console.log('mouse up fired');
                that.viewMouseMove = that.defaultMouseEventHandler;
                that.viewMouseUp = that.defaultMouseEventHandler;
                window.onmouseup = undefined;
            };
            this.mousevalue = 'mouse down: ' + clientY;
        }
        this.testvalue = 'begin resize';
    }
    //@HostListener('mousedown', ['$event'])
    //public viewMouseDown: (ev: MouseEvent) => void = (ev: MouseEvent) => {  this.mousevalue = 'move down default: ' + ev.clientX + ', ' + ev.clientY; };
    @HostListener('mousemove', ['$event'])
    public viewMouseMove: (ev: MouseEvent) => void = (ev: MouseEvent) => { this.mousevalue = 'move move default: ' + ev.clientX + ', ' + ev.clientY;};
    @HostListener('mouseup', ['$event'])
    public viewMouseUp: (ev: MouseEvent) => void = (ev: MouseEvent) => {  this.mousevalue = 'move up default: ' + ev.clientX + ', ' + ev.clientY; };
    private defaultMouseEventHandler(ev: MouseEvent) {
    }
    //@HostListener('touchstart', ['$event'])
    //public viewTouchStart: (ev: TouchEvent) => void = (ev: TouchEvent) => { ev.preventDefault(); this.testvalue = 'touch start default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
    @HostListener('touchmove', ['$event'])
    public viewTouchMove: (ev: TouchEvent) => void = (ev: TouchEvent) => { this.testvalue = 'touch move default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
    @HostListener('touchend', ['$event'])
    public viewTouchEnd: (ev: TouchEvent) => void = (ev: TouchEvent) => { this.testvalue = 'touch end default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
    @HostListener('touchcancel', ['$event'])
    public viewTouchCancel: (ev: TouchEvent) => void = (ev: TouchEvent) => { this.testvalue = 'touch cancel default: ' + ev.touches[0].clientX + ', ' + ev.touches[0].clientY; };
    private defaultTouchEventHandler(ev: TouchEvent) {
    }
    public testvalue: string = 'test output';
    public mousevalue: string = 'mouse value';
}
