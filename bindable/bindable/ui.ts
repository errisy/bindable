import {createjs} from '../easel/easel';
import {obs, obp, memberDecorator, ObservableArray, IObservableArrayEvent, ArrayOperationType, objectDecorator, PathBindingMode, util} from './bindable';
import {Serializable} from 'Serializable';

@obs.bindable
export class UIStage extends createjs.Stage {
    constructor(canvas: HTMLCanvasElement | string | Object) {
        super(canvas);
        this.enableMouseOver(24);
    }
    @obs.event
    redraw = ()=> {
        this.update();
    }
    @obs.after(()=>UIStage.prototype.contentChanged).property
    public content: createjs.Container;
    @obs.after(()=>UIStage.prototype.redraw).event
    public contentChanged = (source: Object, key: string, dcs: memberDecorator[], newValue: createjs.Container, oldValue: createjs.Container) => {
        if (oldValue && this.contains(oldValue)) {
            this.removeChild(oldValue);
        }
        if (newValue && !this.contains(newValue)) {
            this.addChild(newValue);
        }
    }
    @obs.after(()=>UIStage.prototype.layout).property
    public width: number;

    @obs.after(() => UIStage.prototype.layout).property
    public height: number;

    @obs.event
    public layout = () => {
        obs.block(this, () => UIStage.prototype.redraw, () => {
            this.viewChildren.forEach(child => {
                child.offsetX = 0;
                child.offsetY = 0;
                child.availableWidth = this.width;
                child.availableHeight = this.height;
                child.layout();
            });
        });
        this.redraw();
    }

    @obs.after(()=>UIStage.prototype.onChildrenChanged).observable(ObservableArray).default(()=>ObservableArray.prototype.parent).childDefault(()=>visual.prototype.viewParent).property
    public viewChildren: ObservableArray<visual>;

    @obs.listen(()=>UIStage.prototype.viewChildren.onchange).after(()=>UIStage.prototype.layout).event 
    public onChildrenChanged = () => {
        this.removeAllChildren();
        if (this.viewChildren) createjs.Stage.prototype.addChild.apply(this, this.viewChildren);
    }
}

@obs.bindable
export class Button extends createjs.Container {
    constructor() {
        super();

        this.on('mouseover', this.onMouseOver);
        this.on('mouseout', this.onMouseOut);
        this.on('mousedown', this.onMouseDown);
        this.on('pressup', this.onPressUp);

        this.addChild(this.buttonBackground, this.buttonText);

        this.buttonBackground.on('mouseover', this.onMouseOver);
    }

    @obs.event
    onMouseOver = (ev: createjs.MouseEvent) =>{
        //console.log('button on mouse over');
        this.mouseStatus = 'hover';

    }
    @obs.event
    onMouseOut = (ev: createjs.MouseEvent) => {
        //console.log('button on mouse out');
        this.mouseStatus = 'out';

    }
    @obs.event
    onMouseDown =(ev: createjs.MouseEvent) =>{
        //console.log('button on mouse pressed');
        this.mouseStatus = 'pressed';

    }
    @obs.event
    onPressUp  = (ev: createjs.MouseEvent) =>{
        //console.log('button on mouse hover');
        this.mouseStatus = 'hover';

    }

    @obs.after(() => Button.prototype.onDraw).property
    public mouseStatus: 'out'|'hover'|'pressed' = 'out';
    


    @obs.property
    private buttonText: createjs.Text = new createjs.Text('button','10pt Arial', 'black');
    @obs.property
    private buttonBackground: createjs.Shape = new createjs.Shape();

    @obs.wrap(() => Button.prototype.buttonText.text)
        .after(() => Button.prototype.onDraw)
        .property
    public text: string;
    @obs.wrap(() => Button.prototype.buttonText.color)
        .property
    public foreground: string;
    @obs.wrap(() => Button.prototype.buttonText.font)
        .after(() => Button.prototype.onDraw)
        .property
    public font: string;

    @obs.after(() => Button.prototype.onDraw).property
    public borderWidth: number = 1;
    @obs.after(() => Button.prototype.onDraw).property
    public spacing: number = 2;
    @obs.after(() => Button.prototype.onDraw).property
    public cornerRadius: { tl: number, bl: number, tr: number, br: number } = { tl: 4, bl: 4, tr: 4, br: 4 };
    @obs.after(() => Button.prototype.onDraw).property
    public borderColor: string = 'black';
    @obs.after(() => Button.prototype.onDraw).property
    public borderHoverColor: string = 'brown';
    @obs.after(() => Button.prototype.onDraw).property
    public borderPressedColor: string = 'darkgreen';

    @obs.after(() => Button.prototype.onDraw).property
    public backgroundColor: string = 'white';
    @obs.after(() => Button.prototype.onDraw).property
    public backgroundHoverColor: string = 'yellow';
    @obs.after(() => Button.prototype.onDraw).property
    public backgroundPressedColor: string = 'purple';

    
    public stage: UIStage;
    @obs.after(()=>Button.prototype.stage.redraw).event
    public onDraw = () => {

        

        let g = this.buttonBackground.graphics;
        g.clear();
        let bw = util.checkValidNumber(this.borderWidth, 1);
        let sp = util.checkValidNumber(this.spacing, 3);
        let w = this.buttonText.getMeasuredWidth() + bw + bw + sp + sp;
        let h = this.buttonText.getMeasuredHeight() + bw + bw + sp + sp;

        let sw = util.checkValidNumber(this.borderWidth, 1);
        this.buttonText.x = bw + sp;
        this.buttonText.y = bw + sp;

        let tl = util.checkValidNumber(this.cornerRadius.tl, 0);
        let bl = util.checkValidNumber(this.cornerRadius.bl, 0);
        let tr = util.checkValidNumber(this.cornerRadius.tr, 0);
        let br = util.checkValidNumber(this.cornerRadius.br, 0);

        //console.log('onDraw', this.mouseStatus);

        g.setStrokeStyle(sw);

        switch (this.mouseStatus) {
            default:
            case 'out':
                //console.log('out', this.borderColor, this.backgroundColor);
                g = g.beginStroke(this.borderColor).beginFill(this.backgroundColor);
                break; 
            case 'hover':
                //console.log('hover', this.borderHoverColor, this.backgroundHoverColor);
                g = g.beginStroke(this.borderHoverColor).beginFill(this.backgroundHoverColor);
                break;
            case 'pressed':
                //console.log('pressed', this.borderPressedColor, this.backgroundPressedColor);
                g = g.beginStroke(this.borderPressedColor).beginFill(this.backgroundPressedColor);
                break; 
        }
        g.drawRoundRectComplex(0, 0, w, h, tl, tr, br, bl).endFill().endStroke();

        this.buttonBackground.setBounds(0, 0, w, h);
        //console.log('buttonText getBounds:', this.buttonText.getBounds());
        //console.log('buttonBackground getBounds:', this.buttonBackground.getBounds());
    }

}
@obs.bindable
export class Grid extends createjs.Container {
    @obs.default(()=>ObservableArray.prototype.parent).childDefault(()=>gridRow.prototype.hostArray).property
    public rows: ObservableArray<gridRow> = new ObservableArray<gridRow>();
    @obs.default(()=>ObservableArray.prototype.parent).childDefault(()=>gridColumn.prototype.hostArray).property
    public columns: ObservableArray<gridColumn> = new ObservableArray<gridColumn>();
    @obs.event public layout = () => {

    }
    static setGridRow(obj: createjs.DisplayObject, index: number) {
        obj['@Grid.Row'] = index;
    }
    static setGridColumn(obj: createjs.DisplayObject, index: number) {
        obj['@Grid.Column'] = index;
    }
}

@obs.bindable
export class gridRow {
    @obs.after(() => gridRow.prototype.grid.layout).property public height: number;
    @obs.after(() => gridRow.prototype.grid.layout).property public minHeight: number;
    @obs.after(() => gridRow.prototype.grid.layout).property public maxHeight: number;
    @obs.after(() => gridRow.prototype.grid.layout).property public type: 'auto' | '*' | 'pixel';
    @obs.after(() => gridRow.prototype.grid.layout).property public hostArray: ObservableArray<gridRow>;
    @obs.wrap(() => gridRow.prototype.hostArray.parent).property public grid: Grid;
    @obs.property public desiredHeight: number;
    @obs.property public actualHeight: number;
}
@obs.bindable
export class gridColumn {
    @obs.after(()=>gridColumn.prototype.grid.layout).property public width: number;
    @obs.after(() => gridColumn.prototype.grid.layout).property public minWidth: number;
    @obs.after(() => gridColumn.prototype.grid.layout).property public maxWidth: number;
    @obs.after(() => gridColumn.prototype.grid.layout).property public type: 'auto' | '*' | 'pixel';
    @obs.after(() => gridColumn.prototype.grid.layout).property public hostArray: ObservableArray<gridColumn>;
    @obs.wrap(() => gridColumn.prototype.hostArray.parent).property public grid: Grid;
    @obs.property public desiredWidth: number;
    @obs.property public actualWidth: number;
}

export class ofu {
    static applyLets(obj: any, lets: { [id: string]: any }) {
        for (let id in lets) {
            obj[id] = lets[id];
        }
    }
    static applySets(obj: any, Sets: { setter: ((obj: any, ...values: any[]) => any), values: any[] }[]) {
        Sets.forEach(s => s.setter(obj, s.values));
    }
}


export class frameworkDecorator {
    constructor() {
        this['@FrameworkService.FrameworkDecorator'] = true;
    }
    private instanceBuilder: any;
    private instanceArgs: any[];
    private binds: { [property: string]: { path: string[], mode:  PathBindingMode} } = {};
    private listens: { [property: string]: string[][] } = {};
    private befores: { [property: string]: string[][] } = {};
    private afters: { [property: string]: string[][] } = {};
    public sets: { setter: ((obj: any, ...values: any[]) => any), values: any[] }[] = [];
    private lets: { [property: string]: any} = {};
    public type: 'property' | 'event' | 'method' | 'view';
    public new = (builder: Function, ...args: any[]) => {
        this.instanceBuilder = builder;
        this.instanceArgs = args;
        return this;
    }
    public applyNew = (builder: Function, args: any[]) => {
        this.instanceBuilder = builder;
        this.instanceArgs = args;
        return this;
    }
    public bind(property: (() => any) | string | (string[]), path: (() => any) | string | (string[]), mode?: PathBindingMode) {
        let key = obp.getPropertyName(obp.analyzePath(property)[0]);
        if (key && key.length > 0) this.binds[key] = { path: obp.analyzePath(path), mode: mode ? mode : PathBindingMode.bind };
        return this;
    }
    public listen(property: (() => any) | string | (string[]), path: (() => any) | string | (string[])) {
        let key = obp.getPropertyName(obp.analyzePath(property)[0]);
        if (key && key.length > 0) {
            if (!this.listens[key]) this.listens[key] = [];
            this.listens[key].push(obp.analyzePath(path));
        }
        return this;
    }
    public after(property: (() => any) | string | (string[]), path: (() => any) | string | (string[])) {
        let key = obp.getPropertyName(obp.analyzePath(property)[0]);
        if (key && key.length > 0) {
            if (!this.afters[key]) this.afters[key] = [];
            this.afters[key].push(obp.analyzePath(path));
        }
        return this;
    }
    public before(property: (() => any) | string | (string[]), path: (() => any) | string | (string[])) {
        let key = obp.getPropertyName(obp.analyzePath(property)[0]);
        if (key && key.length > 0) {
            if (!this.befores[key]) this.befores[key] = [];
            this.befores[key].push(obp.analyzePath(path));
        }
        return this;
    }
    public let<T>(property: (() => T), value: T) {
        let key = obp.getPropertyName(obp.analyzePath(property)[0]);
        if (key && key.length > 0) this.lets[key] = value;
        return this;
    }
    public set(setter: (obj: any, ...values: any[]) => any, ...values: any[]) {
        this.sets.push({ setter: setter, values: values });
        return this;
    }
    public view = (target: Object, key: string, descriptor?: PropertyDescriptor) => {
        this.type = 'view';
        ofs.setFrameworkDecorator(target, key, this);
    }
    public property = (target: Object, key: string, descriptor?: PropertyDescriptor) => {
        this.type = 'property';
        ofs.setFrameworkDecorator(target, key, this);
    }
    public event = (target: Object, key: string, descriptor?: PropertyDescriptor) => {
        this.type = 'event';
        ofs.setFrameworkDecorator(target, key, this);
    }
    public method = (target: Object, key: string, descriptor?: PropertyDescriptor) => {
        this.type = 'method';
        ofs.setFrameworkDecorator(target, key, this);
    }

    public eventListens: string[][] = [];
    public memberAfters: string[][] = [];
    public memberBefores: string[][] = [];
    public propertyBindPath: string[];
    public propertyBindMode: PathBindingMode;

    public eventListen(...paths: ((() => any) | string | (string[]))[]) {
        paths.forEach(path => this.eventListens.push(obp.analyzePath(path)));
    }
    public memberAfter(...paths: ((() => any) | string | (string[]))[]) {
        paths.forEach(path => this.memberAfters.push(obp.analyzePath(path)));
    }
    public memberBefore(...paths: ((() => any) | string | (string[]))[]) {
        paths.forEach(path => this.memberBefores.push(obp.analyzePath(path)));
    }
    public propertyBind(path: (() => any) | string | (string[]), mode?: PathBindingMode ) {
        this.propertyBindPath = obp.analyzePath(path);
        this.propertyBindMode = mode;
    }

    public getMemberDecorator(target?: Object, key?:string) {
        let d = new memberDecorator();
        if (target) d.target = target;
        if (key) d.propertyKey = key;
        this.eventListens.forEach(p => d.listen(p));
        this.memberBefores.forEach(p => d.before(p));
        this.memberAfters.forEach(p => d.after(p));
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
    }
    public useTemplate(type: typeof template) {
        return this;
    }

    public realValue: any;
 
    public asEvent<T>(value?: Function):T {
        this.type = 'event';
        this.realValue = value;
        return <T>(<any>this);
    }
    public asMethod<T>(value?: Function): T {
        this.type = 'method';
        this.realValue = value;
        return <T>(<any>this);
    }
    public asProperty<T>(value?: any): T {
        this.type = 'property';
        this.realValue = value;
        return <T>(<any>this);
    }
    public asView<T>(value?: any): T{
        this.type = 'view';
        this.realValue = value;
        return <T>(<any>this);
    }

    public instance(value: any) {
        this.realValue = value;
        return this;
    }
    /**
     * combine new decorator to existing one;
     * @param decorator
     */
    public combine(decorator: frameworkDecorator) {
        this.type = decorator.type;
        util.appendArrayDictionary(this.befores, decorator.befores);
        util.appendArrayDictionary(this.afters, decorator.afters);
        util.appendArrayDictionary(this.listens, decorator.listens);
        util.appendArray(this.sets, decorator.sets);
        util.appendDictionary(this.lets, decorator.lets);
        util.appendDictionary(this.binds, decorator.binds);
        util.appendArray(this.eventListens, decorator.eventListens);
        util.appendArray(this.memberAfters, decorator.memberAfters);
        util.appendArray(this.memberBefores, decorator.memberBefores);
        if (decorator.propertyBindPath && decorator.propertyBindPath.length > 0) this.propertyBindPath = decorator.propertyBindPath;
        if (decorator.instanceBuilder) this.instanceBuilder = decorator.instanceBuilder;
        return this;
    }
    private static appendArray = (arr: any[], items: any[]) => {
        Array.prototype.push.apply(arr, items);
        return arr;
    }
    public isBuilt: boolean;
    public build(existing?:any): any {
        this.isBuilt = true;
        switch (this.type) {
            case 'view':
            case 'property':
                let view: any;
                if (this.realValue) {
                    view = this.realValue;
                }
                else {
                    if (existing) {
                        view = existing;
                    }
                    else {
                        if (this.instanceBuilder) {
                            view = new (Function.prototype.bind.apply(this.instanceBuilder, this.instanceArgs));
                        }
                        else {
                            view = {};//use a plain object if nothing is defined;
                        }
                    }
                }
                ofu.applyLets(view, this.lets);
                ofu.applySets(view, this.sets);
                let newDecorators: memberDecorator[] = [];
                //binds
                for (let key in this.binds) {
                    let d = obs.getDecorator(view, key);
                    if (d.instantiated) {
                        d.setBindingPath(this.binds[key].path, this.binds[key].mode);
                    }
                    else {
                        d.bind(this.binds[key].path, this.binds[key].mode);
                        if (newDecorators.indexOf(d) < 0) newDecorators.push(d);
                    }
                }
                //listens
                for (let key in this.listens) {
                    let d = obs.getDecorator(view, key);
                    if (d.instantiated) {
                        this.listens[key].forEach(p => d.addListen(p));
                    }
                    else {
                        this.listens[key].forEach(p => d.listen(p));
                        if (newDecorators.indexOf(d) < 0) newDecorators.push(d);
                    }
                }
                //befores
                for (let key in this.befores) {
                    let d = obs.getDecorator(view, key);
                    if (d.instantiated) {
                        this.befores[key].forEach(p => d.befores.push({ target: view, path: p }));
                    }
                    else {
                        this.befores[key].forEach(p => d.before(p));
                        if (newDecorators.indexOf(d) < 0) newDecorators.push(d);
                    }
                }
                //afters
                for (let key in this.afters) {
                    let d = obs.getDecorator(view, key);
                    if (d.instantiated) {
                        this.afters[key].forEach(p => d.afters.push({ target: view, path: p }));
                    }
                    else {
                        this.afters[key].forEach(p => d.after(p));
                        if (newDecorators.indexOf(d) < 0) newDecorators.push(d);
                    }
                }
                newDecorators.forEach(d => d.instantiate());
                return view;
            case 'method':
            case 'event':
                return this.realValue;
        }
    }

}

export class viewDecorator {
    public templatePath: string;
    public viewsPath: string;
    public templateType: typeof template;

    public useViewTemplate  = (templatePath: (() => any) | string | (string[]), viewsPath: (() => any) | string | (string[]), templateType?: typeof template) => {
        this.templatePath = obp.getPropertyName(obp.analyzePath(templatePath)[0]);
        this.viewsPath = obp.getPropertyName(obp.analyzePath(viewsPath)[0]);
        this.templateType = templateType;

        console.log('viewDecorator templatePath viewsPath: ', this.templatePath, this.viewsPath);
        return this;
    }
    /**
     * this already has bindable, do not apply bindable again.
     * @param target
     */
    public view = (target: any)=> {
        console.log('viewDecorator: ', this);
        let that = this;
        let viewsPath = this.viewsPath;
        let templatePath = this.templatePath;
        let templateType = this.templateType;
        let instanceFunction = (instance: any, classPrototype: any) => {
            //this only work after the latest constructor;
            if ((<string[]>(instance["@ObjectService.ConstructionStack"])).length > 1) return instance;
            //to do: add views in the template into the views
            //console.log('that in instanceFunction: ', that);
            let views : ObservableArray<any> = instance[that.viewsPath];
            let tempInstance: template;
            if (that.templateType) {
                tempInstance = ofs.build(that.templateType);
                instance[that.templatePath] = tempInstance;
            }
            else {
                if (instance[that.templatePath]) {
                    tempInstance = instance[that.templatePath];
                }
            }
            

            let templatePropertyDecorator = obs.getDecorator(instance, that.templatePath);
            console.log('view instance: ', that.templatePath, instance[that.templatePath]);
            if (templatePropertyDecorator.type != 'property') {
                obs.makeProperty(instance, that.templatePath);
                instance[that.templatePath] = tempInstance;
            }

            let viewsPropertyDecorator = obs.getDecorator(instance, that.viewsPath);
            if (viewsPropertyDecorator.type != 'property') {
                obs.makeProperty(instance, that.templatePath);
            }
            if (!viewsPropertyDecorator.instantiate) viewsPropertyDecorator.instantiate;
            viewsPropertyDecorator.setDefault(() => ObservableArray.prototype.parent);


            console.log(' before set observe: ', instance[that.templatePath]['views'], instance[this.viewsPath]['parent']);

            viewsPropertyDecorator.setObserve(['.' + that.templatePath, '.views']);

            console.log(' >>>> before setting views:------------');
            //instance[that.viewsPath] = views;
            console.log(' >>>> after setting views:------------');
            {
                let sd = obs.getDecorator(views, 'observationSource');
                console.log('observationSource bindingPath: ', sd.bindingPath, views.parent);
            }
            
            return instance;
        }
        
        let od = new objectDecorator();

        return od.bindableBase(target, instanceFunction);
    }
}

export class ofs {
    static new(builder: Function, ...args: any[]) {
        return (new frameworkDecorator()).applyNew(builder, args);
    }
    static applyNew(builder: Function, args: any[]) {
        return (new frameworkDecorator()).applyNew(builder, args);
    }
    static bind(property: (() => any) | string | (string[]), path: (() => any) | string | (string[])) {
        return (new frameworkDecorator()).bind(property, path);
    }
    static listen(property: (() => any) | string | (string[]), path: (() => any) | string | (string[])) {
        return (new frameworkDecorator()).listen(property, path);
    }
    static after(property: (() => any) | string | (string[]), path: (() => any) | string | (string[])) {
        return (new frameworkDecorator()).after(property, path);
    }
    static before(property: (() => any) | string | (string[]), path: (() => any) | string | (string[])) {
        return (new frameworkDecorator()).before(property, path);
    }
    static eventListen(...paths: ((() => any) | string | (string[]))[]) {
        return frameworkDecorator.prototype.eventListen.apply((new frameworkDecorator()), paths);
    }
    static memberAfter(...paths: ((() => any) | string | (string[]))[]) {
        return frameworkDecorator.prototype.memberAfter.apply((new frameworkDecorator()), paths);
    }
    static memberBefore(...paths: ((() => any) | string | (string[]))[]) {
        return frameworkDecorator.prototype.memberBefore.apply((new frameworkDecorator()), paths);
    }
    static propertyBind(path: (() => any) | string | (string[]), mode?: PathBindingMode) {
        return (new frameworkDecorator()).propertyBind(path, mode);
    }
    static useTemplate(type: typeof template) {
        return (new frameworkDecorator()).useTemplate(type);
    }
    static let<T>(property: (() => T), value: T) {
        return (new frameworkDecorator());
    }
    static set(setter:(obj: any, ...values: any[]) => any , ...values:any[]) {
        return (new frameworkDecorator()).set(setter, values);
    }
    static get view() {
        return (new frameworkDecorator()).view;
    }
    static asEvent<T>(value?: Function): T {
        return (new frameworkDecorator()).asEvent<T>(value);
    }
    static asMethod<T>(value?: Function): T {
        return (new frameworkDecorator()).asMethod<T>(value);
    }
    static asProperty<T>(value?: any): T {
        return (new frameworkDecorator()).asProperty<T>(value);
    }
    static asView<T>(value?: any): T {
        return (new frameworkDecorator()).asView<T>(value);
    }
 
    /**
     * specify a class as a template
     * @param target
     */
    static template(target: any) {
        let instanceFunction = (instance: any, classPrototype: any) => {
            //nothing to do?
        }
        let od = new objectDecorator();
        od.bindableBase(target, instanceFunction);
    }
    static useViewTemplate(templatePath: (() => any) | string | (string[]), viewsPath: (() => any) | string | (string[]), templateType?: typeof template) {
        return (new viewDecorator()).useViewTemplate(templatePath, viewsPath, templateType);
    }
    /**
     * convert a template class into a viewTemplate
     * @param temp
     */
    static build(temp: typeof template) {
        let instance = new temp();
        let defs: { [key: string]: frameworkDecorator } = {};
        util.appendDictionary(defs, instance['@FrameworkService.TemplateDefinitions']);
        let newDecorators: memberDecorator[] = []; 
        //if definitions are not found then, this is using property
        //let items = temp;
        for (let key in instance) {
            let prop = instance[key]; 
            if (ofs.isFrameworkDecorator(prop)) {
                if (defs[key]) {
                    defs[key].combine(prop);
                }
                else {
                    defs[key] = prop;
                }
                //remove instance[key]
                //instance[key] = defs[key].build();
            }
        }
        let newDecs: memberDecorator[] = [];
        let nd: memberDecorator; 
        
        for (let key in defs) {
            //to do create instance and set up operations
            let fieldFrameworkDecorator = defs[key];

            let instanceFieldDecorator = fieldFrameworkDecorator.getMemberDecorator(instance, key);
            if (instanceFieldDecorator.type != 'property') {
                instanceFieldDecorator = obs.makeProperty(instance, key);
            }
            if (!instanceFieldDecorator.instantiated) instanceFieldDecorator.instantiate(); 
            if (!fieldFrameworkDecorator.isBuilt) {
                //build them;
                let propertyInstance = fieldFrameworkDecorator.build(temp[key]);
                instance[key] = propertyInstance;
                console.log(' ### propertyInstance of key(' + key + ')', propertyInstance);
            }
            nd = undefined;
            if (nd = obs.applyDecorator(instance, key, instanceFieldDecorator)) newDecs.push(nd);
        }
        //newDecs.forEach(d => d.instantiate());
        console.log(' #### rect of instance: ', instance['rect']);
        //collect the views from the instance and add them to ['@FrameworkService.Views']
        //['@FrameworkService.TemplateViews']
        let views: any[] = [];
        for (let key in defs) {
            let fd = defs[key];
            if (fd.type == 'view') {
                //let each of the view notice the viewChanged when they changed
                let d = obs.getDecorator(instance, key);
                d.after(() => template.prototype.viewChanged);
            }
        }
        instance['@FrameworkService.TemplateDefinitions'] = defs;
        instance.viewChanged();

        return instance;
    }
    static isFrameworkDecorator(value: Object): boolean {
        return value['@FrameworkService.FrameworkDecorator'];
    }
    static setFrameworkDecorator(target: Object, id: string, decorator: frameworkDecorator) {
        let defs: { [id: string]: frameworkDecorator };
        if (!target['@FrameworkService.TemplateDefinitions']) target['@FrameworkService.TemplateDefinitions'] = {};
        defs = target['@FrameworkService.TemplateDefinitions'];
        if (defs[id]) {
            return defs[id].combine(decorator);
        }
        else {
            defs[id] = decorator;
            return decorator;
        }
    }
}



@obs.bindable
export class visual extends createjs.Container {
    @obs.property
    public desiredWidth: number = Number.POSITIVE_INFINITY;
    @obs.property
    public desiredHeight: number = Number.POSITIVE_INFINITY;
    @obs.property
    public actualWidth: number = 0;
    @obs.property
    public actualHeight: number = 0;
    @obs.after(()=>visual.prototype.layout).property
    public verticalAlignment: verticalAlignments = verticalAlignments.stretch;
    @obs.after(() => visual.prototype.layout).property
    public horizontalAlignment: horizontalAlignments = horizontalAlignments.stretch;

    @obs.property
    public availableWidth: number;
    @obs.property
    public availableHeight: number;
    @obs.property
    public offsetX: number = 0;
    @obs.property
    public offsetY: number = 0;

    @obs.event
    layout = () => {
        //needs reponse to available width and height
        this.selfLayout();//standard method
    }

    @obs.method
    protected selfLayout = () => {
        switch (this.verticalAlignment) {
            case verticalAlignments.center:
                this.actualHeight = this.desiredHeight;
                this.y = this.offsetY + (this.availableHeight - this.actualHeight) * 0.5;
                break;
            case verticalAlignments.top:
                this.actualHeight = this.desiredHeight;
                this.y = this.offsetY;
                break;
            case verticalAlignments.bottom:
                this.actualHeight = this.desiredHeight;
                this.y = this.offsetY + this.availableHeight - this.actualHeight;
                break;
            case verticalAlignments.stretch:
                this.y = this.offsetY;
                this.actualHeight = this.availableHeight;
                break;
        }
        switch (this.horizontalAlignment) {
            case horizontalAlignments.center:
                this.actualWidth = this.desiredWidth;
                this.x = this.offsetX + (this.availableWidth - this.actualWidth) * 0.5;
                break;
            case horizontalAlignments.left:
                this.actualWidth = this.desiredWidth;
                this.x = this.offsetX;
                break;
            case horizontalAlignments.right:
                this.actualWidth = this.desiredWidth;
                this.x = this.offsetX + this.availableWidth - this.actualWidth;
                break;
            case horizontalAlignments.stretch:
                this.actualWidth = this.availableWidth;
                this.x = this.offsetX;
                break;
        }
    }

    @obs.after(() => visual.prototype.stage.update).event
    public redraw = () => {
        //console.log(' ############ visual redraw called...');
    }

    @obs.property
    public viewParent: visual;
    /**templateParent binds to parent's templateParent. It will be updated when parent is changed. This allows a route to the top level of the view.*/
    @obs.bind(() => visual.prototype.viewParent.templateParent).property
    public templateParent: template;
}

@obs.bindable 
export class frameworkElement extends visual {
    constructor() {
        super();
        this.on('added', this.layout);
    }
    @obs.after(()=>visual.prototype.layout).event
    onAdded = () => {
        console.log(' --------- frameworkElement is added to the UIStage');
    };

    @obs.after(() => frameworkElement.prototype.layout).property
    public width: number;
    @obs.after(() => frameworkElement.prototype.layout).property
    public height: number;

    @obs.observable(ObservableArray).default(() => ObservableArray.prototype.parent).property
    public viewChildren: ObservableArray<visual>;

    @obs.listen(() => frameworkElement.prototype.viewChildren.onchange).after(()=>visual.prototype.layout).event
    public onChildrenChange(ev: IObservableArrayEvent<createjs.DisplayObject>) {
        //fill the views into the host;
        console.log('frameworkElement.onChildrenChange invoked', this.viewChildren.asArray());
        this.removeAllChildren();
        createjs.Container.prototype.addChild.apply(this, this.viewChildren);
    }
    public _count: number = 0;

    layout = () => {
        
        this.desiredHeight = this.viewChildren.map(child => child.desiredHeight).reduce((previous, current) => Math.max(previous, current), 0);
        this.desiredWidth = this.viewChildren.map(child => child.desiredWidth).reduce((previous, current) => Math.max(previous, current), 0);

        //this.desiredHeight = util.checkValidNumber(this.desiredHeight, util.checkValidNumber(this.height, this.availableHeight));
        //this.desiredWidth = util.checkValidNumber(this.desiredWidth, util.checkValidNumber(this.width, this.availableWidth));

        this.desiredHeight = util.checkValidNumber(this.height, this.desiredHeight);
        this.desiredWidth = util.checkValidNumber(this.width, this.desiredWidth);

        this.desiredHeight = util.checkValidNumber(this.desiredHeight, this.availableHeight);
        this.desiredWidth = util.checkValidNumber(this.desiredWidth, this.availableWidth)

        this._count += 1;
        //console.log(this._count, 'frameworkElement layout...', this.desiredWidth, this.desiredHeight);
        //if (this._count > 20) return; 


        switch (this.verticalAlignment) {
            case verticalAlignments.center:
                this.actualHeight = this.desiredHeight;
                this.y = this.offsetY + (this.availableHeight - this.actualHeight) * 0.5;
                break;
            case verticalAlignments.top:
                this.actualHeight = this.desiredHeight;
                this.y = this.offsetY;
                break;
            case verticalAlignments.bottom:
                this.actualHeight = this.desiredHeight;
                this.y = this.offsetY +  this.availableHeight - this.actualHeight;
                break;
            case verticalAlignments.stretch:
                this.y = this.offsetY;
                this.actualHeight = this.availableHeight;
                break;
        }
        switch (this.horizontalAlignment) {
            case horizontalAlignments.center:
                this.actualWidth = this.desiredWidth;
                this.x = this.offsetX + (this.availableWidth - this.actualWidth) * 0.5;
                break;
            case horizontalAlignments.left:
                this.actualWidth = this.desiredWidth;
                this.x = this.offsetX;
                break;
            case horizontalAlignments.right:
                this.actualWidth = this.desiredWidth;
                this.x = this.offsetX + this.availableWidth - this.actualWidth;
                break;
            case horizontalAlignments.stretch:
                this.actualWidth = this.availableWidth;
                this.x = this.offsetX;
                break;
        }
        this.viewChildren.forEach(child => {
            if (child.layout) {
                //console.log(this._count, 'frameworkElement Child layout...', child, this.actualWidth, this.actualHeight);
                child.offsetX = 0;
                child.offsetY = 0;
                child.availableWidth = this.actualWidth;
                child.availableHeight = this.actualHeight;
                child.layout();
            }
        });
    }
}

@obs.bindable
export class panel extends frameworkElement {

}

export enum brushTypes {
    solid, linear, radial, bitmap
}

@obs.bindable
export class brush {
    @obs.after(() => brush.prototype.changed).property
    public color: string;
    @obs.after(() => brush.prototype.changed).listenChildren(() => gradientStop.prototype.changed).property
    public gradientStops: ObservableArray<gradientStop> = new ObservableArray<gradientStop>();
    @obs.after(() => brush.prototype.changed).property
    public type: brushTypes = brushTypes.solid; //solide default;
    @obs.after(() => brush.prototype.changed).property
    public x0: number = 0;
    @obs.after(() => brush.prototype.changed).property
    public y0: number = 0;
    @obs.after(() => brush.prototype.changed).property
    public x1: number = 100;
    @obs.after(() => brush.prototype.changed).property
    public y1: number = 100;
    @obs.after(() => brush.prototype.changed).property
    public r0: number = 50;
    @obs.after(() => brush.prototype.changed).property
    public r1: number = 100;
    @obs.listen(() => brush.prototype.gradientStops.itemEvents.changed).event
    changed = () => {
    }

    public fill = (g: createjs.Graphics) => {
        let len = this.gradientStops.length;
        switch (this.type) {
            case brushTypes.solid:
                g.beginFill(this.color);
                break;
            case brushTypes.linear:
                //console.log('linear fill: ', this.gradientStops.map((stop, index) => util.checkValidNumber(stop.ratio, index / len)));
                g.beginLinearGradientFill(
                    this.gradientStops.map(stop => stop.color),
                    this.gradientStops.map((stop, index) => util.checkValidNumber(stop.ratio, index / len)),
                    this.x0, this.y0, this.x1, this.y1);
                break;
            case brushTypes.radial:
                g.beginRadialGradientFill(
                    this.gradientStops.map(stop => stop.color),
                    this.gradientStops.map((stop, index) => util.checkValidNumber(stop.ratio, index / len)),
                    this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
                break;
            case brushTypes.bitmap:

                break;
        }
    }
    public stroke = (g: createjs.Graphics) => {
        let len = this.gradientStops.length;
        switch (this.type) {
            case brushTypes.solid:
                g.beginStroke(this.color);
                break;
            case brushTypes.linear:
                g.beginLinearGradientStroke(
                    this.gradientStops.map(stop => stop.color),
                    this.gradientStops.map((stop, index) => util.checkValidNumber(stop.ratio, index / len)),
                    this.x0, this.y0, this.x1, this.y1);
                break;
            case brushTypes.radial:
                g.beginRadialGradientStroke(
                    this.gradientStops.map(stop => stop.color),
                    this.gradientStops.map((stop, index) => util.checkValidNumber(stop.ratio, index / len)),
                    this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
                break;
            case brushTypes.bitmap:

                break;
        }
    }
}

@obs.bindable
export class textBlock extends visual {
    private _text = new createjs.Text();
    constructor() {
        super();
        this.addChild(this._text);
        this.horizontalAlignment = horizontalAlignments.center;
        this.verticalAlignment = verticalAlignments.center;
    }
    @obs.wrap(() => textBlock.prototype._text.text)
        .after(() => visual.prototype.redraw)
        .property
    public text: string;
    @obs.wrap(() => textBlock.prototype._text.color)
        .after(() => visual.prototype.redraw)
        .property
    public foreground: string;
    @obs.wrap(() => textBlock.prototype._text.font)
        .after(() => visual.prototype.redraw)
        .property
    public font: string;
    @obs.wrap(() => textBlock.prototype._text.lineWidth)
        .after(() => visual.prototype.redraw)
        .property
    public lineWidth: number;
    @obs.after(()=>textBlock.prototype.layout).event 
    redraw = () => {
        this.desiredHeight = this._text.getMeasuredHeight();
        this.desiredWidth = this._text.getMeasuredWidth();
        //this.actualHeight = this.desiredHeight;
        //this.actualWidth = this.desiredWidth;
    }
}
@obs.bindable
export class roundRect extends visual {
    constructor() {
        super();
        //this.children = [];
        //console.log('roundRect init:', this, this.children);
        this.addChild(this._shape);
        this.desiredHeight = Number.POSITIVE_INFINITY;
        this.desiredWidth = Number.POSITIVE_INFINITY;

    }
    private _shape = new createjs.Shape();

    @obs.after(() => roundRect.prototype.redraw).property
    public width: number = 100;
    @obs.after(() => roundRect.prototype.redraw).property
    public height: number = 100;

    @obs.after(() => roundRect.prototype.redraw).property
    public tl: number = 4;
    @obs.after(() => roundRect.prototype.redraw).property
    public tr: number = 4;
    @obs.after(() => roundRect.prototype.redraw).property
    public bl: number = 4;
    @obs.after(() => roundRect.prototype.redraw).property
    public br: number = 4;



    @obs.after(() => roundRect.prototype.redraw).property
    public strokeWidth: number = 1;

    @obs.after(() => roundRect.prototype.redraw).property
    public stroke: brush = obs.new(new brush(), b => (b.color = 'black'));

    @obs.after(() => roundRect.prototype.redraw).property
    public fill: brush = obs.new(new brush(), b => (b.color = 'red'));

    
    @obs.listen(() => roundRect.prototype.fill.changed, () => roundRect.prototype.stroke.changed).event
    public redraw = () => {

        //console.log(' ############ overwrite redraw called...');
        let g = this._shape.graphics;
        g.clear();
        g.setStrokeStyle(this.strokeWidth);
        this.stroke.stroke(g);
        this.fill.fill(g);
        g.drawRoundRectComplex(0, 0, this.width, this.height, this.tl, this.tr, this.br, this.bl)
            .endFill().endStroke();

        this.desiredHeight = this.height;
        this.desiredWidth = this.width;
        this.actualHeight = this.height;
        this.actualWidth = this.width;
    }

    public _count = 0;
    @obs.event
    layout = () => {
        this._count += 1;
        //console.trace(this._count, 'roundRect layout...', this.availableWidth , this.availableHeight );
        //if (this._count > 20) return; 

        if (this.height != this.availableHeight) this.height = this.availableHeight;
        if (this.width != this.availableWidth) this.width = this.availableWidth;
    }

    
}
@obs.bindable
export class gradientStop {
    @obs.after(()=>gradientStop.prototype.changed).property public color: string = 'white';
    @obs.after(() => gradientStop.prototype.changed).property public ratio: number = 0;
    @obs.event public changed  = () => { };
}


@obs.bindable
export class grid extends panel {
    @obs.default(() => ObservableArray.prototype.parent).childDefault(() => gridRow.prototype.hostArray).property
    public rows: ObservableArray<gridRow> = new ObservableArray<gridRow>();
    @obs.default(() => ObservableArray.prototype.parent).childDefault(() => gridColumn.prototype.hostArray).property
    public columns: ObservableArray<gridColumn> = new ObservableArray<gridColumn>();
    @obs.event
    layout = () => {
        //calculate rows and columns
        //need to find out auto rows and columns first, then they become fixed sizes;
        let rowUnitCount: number = 0;
        let occupiedHeight: number = 0;
        this.rows.forEach((row, index) => {
            switch (row.type) {
                case 'auto':
                    row.desiredHeight = this.viewChildren.filter(child => grid.getGridRow(child) == index).map(child => child.desiredHeight).reduce((previous, current) => Math.max(previous, current), 0);
                    row.actualHeight = Math.min(Math.max(row.desiredHeight, row.minHeight), row.maxHeight);
                    occupiedHeight += row.actualHeight;
                    break;
                case '*':
                    row.desiredHeight = this.viewChildren.filter(child => grid.getGridRow(child) == index).map(child => child.desiredHeight).reduce((previous, current) => Math.max(previous, current), 0);
                    rowUnitCount += row.height;
                    break;
                case 'pixel':
                    row.desiredHeight = row.height;
                    row.actualHeight = row.height;
                    occupiedHeight += row.actualHeight;
                    break;
            }
        });

        this.desiredHeight = this.rows.map(row => row.desiredHeight).reduce((previous, current) => previous + current, 0);
        this.desiredWidth = this.columns.map(column => column.desiredWidth).reduce((previous, current) => previous + current, 0);

        this.selfLayout();

        this.rows.forEach((row, index) => {
            if (row.type == '*') {
                row.desiredHeight = (this.availableHeight - occupiedHeight) / rowUnitCount * row.height;
                row.actualHeight = Math.min(Math.max(row.desiredHeight, row.minHeight), row.maxHeight);
                occupiedHeight += row.actualHeight;
                rowUnitCount -= row.height;
            }
        });
        let columnUnitCount: number = 0; 
        let occupiedWidth: number = 0;
        this.columns.forEach((column, index) => {
            switch (column.type) {
                case 'auto':
                    column.desiredWidth = this.viewChildren.filter(child => grid.getGridRow(child) == index).map(child => child.desiredWidth).reduce((previous, current) => Math.max(previous, current), 0);
                    column.actualWidth = Math.min(Math.max(column.desiredWidth, column.minWidth), column.maxWidth);
                    occupiedWidth += column.actualWidth;
                    break;
                case '*':
                    column.desiredWidth = this.viewChildren.filter(child => grid.getGridRow(child) == index).map(child => child.desiredWidth).reduce((previous, current) => Math.max(previous, current), 0);
                    columnUnitCount += column.width;
                    break;
                case 'pixel':
                    column.desiredWidth = column.width;
                    column.actualWidth = column.width;
                    occupiedWidth += column.actualWidth;
                    break;
            }
        });
        this.columns.forEach((column, index) => {
            if (column.type == '*') {
                column.desiredWidth = (this.availableWidth - occupiedWidth) / rowUnitCount * column.width;
                column.actualWidth = Math.min(Math.max(column.desiredWidth, column.minWidth), column.maxWidth);
                occupiedWidth += column.actualWidth;
                rowUnitCount -= column.width;
            }
        });
        //layout each of the children
        this.viewChildren.forEach(child => {
            let rowIndex = util.checkValidNumber( grid.getGridRow(child), 0);
            let columnIndex = util.checkValidNumber(grid.getGridColumn(child), 0);
            let rowSpan = 1; // util.checkValidNumber(grid.getGridRowSpan(child), 1);
            let columnSpan = 1; //util.checkValidNumber(grid.getGridColumnSpan(child), 1);

            let t = 0;
            let b = 0;
            for (let i = 0; i < Math.min(this.rows.length - 1, rowIndex + rowSpan - 1); i++) {
                if (rowIndex > i) t += this.rows[i].actualHeight;
                if (rowIndex + rowSpan > i) b += this.rows[i].actualHeight;
            }
            let l = 0;
            let r = 0;
            for (let i = 0; i < Math.min(this.columns.length - 1, columnIndex + columnSpan - 1); i++) {
                if (columnIndex > i) l += this.columns[i].actualWidth;
                if (columnIndex + columnSpan > i) r += this.columns[i].actualWidth;
            }
            let h = b - t;
            let w = r - l;
            child.offsetY = l;
            child.offsetY = t;
            child.availableWidth = w;
            child.availableHeight = h;
            child.layout();
        });
    }
    static setGridRow(obj: createjs.DisplayObject, index: number) {
        obj['@Grid.Row'] = index;
    }
    static getGridRow(obj: createjs.DisplayObject): number {
        return obj['@Grid.Row'];
    }
    static setGridColumn(obj: createjs.DisplayObject, index: number) {
        obj['@Grid.Column'] = index;
    }
    static getGridColumn(obj: createjs.DisplayObject):number  {
        return obj['@Grid.Column'];
    }
    //static setGridRowSpan(obj: createjs.DisplayObject, value: number) {
    //    obj['@Grid.RowSpan'] = value;
    //}
    //static getGridRowSpan(obj: createjs.DisplayObject): number {
    //    return obj['@Grid.RowSpan'];
    //}
    //static setGridColumnSpan(obj: createjs.DisplayObject, value: number) {
    //    obj['@Grid.ColumnSpan'] = value;
    //}
    //static getGridColumnSpan(obj: createjs.DisplayObject): number {
    //    return obj['@Grid.ColumnSpan'];
    //}
}


export enum verticalAlignments {
    center, top, bottom, stretch
}
export enum horizontalAlignments {
    center, left, right, stretch
}


/**
 * base class for the template
 */
@obs.bindable
export class template {
    /**this property allows the controls in this template to access the parent Control*/
    @obs.property
    public parentControl: any;
    @obs.observable(ObservableArray).property
    public views: ObservableArray<any>
    @obs.event //by default, this event listen to every view's change;
    public viewChanged = () => {
        console.log(' *** this.views: ', this.views.asArray());
        this.views.clear();
        console.log(' *** this.views: ', this.views.asArray());
        let defs: { [key: string]: frameworkDecorator } = this['@FrameworkService.TemplateDefinitions'];
        console.log(' *** All defs in template: ', util.reduceOf(defs, (pre, key) => pre ? (pre + ', ' + key) : key));
        for (let key in defs) {
            console.log(' *** key in defs: ', key.toString());
            let fd = defs[key];
            if (fd.type == 'view') {
                let view = this[key];
                if (view) this.views.push(view);
            }
        }

        console.log(' *** this.views: ', this.views.asArray());
    };
}


@ofs.useViewTemplate(() => control.prototype.template, () => frameworkElement.prototype.viewChildren,
    class controlTemplate extends template {

        rect = ofs
            .new(roundRect)
            .let(() => roundRect.prototype.fill, obs.new( new brush(), b=>(b.color = '#bbf') ))
            .asView<roundRect>();
        Text = ofs
            .new(textBlock)
            .let(() => textBlock.prototype.text, 'I am here')
            .let(() => textBlock.prototype.foreground, 'blue')
            .let(() => textBlock.prototype.font, '15pt Arial')
            .asView<createjs.Text>();

    }).view
export class control extends frameworkElement {
    public template: template;


}

export class contentControl extends control {
    @obs.after(()=>contentControl.prototype.contentChanged).property
    public content: Object;
    @obs.event
    public contentChanged() {
        
    }
}

export class contentPresenter extends panel {

}



export class frameworkMethodDecorator {
    

    

}




//module frameworkTest {

//    let c = new control();
//    let member = c.template['rect'];
//    console.log('control template built: ', c.viewChildren.asArray(), member, c.template.views.asArray());

//}