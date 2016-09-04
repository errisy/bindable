export class EventService<T> {
    /**
     * This is an event dispather that will trigger all event handlers that subscribed the events.
     * @param Directives it is the list of event names {method: 'command'}, then you can use Directives.method to avoid typos;
     */
    constructor(public Directives: T) {
        
    }
    protected subscribers: { [event: string]: EventSubscriber[] };
    public subscribe(event: string, disposable: IDisposable, handler: Function) {
        if (!this.subscribers) this.subscribers = {};
        if (!this.subscribers[event]) this.subscribers[event] = [];
        this.subscribers[event].push(new EventSubscriber(disposable, handler));
    }
    public unsubscribe(event: string, disposable: IDisposable) {
        if (!this.subscribers) return;
        if (this.subscribers[event]) {
            this.subscribers[event] = this.subscribers[event].filter(subscriber => subscriber.disposable !== disposable);
        }
    }
    public unsubscribeAll(disposable: IDisposable) {
        if (!this.subscribers) return;
        for (let event in this.subscribers) {
            this.subscribers[event] = this.subscribers[event].filter(subscriber => subscriber.disposable !== disposable);
        }
    }
    public emit(event: string, source: IDisposable, ignoreSource: boolean, ...args: any[]): number {
        if (!this.subscribers) return;
        if (this.subscribers[event]) {
            let validSubscribers: EventSubscriber[] = [];
            let count: number = 0;
            this.subscribers[event].forEach(subscriber => {
                if (ignoreSource && subscriber.disposable === source) return; //when source should be ignored, do send event back to the source;
                if (!subscriber.disposable.disposed) {
                    validSubscribers.push(subscriber);
                    subscriber.handler.apply(subscriber.disposable, args);
                    count += 1;
                }
            });
            this.subscribers[event] = validSubscribers;
            return count;
        }
    }
}
class EventSubscriber {
    constructor(
        public disposable: IDisposable,
        public handler: Function) {
    }
}
/**IDisposable use disposed to the service if the subscriber is still valid. disposed subscribers will be removed from the list.*/
export interface IDisposable {
    disposed: boolean;
}

//console.log('SystemJS', '__filename', __filename, __dirname);

enum EventStatus {
    none,
    before,
    bindBeforeWithCheck,
    after,
    decorator
}

export class util {
    static checkValidNumber(value: number, defaultValue: number): number {
        if (typeof value == 'string' && /^(\d+(\.\d*|)|\.\d+)$/.test(<any>value)) return Number(value);
        if (typeof value != 'number' || Number.isNaN(value)) return defaultValue;
        return value;
    }
    static appendArrayDictionary(host: { [id: string]: any[] }, appendant: { [id: string]: any[] }): { [id: string]: any[] } {
        for (let key in appendant) {
            if (!host[key]) host[key] = [];
            util.appendArray(host[key], appendant[key]);
        }
        return host;
    }
    static appendDictionary(host: { [id: string]: any }, appendant: { [id: string]: any }): { [id: string]: any[] } {
        if (!appendant) return host;
        for (let key in appendant) {
            host[key] = appendant[key];
        }
        return host;
    }
    static appendArray = (arr: any[], items: any[]) => {
        if (!items) return arr;
        Array.prototype.push.apply(arr, items);
        return arr;
    }
    static forOf(obj: Object, callback: (key: string, value: any) => any) {
        if (!obj || ! callback) return;
        for (let key in obj) {
            callback(key, obj[key]);
        }
    }
    static reduceOf<T>(obj: Object, reducer: (previous: T, key: string, value: any) => T, initial?:T):T {
        if (!obj || !reducer) return initial;
        let result = initial;
        for (let key in obj) {
            result = reducer(result, key, obj[key]);
        }
        return result;
    }
}


export interface ICheck {
    target: Object;
    checker?: (source: any, memberKey: string, ...args: any[]) => boolean;
    path?: string[];
}
export interface IPropertyChecker {
    /** source and memberKey are empty when property set is triggered by assignment; if property set is triggered by binding, source and memberKey have values. */
    (source: any, memberKey: string, newValue: any, oldValue:any): boolean;
}
 
enum invokeStatus {
    none,
    invokeBefore,
    invokeAfter,
    invokeBeforeWithCheck,
    bindBefore,
    bindBeforeWithCheckValidate,
    bindAfter,
    updateOneWayToBefore,
    updateOneWayToAfter,
    updateOneWayToBeforeWithCheckValidate,
    check,
    validate,
    decorator
}

class Trigger implements ITrigger, ICheck, IValidate {
    constructor(public decorator: memberDecorator, private shouldCheck?:boolean) {
    }
    get target(): any {
        if (!this.decorator) return;
        return this.decorator.target;
    }
    get key(): string {
        if (!this.decorator) return;
        return this.decorator.propertyKey;
    }
    get method() {
        if (!this.decorator) return;
        return this.decorator.handler;
    }
    get check(): ICheck{
        if (!this.decorator) return;
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
    }
    get validate(): IValidate {
        if (!this.decorator) return;
        if (this.shouldCheck) {
            switch (this.decorator.type) {
                case 'property':
                    return this;
                default:
                    return this.decorator;
            }
        }
        return undefined;
    }
    /**it is used when trigger is used as event or property for check*/
    get checker() {
        if (!this.decorator) return;
        return this.decorator.checkerAll;
    }
    /**it is used when trigger is used as property binding for check and validator*/
    get validator() {
        if (!this.decorator) return;
        return this.decorator.validatorAll;
    }
}
export class memberDecorator implements ICheck, IValidate {
    constructor() {
        this.triggerCheck = new Trigger(this, true);
        this.triggerOnly = new Trigger(this);
        this.type = 'method';
    }
    public target: Object;
    public propertyKey: string;
    public triggerOnly: Trigger;
    public triggerCheck: Trigger;
    public type: 'property' | 'event' | 'method';
    public isPrototype: boolean = true;
    befores: ITrigger[] = [];
    afters: ITrigger[] = [];
    checks: ICheck[] = [];
    onGets: ITrigger[] = [];
    validates: IValidate[] = [];
    bindBefores: ITrigger[] = [];
    bindAfters: ITrigger[] = [];
    beforeBindChanges: ITrigger[] = [];
    afterBindChanges: ITrigger[] = [];
    listenPaths: (string[])[]  = [];
    observePath: string[];
    observerPath: string[];
    populatePath: string[];
    populatorPath: string[];
    bindingPath: string[];
    defaultPath: string[];
    childDefaultPath: string[];
    childrenListenPaths: (string[])[] = [];
    wrapPath: string[];
    wrapConverterFrom: (value: any) => any;
    wrapConverterTo: (value: any) => any; 
    //bindingCondition: IPathSeekCondition;
    bindingPathMode: PathBindingMode;
    observableType: typeof ObservableArray;
    private realValue: any;
    validatorAll: (source: any, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any) => any;
    bindOnly: ITrigger;
    bindCheckValidate: ITrigger;
    checkerAll: (source: any, memberKey: string, decorators: memberDecorator[], ...args: any[]) => boolean;

    //the following should be initialized by 
    checker: (source: any, memberKey: string, decorators: memberDecorator[], ...args: any[]) => boolean;
    handler: (source: any, memberKey: string, decorators: memberDecorator[], args: any[]) => any;
    validator: (source: any, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any) => any;


    public observable(type: typeof ObservableArray) {
        this.observableType = type;
        return this;
    }
    /**invoker should be implemented for all cases. It is consumed by asChecker, asHandler, asValidator.*/
    public invoker: (...args: any[]) => any;
    public bindSetter: (source: Object, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any, triggerDecorators: memberDecorator[], isFromPath: boolean) => boolean;

    public clone(instance: Object): memberDecorator {
        let d = new memberDecorator();
        d.target = instance;
        d.propertyKey = this.propertyKey;
        d.isPrototype = false;
        d.type = this.type;
        d.observableType = this.observableType;
        this.befores.forEach((item:ITrigger) => {
            d.befores.push({
                target: (item.target === this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afters.forEach((item: ITrigger) => {
            d.afters.push({
                target: (item.target === this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.checks.forEach((item: ICheck) => {
            d.checks.push({
                target: (item.target === this.target) ? instance : item.target,
                checker: item.checker,
                path: item.path
            });
        });
        this.onGets.forEach((item: ITrigger) => {
            d.onGets.push({
                target: (item.target === this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.validates.forEach((item: IValidate) => {
            d.validates.push({
                target: (item.target === this.target) ? instance : item.target,
                path: item.path,
                validator: item.validator
            });
        });
        this.bindBefores.forEach((item: ITrigger) => {
            d.bindBefores.push({
                target: (item.target === this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.bindAfters.forEach((item: ITrigger) => {
            d.bindAfters.push({
                target: (item.target === this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.beforeBindChanges.forEach((item: ITrigger) => {
            d.beforeBindChanges.push({
                target: (item.target === this.target) ? instance : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afterBindChanges.forEach((item: ITrigger) => {
            d.afterBindChanges.push({
                target: (item.target === this.target) ? instance : item.target,
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
        this.listenPaths.forEach(path => d.listenPaths.push(path));
        d.childDefaultPath = this.childDefaultPath;
        this.childrenListenPaths.forEach(path => d.childrenListenPaths.push(path)); 
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
    }

    public overwrite(d: memberDecorator) {
        console.trace('%%% overwrite from => to', d.realValue, '=>', this.realValue);
        this.befores.forEach((item: ITrigger) => {
            d.befores.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afters.forEach((item: ITrigger) => {
            d.afters.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.checks.forEach((item: ICheck) => {
            d.checks.push({
                target: (item.target === this.target) ? d.target : item.target,
                checker: item.checker,
                path: item.path
            });
        });
        this.onGets.forEach((item: ITrigger) => {
            d.onGets.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.validates.forEach((item: IValidate) => {
            d.validates.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                validator: item.validator
            });
        });
        this.bindBefores.forEach((item: ITrigger) => {
            d.bindBefores.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.bindAfters.forEach((item: ITrigger) => {
            d.bindAfters.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.beforeBindChanges.forEach((item: ITrigger) => {
            d.beforeBindChanges.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        this.afterBindChanges.forEach((item: ITrigger) => {
            d.afterBindChanges.push({
                target: (item.target === this.target) ? d.target : item.target,
                path: item.path,
                method: item.method,
                check: item.check,
                validate: item.validate
            });
        });
        if (this.bindingPath && this.bindingPath.length>0) d.bindingPath = this.bindingPath;
        if (this.bindingPathMode) d.bindingPathMode = this.bindingPathMode;
        if (this.wrapPath && this.wrapPath.length>0) d.wrapPath = this.wrapPath;
        if (this.wrapConverterFrom) d.wrapConverterFrom = this.wrapConverterFrom;
        if (this.wrapConverterTo) d.wrapConverterTo = this.wrapConverterTo;
        this.listenPaths.forEach(path => d.listenPaths.push(path));
        if (this.childDefaultPath && this.childDefaultPath.length > 0) d.childDefaultPath = this.childDefaultPath;
        this.childrenListenPaths.forEach(path => d.childrenListenPaths.push(path));
        if (this.observePath && this.observePath.length > 0) d.observePath = this.observePath;
        if (this.populatePath && this.populatePath.length > 0) d.populatePath = this.populatePath;
        if (this.observerPath && this.observerPath.length>0) d.observerPath = this.observerPath;
        if (this.populatorPath && this.populatorPath.length > 0) d.populatorPath = this.populatorPath;
        if (this.defaultPath && this.defaultPath.length > 0) d.defaultPath = this.defaultPath;
        if (this.realValue !== undefined) d.realValue = this.realValue;
        if (this.observableType) d.observableType = this.observableType;
        d.type = this.type;

        return d;

    }
    public listeners: { [id: string]: listener } = {};
    public listen(...paths: ((() => any) | string | (string[]))[]) {
        Array.prototype.push.apply(this.listenPaths, paths.map(path => obp.analyzePath(path)));
        return this;
    }
    public addListen = (path: (() => any) | string | (string[])) => {
        let p = obp.analyzePath(path);
        //this.listenPaths.push(p);
        let id = p.join('');
        let lsn = new listener(p, this);
        if (this.listeners[id]) {
            //clear if exists
            this.listeners[id].clear();
            this.listeners[id].parent = undefined;
        }
        this.listeners[id] = lsn;
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
    }
    public removeListen = (path: (() => any) | string | (string[])) => {
        let p = obp.analyzePath(path);
        let id = p.join('');
        if (this.listeners[id]) {
            //clear if exists
            this.listeners[id].clear();
            this.listeners[id].parent = undefined;
            this.listeners[id] = undefined;
        }
    }
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
    private initializeListen = () => {
        this.listenPaths.forEach(path => {
            let id = path.join('');
            let lsn = new listener(path, this);
            this.listeners[id] = lsn;
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
    }
    /**
     * if the value of this property is ObservableArray, this will automatically set up its observe;
     * @param path
     * @param observer
     */
    public observe(path: (() => any) | string | (string[]), observer?: (() => any) | string | (string[]), defaultRoot?: (string | (() => any))) {
        let root = obp.analyzeMember(defaultRoot);
        if (root) {
            root = '.' + root;
        }
        else {
            root = '.parent';
        }
        this.observePath = obp.analyzePath(path);
        if(this.observePath) this.observePath.unshift(root);
        this.observerPath = obp.analyzePath(observer);
        if(this.observerPath ) this.observerPath.unshift(root);
        return this;
    }
    /**
     * if the value of this property is ObservableArray, this will automatically set up its populate
     * @param path
     * @param populator
     */
    public populate(path: (() => any) | string | (string[]), populator?: (() => any) | string | (string[]), defaultRoot?: (string | (() => any))) {
        let root = obp.analyzeMember(defaultRoot);
        if (root) {
            root = '.' + root;
        }
        else {
            root = '.parent';
        }
        this.populatePath = obp.analyzePath(path);
        if (this.populatePath) this.populatePath.unshift(root);
        this.populatorPath = obp.analyzePath(populator);
        if (this.populatorPath) this.populatorPath.unshift(root);
        return this;
    }
    public before = (path: (() => any) | string | (string[])): memberDecorator => {
        this.befores.push({ target: 'self', path: obp.analyzePath(path) });
        return this;
    }
    public after = (path: (() => any) | string | (string[])): memberDecorator => {
        this.afters.push({ target: 'self', path: obp.analyzePath(path) });
        return this;
    } 
    public beforeBindChange = (path: (() => any) | string | (string[])): memberDecorator => {
        this.beforeBindChanges.push({ target: 'self', path: obp.analyzePath(path)});
        return this;
    }
    public afterBindChange = (path: (() => any) | string | (string[])): memberDecorator => {
        this.afterBindChanges.push({ target: 'self', path: obp.analyzePath(path)});
        return this;
    } 

    public check = (path: (() => any) | string | (string[])): memberDecorator => {
        this.checks.push({ target: 'self', path: obp.analyzePath(path)});
        return this;
    }
    public onGet = (path: (() => any) | string | (string[])): memberDecorator => {
        this.onGets.push({ target: 'self', path: obp.analyzePath(path)});
        return this;
    }
    public validate = (validator: () => (source: any, memberKey: string, newValue: any, oldValue: any) => any) => {
        this.validates.push({ target: 'self', validator: validator });
        return this;
    }
    /** use as path(()=>HostType.prototype.property.property1.property2...) */
    public bind = (value: (() => any) | string | (string[]), mode?: PathBindingMode) => {
        this.bindingPath = obp.analyzePath(value);
        this.bindingPathMode = mode?mode:PathBindingMode.bind;
        //this.bindingCondition = condition;
        return this;
    }
    public syncFrom = (value: (() => any) | string | (string[])) => {
        this.bindingPath = obp.analyzePath(value);
        this.bindingPathMode = PathBindingMode.syncFrom;
        return this;
    }
    public updateTo = (value: (() => any) | string | (string[])) => {
        this.bindingPath = obp.analyzePath(value);
        this.bindingPathMode = PathBindingMode.updateTo;
        return this;
    }
    /** those are the notifiers that send to each of the property in the path. Its target will be set to undefined when the path changed so that the properties can drop it off automatically. */
    private bindingPathChangedTrigger: ITrigger;
    public setBindingPath = (value: (() => any) | string | (string[]), mode: PathBindingMode) => {
        
        let triggerArgs = [this.target, this.propertyKey + ':BeforeBindPathChange', [], value, this.bindingPath];
        this.beforeBindChanges.forEach(trigger => {
            if (trigger && !obs.isDisposed(trigger.target)) {
                obp.invokeTrigger(trigger, triggerArgs);
                return true;
            }
            return false;
        });
        //disable old trigger by set target to null;
        if (this.bindingPathChangedTrigger) this.bindingPathChangedTrigger.target = undefined;

        this.bindingPath = obp.analyzePath (value);
        this.bindingPathMode = mode;
        //this.bindingCondition = condition;

        // set up new binding;
        if (this.bindingPath && this.bindingPath.length > 0) {
            this.bindingPathChangedTrigger = {
                target: this,
                method: this.bindingPathChanged
            };

            if (this.bindingPath) obp.setPathChangedTrigger(this.target, this.bindingPath, this.bindingPathChangedTrigger);

            let newSource = obp.getPathSourceKeyValue(this.target, this.bindingPath);

            obp.invokeTrigger(this.triggerOnly, [newSource.source, newSource.key, [], newSource.value, this.RealValue]);
        }
        this.afterBindChanges.forEach(trigger => {
            if (trigger && !obs.isDisposed(trigger.target)) {
                obp.invokeTrigger(trigger, triggerArgs);
                return true;
            }
            return false;
        });
    }

    private bindingPathChanged = (source:Object, key: string, decorators: memberDecorator[])=> {
        if (this.bindingPathChangedTrigger) this.bindingPathChangedTrigger.target = undefined;
        this.bindingPathChangedTrigger = {
            target: this,
            method: this.bindingPathChanged
        };
        if (!this.bindingPath || this.bindingPath.length == 0) return;
        obp.setPathChangedTrigger(this.target, this.bindingPath, this.bindingPathChangedTrigger);
        let newSource = obp.getPathSourceKeyValue(this.target, this.bindingPath);
        obp.invokeTrigger(this.triggerOnly, [newSource.source, newSource.key, [], newSource.value , this.RealValue]);
    }
    private initializeBindingPath() {
        if (this.bindingPath && this.bindingPath.length > 0) {
            let triggerArgs = [this.target, this.propertyKey + ':BeforeBindPathChange', [], this.bindingPath, undefined];
            this.bindingPathChangedTrigger = {
                target: this,
                method: this.bindingPathChanged
            };

            obp.setPathChangedTrigger(this.target, this.bindingPath, this.bindingPathChangedTrigger);

            let newSource = obp.getPathSourceKeyValue(this.target, this.bindingPath);

            obp.invokeTrigger(this.triggerOnly, [newSource.source, newSource.key, [], newSource.value, this.RealValue]);

            this.afterBindChanges.forEach(trigger => {
                if (trigger && !obs.isDisposed(trigger.target)) {
                    obp.invokeTrigger(trigger, triggerArgs);
                    return true;
                }
                return false;
            });
        }
    }
    /**
     * Set path of decorated property object to the host object;
     * this is useful when child.parent needs to synchronize with parent.root
     * obs.@defaultProperty(()=>parent) child: ChildType; then when an object is assigned to 'child' property, the host object will be assigned to its 'parent' property.;
     * @param path
     */
    default(path: (() => any) | string | (string[])) {
        console.log('analyzed default path:', obp.analyzePath(path), path.toString());
        this.defaultPath = obp.analyzePath(path);
        return this;
    }
    childDefault(path: (() => any) | string | (string[])) {
        this.childDefaultPath = obp.analyzePath(path);
        return this;
    }
    listenChildren(...paths: ((() => any) | string | (string[]))[]) {
        Array.prototype.push.apply(this.childrenListenPaths, paths.map(path=>obp.analyzePath(path)));
        return this;
    }
    /**
     * wrap the path as a property, no value will be kept here;
     * @param path
     * @param forceType
     */
    wrap(path: (() => any) | string | (string[]), convertFrom?:(value: any)=>any, convertTo?: (value: any)=>any) {
        this.wrapPath = obp.analyzePath(path);
        this.wrapConverterFrom = convertFrom;
        this.wrapConverterTo = convertTo;
        return this;
    }
    public get RealValue(): any {
        if (this.wrapPath) {
            let value = obp.getPathValue(this.target, this.wrapPath);
            if (this.wrapConverterFrom) value = this.wrapConverterFrom(value);
            return value;
        }
        else {
            return this.realValue;
        }
    }
    private clearValuePaths = (value: Object) => {
        if (!this.target || !obs.isInitialized(this.target)) return;
        if (!value) return;
        if (this.defaultPath) {
            //console.log('----- Clear defaultPath for RealValue -----');
            obp.setPathValue(value, this.defaultPath, undefined, undefined, this.propertyKey);
        }
        if (obs.isObservableArray(value)) {
            if (this.childDefaultPath) {
                (<ObservableArray<any>>value).childDefaultPath = undefined;
            }
            if (this.childrenListenPaths && this.childrenListenPaths.length > 0) {
                (<ObservableArray<any>>value).childrenListenPaths = [];
            }
            if (this.observePath) {
                //console.log('----- Clear observePath for RealValue -----');
                let observationSource = obs.getDecorator(value, 'observationSource', true);
                if (observationSource) observationSource.setBindingPath(undefined, PathBindingMode.syncFrom);
            }
            if (this.observerPath) {
                //console.log('----- Clear observerPath for RealValue -----');
                let observationSource = obs.getDecorator(value, 'observer', true);
                if (observationSource) observationSource.setBindingPath(undefined, PathBindingMode.syncFrom);
            }
            if (this.populatePath) {
                //console.log('----- Clear populatePath for RealValue -----');
                let populationTarget = obs.getDecorator(value, 'populationTarget', true);
                if (populationTarget) populationTarget.setBindingPath(undefined, PathBindingMode.syncFrom);
            }
            if (this.populatorPath) {
                //console.log('----- Clear populatorPath for RealValue -----');
                let populationTarget = obs.getDecorator(value, 'populator', true);
                if (populationTarget) populationTarget.setBindingPath(undefined, PathBindingMode.syncFrom);
            }
        }
    }
    private setValuePaths = (value: Object) => {

        if (!this.target || !obs.isInitialized(this.target)) return;
        if (!value) return;
        if (this.defaultPath) {
            console.log('----- Set defaultPath for RealValue -----', this.target);
            obp.setPathValue(value, this.defaultPath, this.target, this.target, this.propertyKey);
            //debug.logPropertyDecorators(value);
        }
        if (obs.isObservableArray(value)) {
            if (this.childDefaultPath) {
                (<ObservableArray<any>>value).childDefaultPath = this.childDefaultPath;
            }
            //console.log('childrenListenPaths', this.childrenListenPaths);
            if (this.childrenListenPaths && this.childrenListenPaths.length > 0) {
                //console.log('set childrenListenPaths');
                (<ObservableArray<any>>value).childrenListenPaths = this.childrenListenPaths;
            }
            if (this.observePath) {
                //if (this.propertyKey == 'products') console.log('----- Set observePath for RealValue -----');
                let observationSource = obs.getDecorator(value, 'observationSource', true);
                if (observationSource) observationSource.setBindingPath(this.observePath, PathBindingMode.syncFrom);
            }
            if (this.observerPath) {
                //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
                let observationSource = obs.getDecorator(value, 'observer', true);
                if (observationSource) observationSource.setBindingPath(this.observerPath, PathBindingMode.syncFrom);
            }
            if (this.populatePath) {
                //if (this.propertyKey == 'products') console.log('----- Set populatePath for RealValue -----');
                let populationTarget = obs.getDecorator(value, 'populationTarget', true);
                if (populationTarget) populationTarget.setBindingPath(this.populatePath, PathBindingMode.syncFrom);
            }
            if (this.populatorPath) {
                //if (this.propertyKey == 'products') console.log('----- Set populatorPath for RealValue -----');
                let populationTarget = obs.getDecorator(value, 'populator', true);
                if (populationTarget) populationTarget.setBindingPath(this.populatorPath, PathBindingMode.syncFrom);
            }
        }
    }
    public set RealValue(value: any) {

        if (this.propertyKey == 'value') {
            console.trace('~~~ set value: ', value);
            decoratorlist.push(this);
        }
        if (this.wrapPath) {
            //console.log('set wrap value', value, this.wrapPath);
            if (this.wrapConverterTo) value = this.wrapConverterTo(value);
            let oldValue = obp.getPathValue(this.target, this.wrapPath);
            this.clearValuePaths(oldValue);
            obp.setPathValue(this.target, this.wrapPath, value, this.target, this.propertyKey);
            this.setValuePaths(value);
        }
        else {
            this.clearValuePaths(this.realValue);
            this.realValue = value;
            this.setValuePaths(this.realValue);
        }
    }

    private invokeCheck(check: ICheck, args: any[]): boolean {
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
    }
    private invokeValidate(validate: IValidate, args: any[]) {
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
    }
    private replaceSelf = (target: Object, propertyKey: string) => {
        this.target = target;
        this.propertyKey = propertyKey;
        this.befores.forEach(trigger => {
            if (trigger.target == 'self') trigger.target = target;
        });
        this.afters.forEach(trigger => {
            if (trigger.target == 'self') trigger.target = target;
        });
        this.checks.forEach(check => {
            if (check.target == 'self') check.target = target;
        });
        this.validates.forEach(validate => {
            if (validate.target == 'self') validate.target = target;
        });
    }

    public instantiated: boolean; 
    /**
     * Call this when instance has been created.
     */
    public instantiate = () => {
        switch (this.type) {
            case 'property':
                this.property(this.target, this.propertyKey);
                break;
            case 'event':
                this.event(this.target, this.propertyKey);
                break;
            case 'method':
                this.method(this.target, this.propertyKey);
                break;
        }
        this.setValuePaths(this.RealValue);
        this.initializeBindingPath();
        this.initializeListen();
        this.blocking = false;
        this.instantiated = true;
    }
    private initialize = () => {
        if (this.isPrototype) this.target['@ObjectService.Prototype'] = true;
    }
    public property = (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => {
        if (obs.disabled) return; //do not replace the property definition when it is disabled;
        //console.log('propert: ', target);
        this.replaceSelf(target, propertyKey);
        obs.setDecorator(target, propertyKey, this).initializeProperty(target, propertyKey, descriptor);
    }
    //private bindSetter: IBindSetter;
    private initializeProperty = (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => {

        //console.log('****** Initialize Property ' + propertyKey, this.isPrototype, this);
        let that = this;
        this.initialize();
        this.type = 'property';
        // this.initializeBindingPath(); should do this when Object is instance
        this.validatorAll = (source: any, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any): any => {
            if (decorators.some(dc => dc === that)) return newValue;
            decorators.push(that);
            that.validates.forEach(vali => {
                newValue = that.invokeValidate(vali, [source, memberKey, decorators, newValue, oldValue]);
            });
            return newValue;
        };
        this.checkerAll = (source: any, memberKey: string, decorators: memberDecorator[], ...args: any[]): boolean => {
            if (decorators.some(dc => dc === that)) return true;
            decorators.push(that);
            let checkerAllArguments: any[] = [source, memberKey, decorators];
            if (args && obs.isArray(args)) args.forEach(arg => checkerAllArguments.push(arg));
            return that.checks.every(check => that.invokeCheck(check, checkerAllArguments));
        };
        this.bindSetter = (source: Object, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any, triggerDecorators: memberDecorator[], isFromPath :boolean):boolean => {
            if (this.blocking) {
                that.RealValue = newValue;
            }
            else{
                //make sure it is only called once:
                if (!obs.isArray(decorators)) decorators = [];
                if (decorators.some(dc => dc === that)) return true;
                decorators.push(that);
                //check value; source and memberKey are undefined when the setter is triggered by assignment; 
                if (!that.checkerAll.apply(undefined, [source, memberKey, [], newValue, that.RealValue])) return false;//set is rejected when check is not passed.
                //validate value
                newValue = that.validatorAll.apply(target, [source, memberKey, [], newValue, that.RealValue]);

                //set source and memerKey as the current one if they are empty;
                if (source === undefined) source = target;
                if (memberKey === undefined) memberKey = propertyKey;
                if (oldValue === undefined) oldValue = that.RealValue;
                //call bindBefores;
                let triggerCheckDecorators: memberDecorator[] = [];
                let triggerValidateDecorators: memberDecorator[] = [];
                if (!that.bindBefores.every(trigger => {
                    if (trigger.check && trigger.check.target && !obs.isDisposed(trigger.check.target)) {
                        if (!that.invokeCheck(trigger.check, [source, memberKey, triggerCheckDecorators, newValue, oldValue])) return false;
                    }
                    if (trigger.validate) {
                        newValue = that.invokeValidate(trigger.validate, [source, memberKey, triggerValidateDecorators, newValue, oldValue]);//  trigger.validate.validator.apply(trigger.validate.target, [newValue, oldValue]);
                    }
                    return true;
                })) return false; //rejected by bind checks
                let bindingArgs = [source, memberKey, decorators, newValue, oldValue];
                if (!obs.isArray(triggerDecorators)) triggerDecorators = [];
                let triggerArgs = [source, memberKey, triggerDecorators, newValue, oldValue];
                //console.log('bind setter args for trigger: ' + propertyKey, bindingArgs, newValue, that.befores, that.afters);
                that.befores = that.befores.filter(trigger => {
                    if (trigger && !obs.isDisposed(trigger.target)) {
                        //perform checks if there are any
                        //trigger.method.apply(trigger.target, args);
                        obp.invokeTrigger(trigger, triggerArgs);
                        return true;
                    }
                    return false;
                });
                that.bindBefores = that.bindBefores.filter(trigger => {
                    if (trigger.target && !obs.isDisposed(trigger.target)) {
                        //trigger.method.apply(trigger.target, args);
                        obp.invokeTrigger(trigger, bindingArgs);
                        return true;
                    }
                    return false;
                });

                that.RealValue = newValue;
                if (!isFromPath) switch (that.bindingPathMode) {
                    case PathBindingMode.bind:
                    case PathBindingMode.updateTo:
                        obp.setPathValue(target, that.bindingPath, newValue, target, propertyKey);
                        break;
                }
                //call bindAfters;
                that.bindAfters = that.bindAfters.filter(trigger => {
                    if (trigger.target && !obs.isDisposed(trigger.target)) {
                        //trigger.method.apply(trigger.target, args);
                        obp.invokeTrigger(trigger, bindingArgs);
                        return true;
                    }
                    return false;
                });
                that.afters = that.afters.filter(trigger => {
                    if (trigger && !obs.isDisposed(trigger.target)) {
                        //trigger.method.apply(trigger.target, args);
                        obp.invokeTrigger(trigger, triggerArgs);
                        return true;
                    }
                    return false;
                });
            }
            return true;
        };
        this.invoker = (...args: any[]) => {
            if (that.blocking) return;
            if (obs.isFunction(that.RealValue)) return (<Function>(that.RealValue)).apply(target, args);
            return;
        };
        //the real setter for the property descriptor;
        let setter = (value: any) => {
            //console.log('property setter [' + that.propertyKey + ']', value);
            switch (obs.statusStack[0]) {
                case invokeStatus.bindBefore:
                    //console.log('setter bind before: ', target, propertyKey);
                    if (value) that.bindBefores.push(value);
                    if ((<ITrigger>value).decorator) {
                        (<ITrigger>value).decorator.bindBefores.push(that.bindOnly);
                    }
                    break;
                case invokeStatus.bindBeforeWithCheckValidate:
                    //console.log('setter bind before: ', target, propertyKey);
                    if (value) that.bindBefores.push(value);
                    if ((<ITrigger>value).decorator) {
                        (<ITrigger>value).decorator.bindBefores.push(that.bindCheckValidate);
                    }
                    break;
                case invokeStatus.bindAfter:
                    //console.log('setter bind after: ', target, propertyKey);
                    if (value) that.bindAfters.push(value);
                    if ((<ITrigger>value).decorator) {
                        (<ITrigger>value).decorator.bindAfters.push(that.bindOnly);
                    }
                    break;
                case invokeStatus.updateOneWayToBeforeWithCheckValidate:
                case invokeStatus.updateOneWayToBefore:
                    //console.log('setter bind before: ', target, propertyKey);
                    if (value) that.bindBefores.push(value);
                    break;
                case invokeStatus.updateOneWayToAfter:
                    //console.log('setter bind after: ', target, propertyKey);
                    if (value) that.bindAfters.push(value);
                    break;
                case invokeStatus.check:
                    if (value) that.checks.push(value);
                case invokeStatus.validate:
                    if (value) that.validates.push(value);
                case invokeStatus.none:
                default:
                    //it calls the bind setter;
                    that.bindSetter.apply(target, [undefined, undefined, [], value, that.RealValue]);
            }
        };
        let iValidatorAll: IValidate = { target: target, validator: this.validatorAll };
        this.bindOnly = { target: target, method: this.bindSetter, decorator: that};
        this.bindCheckValidate = { target: target, method: this.bindSetter, validate: iValidatorAll, decorator: that };
        this.checker = (source: any, memberKey: string, decorators: memberDecorator[], ...args: any[]): boolean => {
            if (decorators.some(dc => dc === that)) return true;
            decorators.push(that);
            if (obs.isFunction(that.RealValue)) {
                let checkerArgs: any[] = [source, memberKey, decorators];
                if (args && obs.isArray(args)) args.forEach(arg => checkerArgs.push(arg));
                return (<Function>(that.RealValue)).apply(target, checkerArgs);
            }
            return true;
        }
        this.validator = (source: any, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any): any => {
            if (decorators.some(dc => dc === that)) return newValue;
            decorators.push(that);
            if (obs.isFunction(that.RealValue)) newValue = (<Function>(that.RealValue)).apply(target, [source, memberKey, decorators, newValue, oldValue]);
            return newValue;
        }
        //this is for trigger only, it will trigger the check of binding path value
        this.handler = (source: any, memberKey: string, decorators: memberDecorator[], args: any[]) => {
            if (decorators.some(dc => dc === that)) return;
            decorators.push(that);
            switch (this.bindingPathMode) {
                case PathBindingMode.bind:
                case PathBindingMode.syncFrom:
                    //syncFrom:
                    let newValue = obp.getPathValue(that.target, that.bindingPath);
                    //console.log('trigger property from handler: ', source, memberKey, decorators, newValue, that.realValue);
                    that.bindSetter.apply(that.target, [source, memberKey, [], newValue, that.RealValue, decorators, true]);
                    break;
                case PathBindingMode.updateTo:
                    //update:
                    obp.setPathValue(that.target, that.bindingPath, that.realValue, that.target, that.propertyKey);
                    break;
            }

        }            ;//use bind setter to update value;
        //this.handler = (source: any, memberKey: string, args: any[]) => {
        //    if (obs.isFunction(that.realValue)) return (<Function>(that.realValue)).apply(target, args);
        //    return undefined;
        //};
        let getter = () => {
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
                    that.onGets = that.onGets.filter(trigger => {
                        if (trigger && !obs.isDisposed(trigger.target)) {
                            //perform checks if there are any
                            obp.invokeTrigger(trigger, [target, propertyKey, []]);
                            return true;
                        }
                        return false;
                    });
                    return that.RealValue;
            }
        }

        //this.initializeListen();
        if (descriptor) {
            descriptor.configurable = true;
            that.bindSetter.apply(target, [undefined, undefined, [],descriptor.value, undefined]);
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
        if (this.observableType) { //initialize the observable array type
            let newArray:any[] = obs.makeObservable(new (Function.prototype.bind.apply(this.observableType, [])));
            if (obs.isArray(this.realValue)) {
                //should add existing values to the new one:
                let existing: any[];
                util.appendArray(newArray, existing);
            }
            console.log(' *** set obervable array type instance from decorator');
            that.bindSetter.apply(target, [undefined, undefined, [], newArray, undefined]);
        }
    }
    private blocking: boolean = false;
    public suspend = () => {
        this.blocking = true; 
    }
    public resume = () => {
        this.blocking = false;
    }
    public event = (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => {
        if (obs.disabled) return;
        this.replaceSelf(target, propertyKey);
        obs.setDecorator(target, propertyKey, this).initializeEvent(target, propertyKey, descriptor);
        //console.log('event decorator : ', propertyKey, this.listenPaths);
    }
    public initializeEvent = (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => {

        let that = this;
        this.initialize();
        this.type = 'event';
        that.checkerAll = (source: any, memberKey: string, decorators: memberDecorator[], ...args: any[]): boolean => {
            if (decorators.some(dc => dc === that)) return true;
            decorators.push(that);
            let checkerAllArguments: any[] = [source, memberKey, decorators];
            if (args && obs.isArray(args)) args.forEach(arg => checkerAllArguments.push(arg));
            return that.checks.every(check => that.invokeCheck(check, checkerAllArguments));
        };
        
        //this is the real trigger provided by the getter; it contains source and memberKey so as to allow checks;
        let invoker = (source: any, memberKey: string, decorators: memberDecorator[], args: any[]) => {
            if (!obs.isArray(decorators)) decorators = [];
            if (decorators.some(dc => dc === that)) return;
            decorators.push(that);
            let checkerArgs: any[] = [source, memberKey, []];
            if (args && obs.isArray(args)) args.forEach(arg => checkerArgs.push(arg));

            //check my own
            if (!that.checkerAll.apply(undefined, checkerArgs)) return undefined;

            //set source and memerKey as the current one if they are empty;
            if (checkerArgs[0] === undefined) checkerArgs[0] = target;
            if (checkerArgs[1] === undefined) checkerArgs[1] = propertyKey;

            if (!that.befores.every(trigger => {
                if (trigger.check && trigger.check.target && !obs.isDisposed(trigger.check.target)) {
                    return that.invokeCheck(trigger.check, checkerArgs);
                }
                return true;
            })) return undefined;

            let triggerArgs = [source, memberKey, decorators];
            if (args && obs.isArray(args)) args.forEach(arg => triggerArgs.push(arg));

            that.befores = that.befores.filter(trigger => {
                if (trigger && !obs.isDisposed(trigger.target)) {
                    //perform checks if there are any
                    obp.invokeTrigger(trigger, triggerArgs);
                    return true;
                }
                return false;
            });

            let result: any;
            //console.log('event invoker - begin invoke realValue: ', target, propertyKey, that.realValue, args);
            //console.log('event invoker - is function?: ', obs.isFunction(that.realValue), typeof that.realValue);
            if (obs.isFunction(that.RealValue)) result = that.RealValue.apply(target, args); // do not invoke if value is not a function;
            
            that.afters = that.afters.filter(trigger => {
                if (trigger && !obs.isDisposed(trigger.target)) {
                    obp.invokeTrigger(trigger, triggerArgs);
                    return true;
                }
                return false;
            });
            return result;
        };

        this.invoker = (...args: any[]): any => {
            if (obp.isEventProxy(this.target)) console.log('EventProxy is invoked!!!');
            if (that.blocking) return; //block the event if it is blocking;
            //source and memberKey are undefined when called directly.
            //console.log('invoking event method: ', target, propertyKey);
            return invoker.apply(undefined, [undefined, undefined, [], args]);
        };

        this.checker = (source: any, memberKey: string, decorators: memberDecorator[], ...args: any[]): boolean => {
            if (decorators.some(dc => dc === that)) return true;
            decorators.push(that);
            if (obs.isFunction(that.RealValue)) {
                let checkerArgs: any[] = [source, memberKey, decorators];
                if(args && obs.isArray(args)) args.forEach(arg => checkerArgs.push(arg));
                return (<Function>(that.RealValue)).apply(target, checkerArgs);
            }
            return true;
        }
        this.validator = (source: any, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any): any => {
            if (decorators.some(dc => dc === that)) return newValue;
            decorators.push(that);
            if (obs.isFunction(that.RealValue)) newValue = (<Function>(that.RealValue)).apply(target, [source, memberKey, decorators, newValue, oldValue]);
            return newValue;
        }
        this.handler = invoker;
        let getter = (): any => {
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
                default: //by default, returns the method with the same signature as the realValue; but it will call the invoker;
                    that.onGets = that.onGets.filter(trigger => {
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
        this.bindSetter = (source: any, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any, triggerDecorators: memberDecorator[]): boolean => {
            if (!obs.isArray(decorators)) decorators = [];
            if (decorators.some(dc => dc === that)) return true;
            decorators.push(that);
            //check value; source and memberKey are undefined when the setter is triggered by assignment; 
            if (!that.checkerAll.apply(undefined, [source, memberKey, [], newValue, oldValue])) return false;//set is rejected when check is not passed.
            //validate value
           
            //newValue = that.validatorAll.apply(target, [source, memberKey, newValue, oldValue]); !! this is no validator

            //set source and memerKey as the current one if they are empty;
            if (source === undefined) source = target;
            if (memberKey === undefined) memberKey = propertyKey;
            if (oldValue === undefined) oldValue = that.RealValue;
            //call bindBefores;
            if (!that.bindBefores.every(trigger => {
                if (trigger.check && trigger.check.target && !obs.isDisposed(trigger.check.target)) {
                    if (!trigger.check.checker.apply(trigger.check.target, [source, memberKey, [], newValue, oldValue])) return false;
                }
                if (trigger.validate) {
                    newValue = trigger.validate.validator.apply(trigger.validate.target, [newValue, oldValue]);
                }
                return true;
            })) return false; //rejected by bind checks
            let args = [source, memberKey, decorators, newValue, oldValue];
            that.bindBefores = that.bindBefores.filter(trigger => {
                if (trigger.target && !obs.isDisposed(trigger.target)) {
                    trigger.method.apply(trigger.target, args);
                    return true;
                }
                return false;
            });
            that.RealValue = newValue;
            //call bindAfters;
            that.bindAfters = that.bindAfters.filter(trigger => {
                if (trigger.target && !obs.isDisposed(trigger.target)) {
                    trigger.method.apply(trigger.target, args);
                    return true;
                }
                return false;
            });
            return true;
        };
        let setter = (value: any) => {
            switch (obs.statusStack[0]) {
                case invokeStatus.invokeBefore:
                    if (value) that.befores.push(value);
                    break;
                case invokeStatus.invokeAfter:
                    if (value) that.afters.push(value);
                    break;
                case invokeStatus.check:
                    if (value) that.checks.push(value);
                case invokeStatus.validate:
                    if (value) that.validates.push(value);
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
    }
    /**method will enable interfaces for invokeBefore, invokeAfter, check, validate */
    public method = (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => {
        //console.log('target ', target, propertyKey); 
        if (obs.disabled) return;
        this.replaceSelf(target, propertyKey);
        obs.setDecorator(target, propertyKey, this).initializeMethod(target, propertyKey, descriptor);
    }
    private initializeMethod = (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => {
        let that = this;
        this.initialize();
        this.type = 'method';
        this.checker = (source: any, memberKey: string, decorators: memberDecorator[], ...args: any[]): boolean => {
            if (decorators.some(dc => dc === that)) return true;
            decorators.push(that);
            if (obs.isFunction(that.RealValue)){
                let checkerArgs: any[] = [source, memberKey, decorators];
                if (args && obs.isArray(args)) args.forEach(arg => checkerArgs.push(arg));
                return (<Function>(that.RealValue)).apply(target, checkerArgs);
            }
            return true;
        }
        this.validator = (source: any, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any): any => {
            if (decorators.some(dc => dc === that)) return newValue;
            decorators.push(that);
            if (obs.isFunction(that.RealValue)) newValue = (<Function>(that.RealValue)).apply(target, [source, memberKey, decorators, newValue, oldValue]);
            return newValue;
        }
        this.handler = (source: any, memberKey: string, decorators: memberDecorator[], args: any[]) => {
            if (decorators.some(dc => dc === that)) return;
            decorators.push(that);
            if (obs.isFunction(that.RealValue)) return (<Function>(that.RealValue)).apply(target, args);
            return;
        };
        this.invoker = (...args: any[]) => {
            if (that.blocking) return;
            if (obs.isFunction(that.RealValue)) return (<Function>(that.RealValue)).apply(target, args);
            return;
        }
        let getter = (): any => {
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
                default: //by default, returns the method with the same signature as the realValue; but it will call the invoker;
                    return that.invoker;
            }
        }
        this.bindSetter = (source: Object, memberKey: string, decorators: memberDecorator[], newValue: any, oldValue: any, triggerDecorators: memberDecorator[], isFromPath: boolean): boolean => {
            that.RealValue = newValue;
            return true;
        }
        let setter = (value: any) => {
            that.RealValue = value;
        };
        //this.initializeListen();
        if (descriptor) {
            descriptor.configurable = true;
            this.RealValue = descriptor.value;
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
    }
    /**Obtain all information from new decorator.*/
    public allocate = (newDecorator: memberDecorator) => {
        let old = this.target;
        this.target = newDecorator.target;
        this.propertyKey = newDecorator.propertyKey;
        let target = this.target;
        this.befores.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.afters.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.bindBefores.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.bindAfters.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.beforeBindChanges.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.afterBindChanges.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.onGets.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.checks.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        this.validates.forEach(item => {
            if (item.target === old || item.target == 'self') item.target = target;
        });
        newDecorator.befores.forEach(item => this.befores.push(item));
        newDecorator.afters.forEach(item => this.afters.push(item));
        newDecorator.bindBefores.forEach(item => this.bindBefores.push(item));
        newDecorator.bindAfters.forEach(item => this.bindAfters.push(item));
        newDecorator.beforeBindChanges.forEach(item => this.beforeBindChanges.push(item));
        newDecorator.afterBindChanges.forEach(item => this.afterBindChanges.push(item));
        newDecorator.onGets.forEach(item => this.onGets.push(item));
        newDecorator.checks.forEach(item => this.checks.push(item));
        newDecorator.validates.forEach(item => this.validates.push(item));
        newDecorator.listenPaths.forEach(item => this.listenPaths.push(item));
        newDecorator.childrenListenPaths.forEach(item => this.childrenListenPaths.push(item));
        if (newDecorator.observePath && newDecorator.observePath.length > 0) this.observePath = newDecorator.observePath;
        if (newDecorator.observerPath && newDecorator.observerPath.length > 0) this.observerPath = newDecorator.observerPath;
        if (newDecorator.populatePath && newDecorator.populatePath.length > 0) this.populatePath = newDecorator.populatePath;
        if (newDecorator.populatorPath && newDecorator.populatorPath.length > 0) this.populatorPath = newDecorator.populatorPath;
        if (newDecorator.observableType) this.observableType = newDecorator.observableType;
    }
    public applyDecorator(d: memberDecorator) {
        if (!this.propertyKey) this.propertyKey = d.propertyKey;
        if (!this.target) this.target = d.target;
        let target = this.target;
        d.befores.forEach(item => {
            this.befores.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        d.afters.forEach(item => {
            this.afters.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        d.bindBefores.forEach(item => {
            this.bindBefores.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        d.bindAfters.forEach(item => {
            this.bindAfters.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.beforeBindChanges.forEach(item => {
            this.beforeBindChanges.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.afterBindChanges.forEach(item => {
            this.afterBindChanges.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.onGets.forEach(item => {
            this.onGets.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, method: item.method, path: item.path, check: item.check, decorator: item.decorator, validate: item.validate });
        });
        this.checks.forEach(item => {
            this.checks.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target, checker: item.checker, path: item.path });
        });
        this.validates.forEach(item => {
            this.validates.push({ target: (item.target === d.target || item.target == 'self') ? target : item.target,  path: item.path, validator: item.validator });
        });
        
        d.listenPaths.forEach(item => this.listenPaths.push(item));
        if (d.childDefaultPath) this.childDefaultPath = d.childDefaultPath;
        d.childrenListenPaths.forEach(item => this.childrenListenPaths.push(item));
        if (d.observableType) this.observableType = d.observableType;
        if (d.observePath && d.observePath.length > 0) this.observePath = d.observePath;
        if (d.observerPath && d.observerPath.length > 0) this.observerPath = d.observerPath;
        if (d.populatePath && d.populatePath.length > 0) this.populatePath = d.populatePath;
        if (d.populatorPath && d.populatorPath.length > 0) this.populatorPath = d.populatorPath;
        // the following should have different behavior for instantiated and non-instantiated;
        if (this.instantiated) {
            if (d.bindingPath && d.bindingPath.length > 0) this.setBindingPath(d.bindingPath, d.bindingPathMode);
            d.listenPaths.forEach(item => this.addListen(item));
            if (obs.isObservableArray(this.RealValue)) {
                let oa: ObservableArray<any> = this.RealValue;
                if (d.childDefaultPath) oa.childDefaultPath = this.childDefaultPath;
                d.childrenListenPaths.forEach(path => oa.listenChildren(path));
                if (this.observePath) {
                    //if (this.propertyKey == 'products') console.log('----- Set observePath for RealValue -----');
                    let observationSource = obs.getDecorator(oa, 'observationSource', true);
                    if (observationSource) observationSource.setBindingPath(this.observePath, PathBindingMode.syncFrom);
                }
                if (this.observerPath) {
                    //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
                    let observationSource = obs.getDecorator(oa, 'observer', true);
                    if (observationSource) observationSource.setBindingPath(this.observerPath, PathBindingMode.syncFrom);
                }
                if (this.populatePath) {
                    //if (this.propertyKey == 'products') console.log('----- Set populatePath for RealValue -----');
                    let populationTarget = obs.getDecorator(oa, 'populationTarget', true);
                    if (populationTarget) populationTarget.setBindingPath(this.populatePath, PathBindingMode.syncFrom);
                }
                if (this.populatorPath) {
                    //if (this.propertyKey == 'products') console.log('----- Set populatorPath for RealValue -----');
                    let populationTarget = obs.getDecorator(oa, 'populator', true);
                    if (populationTarget) populationTarget.setBindingPath(this.populatorPath, PathBindingMode.syncFrom);
                }
            }
        }
        else {
            if (d.bindingPath && d.bindingPath.length > 0) this.bindingPath = d.bindingPath;
            if (d.bindingPathMode) this.bindingPathMode = d.bindingPathMode;
        }

    }
    public setDefault = (path: (() => any) | string | (string[])) => {
        this.default(path);
        let value: any = this.RealValue;
        if (this.defaultPath && this.defaultPath.length > 0) {
            console.log('setting default path ', this.defaultPath.join(''), value, this.target);
            obp.setPathValue(value, this.defaultPath, this.target, this.target, this.propertyKey);
        }
    }
    public setChildDefault = (path: (() => any) | string | (string[])) => {
        this.childDefault(path);
        let oa: ObservableArray<any> = this.RealValue;
        if (!obs.isObservableArray(oa)) return;
        if (this.childDefaultPath) {
            (<ObservableArray<any>>oa).childDefaultPath = undefined;
        }
    }
    public setObserve = (path: (() => any) | string | (string[]), populator?: (() => any) | string | (string[]), defaultRoot?: (string | (() => any))) => {
        this.observe(path, populator, defaultRoot);
        let oa: ObservableArray<any> = this.RealValue;
        if (!obs.isObservableArray(oa)) return;
        if (this.observePath) {
            console.log('----- Set observePath for RealValue -----', oa);
            let observationSource = obs.getDecorator(oa, 'observationSource', true);
            if (observationSource) observationSource.setBindingPath(this.observePath, PathBindingMode.syncFrom);
        }
        if (this.observerPath) {
            //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
            let observationSource = obs.getDecorator(oa, 'observer', true);
            if (observationSource) observationSource.setBindingPath(this.observerPath, PathBindingMode.syncFrom);
        }
    }
    public setPopulate = (path: (() => any) | string | (string[]), populator?: (() => any) | string | (string[]), defaultRoot?: (string | (() => any))) => {
        this.observe(path, populator, defaultRoot);
        let oa: ObservableArray<any> = this.RealValue;
        if (!obs.isObservableArray(oa)) return;
        if (this.observePath) {
            //if (this.propertyKey == 'products') console.log('----- Set observePath for RealValue -----');
            let observationSource = obs.getDecorator(oa, 'observationSource', true);
            if (observationSource) observationSource.setBindingPath(this.observePath, PathBindingMode.syncFrom);
        }
        if (this.observerPath) {
            //if (this.propertyKey == 'products') console.log('----- Set observerPath for RealValue -----');
            let observationSource = obs.getDecorator(oa, 'observer', true);
            if (observationSource) observationSource.setBindingPath(this.observerPath, PathBindingMode.syncFrom);
        }
    }
}

export class listener {
    constructor(public path: string[], public parent: memberDecorator) {

    }
    target: Object;
    property: string;
    pathChanged: ITrigger;
    trigger: ITrigger;
    listen = () => {
        if (this.path && this.path.length > 0) {
            let listenTarget = obp.getPathSourceKeyValue(this.parent.target, this.path);
            if (listenTarget && listenTarget.source && listenTarget.key) {
                let d = obs.getDecorator(listenTarget.source, listenTarget.key, true);
                if (d && d.type == 'event') {
                    //in this case, keep the listeningObject and listeningProperty will cause trouble.
                    this.trigger = {
                        target: this.parent.target,
                        method: this.parent.handler
                    };
                    d.afters.push(this.trigger);
                }
                else {
                    this.target = listenTarget.source;
                    this.property = listenTarget.key;
                    this.target[this.property] = this.parent.invoker;
                }
            }
            if (this.path && this.path.length > 0) {
                this.pathChanged = {
                    target: this,
                    method: this.onPathChanged
                };
            }
            obp.setPathChangedTrigger(this.parent.target, this.path, this.pathChanged);
        }
    }
    clear = () => {
        if (this.pathChanged) {
            this.pathChanged.target = undefined;
            this.pathChanged.method = undefined;
            this.pathChanged = undefined;
        }
        if (this.target && this.property) {
            this.target[this.property] = undefined;
        }
        this.target = undefined;
        this.property = undefined;
        if (this.trigger) {
            this.trigger.target = undefined;
            this.trigger.method = undefined;
            this.trigger = undefined;
        }
    }
    onPathChanged = () => {
        this.clear();
        this.listen();
    }
}
/**
 * decorates a class for specific behaviors
 */
export class objectDecorator {
 
    /**
     * ['@ObjectService.ConstructionStack'] is the array of constructors. The last element in this array shows which constructor level are it just completes.
     * This provides a way to work out the inherit level during the decorated construction process. If there is only one element, that means it has complete the last constructor process;
     */
    public bindableBase = (target: any, instanceFunction?: (instance: any, classPrototype: any) => any) => {
        // save a reference to the original constructor
        let original: Function = target;
        // a utility function to generate instances of a class
        
        let that: Function;
        function construct(args: any[]) {

            

            let p = ["['@ObjectService.Decorators']", "['method']", "['listenPaths']"];
            let pp = ["['__proto__']", "['@ObjectService.Decorators']", "['method']", "['listenPaths']"];

            let classPrototype = original.prototype;
            //console.log('*** dcrs Before Call Original: ', original.name , obp.getPathValue(that, p), obp.getPathValue(classPrototype, p),
            //    obp.getPathValue(that, pp), obp.getPathValue(classPrototype, pp))
            //if (!prototypeDecorators) {
            //    prototypeDecorators = classPrototype['@ObjectService.Decorators'];
            //    delete classPrototype['@ObjectService.Decorators'];
            //}
            let builder: { [id: string]: any } = eval('(function(cnstr, proto, that, args) {\n\
                let '+ original.name + ' = function () {\n\
                    return cnstr.apply(that, args);\n\
                };\n\
                ' + original.name + '.prototype = proto;\n\
                return '+ original.name + '();\n\
            })')(original, classPrototype, that, args);

            

            //there is no need to initiate multiple times

            //let instance: Object = that;
            if (that['@ObjectService.ConstructionStack'].length == 1) {

                //console.log('*** dcrs After Call Original: ', original.name, obp.getPathValue(that, p), obp.getPathValue(classPrototype, p),
                //    obp.getPathValue(that, pp), obp.getPathValue(classPrototype, pp));
                let prototypeDecorators: { [key: string]: memberDecorator } = classPrototype['@ObjectService.Decorators'];

                let instanceDecorators: { [key: string]: memberDecorator } = that['@ObjectService.Decorators'];

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


                for (let key in instanceDecorators) {
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

        function setThat(value: any) {
            that = value;
        }
        let invoker = eval('(function (original, construct, setThat) {\n\
    var '+ (<any>original).name + ' = function () {\n\
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
    '+ (<any>original).name + '.prototype = original.prototype;\n\
    return '+ (<any>original).name + ';\n\
})');
        // return new constructor (will override original)
        return invoker(original, construct, setThat);
    }


    public proxy = (target: any) => {
        let logHandler: ProxyHandler<ObservableArray<any>> = {
            deleteProperty: function (obj: any, property: string): boolean {
                console.log('deleting ' + property + ' of ', obj);
                delete obj[property];
                
                return true;
            },
            get: function (obj: any, property: string) {
                return obj[property];
            },
            set: function (obj: any, property: string, value: any, receiver: any) {
                console.log('setting', property, 'for', obj, ' to value: (', value, ')');
                obj[property] = value;
                // you have to return true to accept the changes
                return true;
            }
        };
        function  instanceFunction (instance: any, classPrototype: any) {
            Object.defineProperty(instance, '@ObjectService.Proxy', {
                configurable: false,
                enumerable: true,
                value: true,
                writable: false
            });
            return new Proxy(instance, logHandler);
        }

        return this.bindableBase(target, instanceFunction);

    }
    /**
     * specify the object as bindable; it enables the bindings;
     * @param target
     */
    public bindable = (target: any) => {
        return this.bindableBase(target);
    }
    /**
     * specify an array as observable; it enables the observable feature and bindings;
     * WARNING! this shall be only applied to Observable Array;
     * @param target
     */
    public observable = (target: any) => {

        let arrayChangeHandler: ProxyHandler<ObservableArray<any>> = {
            deleteProperty: function (obsArray: ObservableArray<any>, property: string | number | symbol): boolean {
                delete obsArray[property];
                if (/^\d+$/ig.test(property.toString()) && obsArray.onchange) obsArray.onchange({ array: obsArray, operation: ArrayOperationType.delete, startIndex: Number(property) });
                return true;
            },
            get: function (obsArray: ObservableArray<any>, property: string) {
                return obsArray[property];
            },
            set: function (obsArray: ObservableArray<any>, property: string, value: any, receiver: any) {
                //console.log('setting', property, typeof property, 'for', obsArray, 'with value: (', value, ')');
                let oldValue = obsArray[property]
                obsArray[property] = value;
                if (/^\d+$/ig.test(property)) {
                    obsArray.itemListeners[property] = new itemListener(obsArray, value, obsArray.childrenListenPaths);
                    if (obsArray.childDefaultPath && obsArray.childDefaultPath.length > 0) {
                        obp.setPathValue(oldValue, this.childDefaultPath, undefined, this, 'childDefaultPath');
                        obp.setPathValue(value, this.childDefaultPath, this, this, 'childDefaultPath');
                    }
                    if (obsArray.onchange) obsArray.onchange({ array: obsArray, items: [value], operation: ArrayOperationType.replace, startIndex: Number(property) });
                }
                // you have to return true to accept the changes
                return true;
            }
        };

        let instanceFunction = (instance: any, classPrototype: any):any => {

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
        }

        return this.bindableBase(target, instanceFunction);

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
    }
}

/**
 * Object Binding Path
 */
export class obp {
    static invokeTrigger(trigger: ITrigger, args: any[]): any {
        //console.log('invokeTrigger', trigger, args);
        if (trigger.method) {
            return trigger.method.apply(trigger.target, args);
        }
        else {
            return obp.invokePath(trigger.target, trigger.path, args);
        }
    }
    static isFunctionPath(value: string): boolean {
        if (typeof value != 'string') return false;
        return /^\s*(\.\s*[$\w]+|\[\s*'[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+'\s*\]|\[\s*"[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+"\s*\]|\[\s*\d+\s*\])(\s*\(\s*\))\s*$/ig.test(value);
    }
    static isBracketPath(value: string): boolean {
        if (typeof value != 'string') return false;
        return /^\s*(\[\s*'[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+'\s*\]|\[\s*"[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+"\s*\]|\[\s*\d+\s*\])\s*$/ig.test(value);
    }
    static isAccessorPath(value: string): boolean {
        if (typeof value != 'string') return false;
        return /^\s*(\.\s*[$\w]+)\s*$/ig.test(value);
    }
    static getFunctionAccessor(value: string): string {
        if (typeof value != 'string') return '';
        return value.substr(0, /\s*\(\s*\)\s*$/ig.exec(value).index);
    }
    static getPathType(value: string): 'function' | 'bracket' | 'property' {
        if (obp.isFunctionPath(value)) return 'function';
        if (obp.isBracketPath(value)) return 'bracket';
        if (obp.isPropertyPath(value)) return 'property';
    }
    /**
     * Invoke a member or command of the host
     * @param host, the host object;
     * @param command: it can be property, method, or bracket such as .test, .test(), [2], ['test'], [3](), ['test']();
     */
    static invokeCommandByString(host: Object, command: string) {
        return eval('(function(host){try {return host' + command + ';} catch(ex){return;}})')(host);
    }
    /**
     * Invoke a method of the host
     * @param host
     * @param method: this method name must not have (); it should be pure method name string;
     * @param args
     */
    static invokeMethodByString(host: Object, method: string, args: any[]) {
        let func: Function = eval('(function(host, args){try {return host' + method + ';} catch(ex){console.log("inner error: ", ex); return;}})')(host, args);
        if (!func) return;
        return func.apply(host, args);
    }
    static getPropertyDescriptorByString(host: Object, member: string) {
        return eval('(function(host, args){try {return Object.getOwnPropertyDescriptor(host, "' + member + '");} catch(ex){return null;}})')(host)
    }
    static analyzePath(value: (() => any) | string | (string[])): string[] {
        if (!value) return;
        let code: string;
        let result: string[] = [];
        if (obs.isFunction(value)) {
            let f: Function = <any>value;
            code = f.toString();
            let mr = /return\s+/ig.exec(code);
            code = code.substr(mr.index + mr[0].length);
        }
        else {
            if (obs.isArray(value)) {
                let arr: string[] = <any>value;
                code = arr.join('');
            }
            else {
                code = value.toString();
            }
        }
        let ptnPath = /\s*(\.\s*[$\w]+|\[\s*'[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+'\s*\]|\[\s*"[@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w ]+"\s*\]|\[\s*\d+\s*\])(\s*\(\s*\)|)/ig;
        let mp: RegExpExecArray;
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
    }
    static trimPath(value: string): string {
        let match: RegExpExecArray;
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
    }
    static analyzeMember(value: (string | (() => any))){
        let memberName: string;
        if (obs.isFunction(value)) {
            let paths = obp.analyzePath(value);
            if(paths && paths.length > 0) memberName = /[$\w]+/ig.exec(obp.analyzePath(value)[0])[0];
        }
        if (typeof value == 'string') {
            memberName = /[$\w]+/ig.exec(<string>value)[0];
        }
        return memberName;
    }
    static getPropertyName(value: string): string {
        return /\s*(\.\s*([$\w]+)(\s*\(\s*\)|)|\[\s*'([@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w]+)'\s*\](\s*\(\s*\)|)|\[\s*"([@$#%&=~,:;/<>\\\?\!\*\(\)\+\^\-\.\w]+)"\s*\](\s*\(\s*\)|)|\[(\s*\d+\s*)\](\s*\(\s*\)|))/ig.exec(value)[2];
    }
    static isPropertyPath(value: string): boolean {
        return /^\s*\.\s*([$\w]+)\s*$/ig.test(value);
    }
    static getPathProperty(value: string): string {
        return /^\s*\.\s*([$\w]+)\s*$/ig.exec(value)[1];
    }
    static setAccessorValue(host: Object, path: string, value: any) {
        let func: (target: Object, newValue: any) => void = eval('(function (host, value) { host' + path + ' = value;})');
        if (func) func(host, value);
    }
    /**
     * set value to specific path; it supports '.$$invokeEachElementInArray()' for array items;
     * @param host
     * @param path
     * @param value
     */
    static setPathValue(host: Object, path: string[], value: any, target: Object, propertyKey: string): boolean {
        if (!host) return;
        if (!path) return;
        if (!obs.isArray(path)) return;
        let hosts: Object[] = [host];
        for (let i = 0; i < path.length; i++) {
            let newHosts: Object[] = [];
            if (path[i].replace(/\s+/ig, '') == '.$$invokeEachElementInArray()') {
                hosts.forEach(item => {
                    if (obs.isArray(item)) (<Object[]>item).forEach(subitem => newHosts.push(subitem));
                });
            }
            else {
                hosts.forEach(item => {
                    let newItem: Object;
                    if (i == path.length - 1) {//args are applied to the last step
                        switch (obp.getPathType(path[i])) {
                            case 'function':
                                break;
                            case 'bracket':
                                obp.setAccessorValue(item, path[i], value);
                                break;
                            case 'property':
                                let pathProperty = obp.getPathProperty(path[i]);
                                let decorator = obs.getDecorator(item, pathProperty, true);
                                if (decorator) {
                                    //when there is decorator, use the bindSetter;
                                    decorator.bindSetter.apply(decorator.target, [target, propertyKey, [this], value, decorator.RealValue, [this]]);
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
                                    item[pathProperty] = value
                                    //console.log('obp.setPathValue: value', item[pathProperty]);
                                }
                                break;
                        }
                    }
                    else {
                        newItem = obp.invokeCommandByString(item, path[i]); //eval('(function(host){try {return host' + path[i] + ';} catch(ex){return;}})')(host);
                        if (newItem) newHosts.push(newItem);
                    }
                })
            }
            hosts = newHosts;
        }
        return true;
    }

    static setPathChangedTrigger(host: Object, path: string[], trigger: ITrigger) {
        for (let i: number = 0; i < path.length; i++) {
            if (obp.isEventProxy(host)) {
                break;// it shall never change, because it is a proxy;
            }
            else {
                if (obp.isPropertyPath(path[i])) {
                    let decorator = obs.getDecorator(host, obp.getPropertyName(path[i]));
                    if (decorator && decorator.type == 'property') {
                        decorator.afters.push(trigger);
                    }
                }
                host = obp.invokeCommandByString(host, path[i]);
            }
        }
    }
    static isEventProxy(value: Object): boolean {
        if (!value) return false;
        return value['@ObjectService.EventProxy'];
    }
    static getEventProxyPath(path: string[]): string {
        let id = path.map(value => obp.trimPath(value)).join('');
        if (/^\./.test(id)) id = id.substr(1);
        return id;
    }
    /**
     * this function can invoke any path; in case of exception, undefined is returned;
     * @param path
     * @param args
     */
    static invokePath(host: Object, path: string[], args: any[]): any {
        if (!path) return;
        if (!obs.isArray(path)) return;
        let hosts: Object[] = [host];
        let result: any;
        for (let i = 0; i < path.length; i++) {
            //console.log('invokePath: ', hosts, path[i]);
            let newHosts: Object[] = [];
            hosts.forEach(item => {
                if (obp.isEventProxy(item)) {
                    let id = obp.getEventProxyPath(path.slice(i));//.map(value => obp.trimPath(value)).join('');
                    //if (/^\./.test(id)) id = id.substr(1);
                    let d = obs.getDecorator(item, id);
                    d.invoker.apply(item, args);
                }
                else {
                    if (path[i].replace(/\s+/ig, '') == '.$$invokeEachElementInArray()') {
                        if (obs.isArray(item)) (<Object[]>item).forEach(subitem => newHosts.push(subitem));
                    }
                    else {
                        let newItem: Object;
                        if (i == path.length - 1) {//args are applied to the last step
                            newItem = obp.invokeCommandByString(item, path[i]); //eval('(function(host, args){try {return host' + path[i] + ';} catch(ex){return;}})')(item, args);
                            if (obs.isFunction(newItem)) {
                                try {
                                    (<Function>newItem).apply(item, args);
                                }
                                catch (ex) {
                                    console.trace('Error invokePath:', item, path[i] , path.join(''), ex);
                                }
                            }
                        }
                        else {
                            newItem = obp.invokeCommandByString(item, path[i]); //eval('(function(host){try {return host' + path[i] + ';} catch(ex){return;}})')(item);
                        }
                        if (newItem) newHosts.push(newItem);
                    }
                }
            });
            
            hosts = newHosts;
            if (hosts.length == 0) break;
        }
        return hosts;
    }
    /**
     * this function can invoke any path; in case of exception, undefined is returned;
     * @param path
     * @param args
     */
    static getPathValue(host: Object, path: string[]): any {
        if (!host) return;
        if (!path) return;
        if (!obs.isArray(path)) return;
        let result: any;
        for (let i = 0; i < path.length; i++) {
            if (i == path.length - 1) {//args are applied to the last step
                if (obp.isFunctionPath(path[i])) {
                    let lastPath = obp.getFunctionAccessor(path[i]);
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
    }
    static getPathSourceKeyValue(host: Object, path: string[]): { source: Object, key: string, value: any } {
        if (!host) return;
        if (!path) return;
        if (!obs.isArray(path)) return;
        let source: any;
        let result: any;
        let key: string; 
        for (let i = 0; i < path.length; i++) {
            if (obp.isEventProxy(host)) {
                source = host;
                key = obp.getEventProxyPath(path.slice(i));//.map(value => obp.trimPath(value)).join('');
                //if (/^\./.test(key)) key = key.substr(1);
                let d = obs.getDecorator(host, key); //let the event proxy initialize for this key;
                result = host[key]; //you will get the proxy method;
                break;
            }
            else {
                if (i == path.length - 1) {//args are applied to the last step
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
    }
}
export class debug {
    static logPropertyDecorators(obj: Object) {
        console.log('---- Begin list Decorators for; ', obj);
        for (let key in obj['@ObjectService.Decorators']) {
            let decorator = obj['@ObjectService.Decorators'][key];
            console.log('MemberDecorator for ' + key, decorator);
        }
        console.log('---- End list Decorator');
    }
    static logPropertyDecorator(obj: Object, key: (string|(()=>any))) {
        let member = obp.analyzeMember(key);
        let decorator = obs.getDecorator(obj, member, true);
        console.log('MemberDecorator for ' + member , decorator);
    }
}
/**
 * Object Binding Service
 */
export class obs {
    static childDefault(path: (() => any) | string | (string[])) {
        return (new memberDecorator()).childDefault(path);
    }
    static new<T>(obj: T, setter: (value: T)=>any):T {
        return  setter(obj), obj;
    }
    static isInitialized(obj: Object): boolean {
        return obj['@ObjectService.Instance'];
    }
    static appendAfter(target: Object, member: (string | (() => any)), trigger: ITrigger) {
        let memberName = obp.analyzeMember(member);
        let decorator = obs.getDecorator(target, memberName, true);
        if (decorator) decorator.afters.push(trigger);
    }
    static appendBefore(target: Object, member: (string | (() => any)), trigger: ITrigger) {
        let memberName = obp.analyzeMember(member);
        let decorator = obs.getDecorator(target, memberName, true);
        if (decorator) decorator.befores.push(trigger);
    }
    static suspend(target: Object, member: (string | (() => any))) {
        let memberName = obp.analyzeMember(member);
        let decorator = obs.getDecorator(target, memberName, true);
        if (decorator) decorator.suspend();
    }
    static resume(target: Object, member: (string | (() => any))) {
        let memberName = obp.analyzeMember(member);
        let decorator = obs.getDecorator(target, memberName, true);
        if (decorator) decorator.resume();
    }
    static block(target: Object, member: (string | (() => any)), func: Function, host?: Object) {
        let memberName = obp.analyzeMember(member);
        let decorator = obs.getDecorator(target, memberName, true);
        if (decorator) decorator.suspend();
        func.apply(host, []); //block the event or method during the execution of the function;
        if (decorator) decorator.resume();
    }

    static get bindable():(target: any)=>void {
        let od = new objectDecorator();
        return od.bindable;
    }
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
    static invokeBefore(setter: Function) {
        obs.statusStack.unshift(invokeStatus.invokeBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    }
    static invokeAfter(setter: Function) {
        obs.statusStack.unshift(invokeStatus.invokeAfter);
        setter.apply(undefined);
        obs.statusStack.shift();
    }
    static bindAfter(setter: Function) {
        obs.statusStack.unshift(invokeStatus.bindBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    }
    static bindBefore(setter: Function) {
        obs.statusStack.unshift(invokeStatus.bindAfter);
        setter.apply(undefined);
        obs.statusStack.shift();
    }
    static bindBeforeWithCheckValidate(setter: Function) {
        obs.statusStack.unshift(invokeStatus.bindBeforeWithCheckValidate);
        setter.apply(undefined);
        obs.statusStack.shift();
    }
    static updateOneWayToBefore(setter: Function) {
        obs.statusStack.unshift(invokeStatus.updateOneWayToBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    }
    static updateOneWayToAfter(setter: Function) {
        obs.statusStack.unshift(invokeStatus.updateOneWayToBefore);
        setter.apply(undefined);
        obs.statusStack.shift();
    }
    static setBinding(target: any, propertyKey: string, path: (() => any) | string | (string[]), mode: PathBindingMode) { //, condition?: IPathSeekCondition
        obs.getDecorator(target, propertyKey).setBindingPath(path, mode);
    }
    static isFunction(functionToCheck: any) :boolean {
        return functionToCheck && typeof functionToCheck === 'function' && Object.prototype.toString.call(functionToCheck) === '[object Function]';
    }
    /**
     * Check whether the object has an iterator, which is the implementation of for of
     * @param objectToCheck
     */
    static isArray(objectToCheck: any): boolean {
        return objectToCheck && typeof objectToCheck === 'object' && objectToCheck[Symbol.iterator];  //Object.prototype.toString.call(functionToCheck) === '[object Array]';
    }
    static isObservableArray(objectToCheck: any): boolean {
        return objectToCheck && typeof objectToCheck === 'object' && objectToCheck[Symbol.iterator] && objectToCheck['@ObjectService.ObservableArray'];  //Object.prototype.toString.call(functionToCheck) === '[object Array]';
    }
    static getIterator(array: any[]) {
        return array[Symbol.iterator]();
    }
    /**
     * (event) listen to onEvent. This method will set a handler to the onEvent property.
     * @param path
     */
    static listen(...paths: ((() => any) | string | (string[]))[]): memberDecorator {
        return memberDecorator.prototype.listen.apply(new memberDecorator(), paths);
    }
    static listenChildren(...paths: ((() => any) | string | (string[]))[]): memberDecorator {
        return memberDecorator.prototype.listenChildren.apply(new memberDecorator(), paths);
    }
    /**
     * (property) if the value of a property, this will automatically set up its observe;
     * @param path
     */
    static observe(path: (() => any) | string | (string[]), observer?: (() => any) | string | (string[])):memberDecorator {
        return (new memberDecorator()).observe(path, observer);
    }
    /**
     * (property) if the value of a property, this will automatically set up its populate;
     * @param path
     */
    static populate(path: (() => any) | string | (string[]), populator?: (() => any) | string | (string[])): memberDecorator {
        return (new memberDecorator()).populate(path, populator);
    }
    /**
     * (property) if the value of a property, this will automatically set up its default path as the host object;
     * @param path
     */
    static default(path: (() => any) | string | (string[])): memberDecorator {
        return (new memberDecorator()).default(path);
    }
    static wrap(method: (() => any) | string | (string[]), convertFrom?: (value: any) => any, convertTo?: (value: any) => any): memberDecorator {
        return (new memberDecorator()).wrap(method, convertFrom, convertTo);
    }
    static before(method: (() => any) | string | (string[])): memberDecorator {
        return (new memberDecorator()).before(method);
    }
    static after(method: (() => any) | string | (string[])): memberDecorator {
        return (new memberDecorator()).after(method);
    }
    static beforeBindChange(path: (() => any) | string | (string[])) {
        return (new memberDecorator()).beforeBindChange(path);
    }
    static afterBindChange(path: (() => any) | string | (string[])) {
        return (new memberDecorator()).afterBindChange(path);
    }
    static check(checker: (() => any) | string | (string[])): memberDecorator {
        return (new memberDecorator()).check(checker);
    }
    static validate(validator: () => (source: any, memberKey: string, newValue: any, oldValue: any) => any): memberDecorator {
        return (new memberDecorator()).validate(validator);
    }
    static bind(path: (() => any) | string | (string[]), mode?: PathBindingMode): memberDecorator {
        return (new memberDecorator()).bind(path, mode);
    }
    static syncFrom = (path: (() => any) | string | (string[])) => {
        let obd = new memberDecorator();
        return obd.syncFrom(path);
    }
    static updateTo = (path: (() => any) | string | (string[])) => {
        let obd = new memberDecorator();
        return obd.updateTo(path);
    }
    static observable(type: typeof ObservableArray) {
        return (new memberDecorator()).observable(type);
    }
    /**
     * use Proxy to wrap observable array so that Array[number] accessor can also trigger onchange event;
     * @param obj
     */
    static makeObservable<T>(obj: ObservableArray<T>): ObservableArray<T> {
        let arrayChangeHandler: ProxyHandler<ObservableArray<any>> = {
            deleteProperty: function (obsArray: ObservableArray<any>, property: string | number | symbol): boolean {
                delete obsArray[property];
                if (/^\d+$/ig.test(property.toString()) && obsArray.onchange) obsArray.onchange({ array: obsArray, operation: ArrayOperationType.delete, startIndex: Number(property) });
                return true;
            },
            get: function (obsArray: ObservableArray<any>, property: string) {
                return obsArray[property];
            },
            set: function (obsArray: ObservableArray<any>, property: string, value: any, receiver: any) {
                //console.log('setting', property, typeof property, 'for', obsArray, 'with value: (', value, ')');
                let oldValue = obsArray[property]
                obsArray[property] = value;
                if (/^\d+$/ig.test(property)) {
                    obsArray.itemListeners[property] = new itemListener(obsArray, value, obsArray.childrenListenPaths);
                    if (obsArray.childDefaultPath && obsArray.childDefaultPath.length > 0) {
                        obp.setPathValue(oldValue, this.childDefaultPath, undefined, this, 'childDefaultPath');
                        obp.setPathValue(value, this.childDefaultPath, this, this, 'childDefaultPath');
                    }
                    if (obsArray.onchange) obsArray.onchange({ array: obsArray, items: [value], operation: ArrayOperationType.replace, startIndex: Number(property) });
                }
                // you have to return true to accept the changes
                return true;
            }
        };
        return new Proxy(obj, arrayChangeHandler);
    }
    static get property(): (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => void {
        return (new memberDecorator()).property;
    }
    static get event(): (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => void {
        return (new memberDecorator()).event;
    }
    static get method(): (target: Object, propertyKey: string, descriptor?: PropertyDescriptor) => void {
        return (new memberDecorator()).method;
    }
    static isDisposed(value: Object): boolean {
        if (typeof value != 'object') return false;
        return value['@ObjectService.Disposed'];
    }
    static dispose(value: Object) {
        if (typeof value != 'object') return;
        value['@ObjectService.Disposed'] = true;
    }
    static statusStack: invokeStatus[] = [];
    static disabled: boolean = false;

    static getDecorator(value: Object, propertyKey: string, doNotCreateWhenUndefined?: boolean): memberDecorator {
        //if (typeof value != 'object') return;
        if (!value) return;
        if (!value['@ObjectService.Decorators']) value['@ObjectService.Decorators'] = {};
        let decorators: { [key: string]: memberDecorator } = value['@ObjectService.Decorators'];
        if (value['@ObjectService.EventProxy']) {
            //event proxy always has a event property available when anyone try to access;
            let decorator: memberDecorator;
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
                let decorator: memberDecorator = new memberDecorator();
                decorators[propertyKey] = decorator;
                decorator.target = value;
                decorator.propertyKey = propertyKey;
            }
            return decorators[propertyKey];
        }
    }
    static setDecorator(value: Object, propertyKey: string, decorator: memberDecorator): memberDecorator {
        if (!value) return;
        if (typeof value != 'object') return;

        if (!value['@ObjectService.Decorators']) value['@ObjectService.Decorators'] = {};
        let decorators: { [key: string]: memberDecorator } = value['@ObjectService.Decorators'];
        if (decorators[propertyKey]) {
            //console.log('setDecorator allocate from new:', propertyKey);
            decorators[propertyKey].allocate(decorator);
        }
        else {
            decorators[propertyKey] = decorator;
        }
        return decorators[propertyKey];
    }
    /**
     * applyDecorator will apply the new decorator the existing one; the decorator will be returned if it needs instantiate;
     * @param value
     * @param propertyKey
     * @param decorator
     */
    static applyDecorator(value: Object, propertyKey: string, decorator: memberDecorator): memberDecorator {
        if (!value) return;
        if (typeof value != 'object') return; 
        let d = obs.getDecorator(value, propertyKey);
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
    }
    /**
     * make a plain object into a bindable object; Functions are converted to events, others are converted to property;
     * if events is defined, only the specified fields will be converted to events;
     * @param value
     */
    static makeBindable(value: Object, keys?: string[], events?: string[]) {
        let ids: string[] = [];
        util.appendArray(ids, keys);
        if (keys) keys.forEach(key => { if (ids.indexOf(key) < 0) ids.push(key); });
        if (events) events.forEach(key => { if (ids.indexOf(key) < 0) ids.push(key); });
        for (let key in value) {
            if(ids.indexOf(key) < 0) ids.push(key);
        }
        if (events) {
            ids.forEach(id => {
                if (events.indexOf (id)>-1) {
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
            ids.forEach(id => {
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
    }
    /**
     * make a member field into propery
     * @param value
     * @param key
     */
    static makeProperty(value: Object, key: string) {
        let d = obs.getDecorator(value, key, true);
        d.type = 'property';
        d.instantiate();
        return d;
    }
    /**
     * make a member field into event
     * @param value
     * @param key
     */
    static makeEvent(value: Object, key: string) {
        let d = obs.getDecorator(value, key, true);
        d.type = 'event';
        d.instantiate();
        return d;
    }
}

//interface IPathSeekCondition {
//    depth?: number, /**depth<0 for indefinitely. any number for rounds of search*/
//    type?: string,
//    checkPath?: string[],
//    checkPathValue?: any
//}

 
export enum PathBindingMode {
    bind,
    syncFrom,
    updateTo
}
/** Validate function will check if the value is in the valid range return a valid value */
interface IValidate {
    target: Object;
    validator?: (source: any, memberKey: string, decorators: memberDecorator[],  newValue: any, oldValue: any) => any;
    path?: string[];
}
//interface IBindSetter {
//    (source: Object, memberKey: string, decorators: objectDecorator[], value: any, oldValue: any, triggerDecorators: objectDecorator[], isFromPath: boolean): boolean;
//}
interface ITrigger {
    target: any;
    //key: string;
    method?: Function;
    check?: ICheck;
    validate?: IValidate;
    path?: string[];
    decorator?: memberDecorator;
}
 


declare global{
    interface Array<T> {
        $$invokeEachElementInArray(): T;
    }
}
class ArrExt<T> {
    add(item: T): T {
        let arr: T[] = <any>this;
        arr.push(item);
        return item;
    }
    insert(index: number, item: T): T {
        let arr: T[] = <any>this;
        arr.push(item);
        return item;
    }
    static $push: (item: any) => number;
    push(...items: T[]): number {
        let arr: T[] = <any>this;
        let length = ArrExt.$push.apply(arr, items);
        //console.log('array push: ', items);
        return length;
    }
    static $pop: (item: any) => any;
    pop(): any {
        let arr: T[] = <any>this;
        let r = ArrExt.$pop.apply(this, []);

        return r;
    }
       
}

@obs.bindable
export class ObservableArray<T> extends Array<T> {
    constructor(...items: any[]) {
        super();
        Object.defineProperty(this, '@ObjectService.ObservableArray', {
            configurable: false,
            enumerable: true,
            value: true,
            writable: false
        });
        Array.prototype.push.apply(this, items);
        Array.prototype.push.apply(this.itemListeners, items.map(item => new itemListener(this, item, this.childrenListenPaths)));
    }
    public push(...items: T[]): number {
        let r = Array.prototype.push.apply(this, items);
        Array.prototype.push.apply(this.itemListeners, items.map(item => new itemListener(this, item, this.childrenListenPaths)));
        if (this.childDefaultPath && this.childDefaultPath.length > 0) items.forEach(item => {
            obp.setPathValue(item, this.childDefaultPath, this, this, 'childDefaultPath');
        });       
        if (this.onchange) this.onchange({ array: this, items: items, operation: ArrayOperationType.push});
        return r;
    }
    public pop(): T {
        let r = Array.prototype.pop.apply(this, []);
        this.itemListeners.pop();
        if (this.childDefaultPath && this.childDefaultPath.length > 0) obp.setPathValue(r, this.childDefaultPath, undefined, this, 'childDefaultPath');
        if (this.onchange) this.onchange({ array: this, items: [r], operation: ArrayOperationType.pop });
        return r;
    }
    public unshift(...items: T[]):number {
        let r = Array.prototype.unshift.apply(this, items);
        Array.prototype.unshift.apply(this.itemListeners, items.map(item => new itemListener(this, item, this.childrenListenPaths)));
        if (this.childDefaultPath && this.childDefaultPath.length > 0) items.forEach(item => {
            obp.setPathValue(item, this.childDefaultPath, this, this, 'childDefaultPath');
        });
        if (this.onchange) this.onchange({ array: this, items: items, operation: ArrayOperationType.unshift });
        return r;
    }
    public shift(): T {
        let r = Array.prototype.shift.apply(this, []);
        this.itemListeners.shift();
        if (this.childDefaultPath && this.childDefaultPath.length >0) obp.setPathValue(r, this.childDefaultPath, undefined, this, 'childDefaultPath');
        if (this.onchange) this.onchange({ array: this, items: [r], operation: ArrayOperationType.shift });
        return r;
    }
    public splice(index: number, deleteCount?: number, ...items: T[]): T[] {
        let spliceArgs : any[] = [index, deleteCount];
        Array.prototype.push.apply(spliceArgs, items);
        let r = Array.prototype.splice.apply(this, spliceArgs);
        let listenerSpliceArgs: any[] = [index, deleteCount];
        Array.prototype.push.apply(listenerSpliceArgs, items.map(item => new itemListener(this, item, this.childrenListenPaths)));
        Array.prototype.splice.apply(this.itemListeners, listenerSpliceArgs);
        if (this.childDefaultPath && this.childDefaultPath.length > 0) {
            items.forEach(item => {
                obp.setPathValue(item, this.childDefaultPath, this, this, 'childDefaultPath');
            });
            r.forEach(item => {
                obp.setPathValue(item, this.childDefaultPath, undefined, this, 'childDefaultPath');
            });
        }
        if (this.onchange) this.onchange({ array: this, items: items, operation: ArrayOperationType.splice, startIndex: index, spliceDeleteCount: deleteCount });
        return r;
    }
    public sort(compareFn?: (a: T, b: T) => number): T[] {
        if (!compareFn) compareFn = (a: T, b: T) => (a.toString() > b.toString()) ? 1 : -1;
        let indicesArray: { [index: number]: number } = {};
        let len = this.length;
        for (let i: number = 0; i < len; i++) {
            indicesArray[i] = i;
        }
        //bubble sort
        for (let i = len - 1; i >= 0; i--){
            for (let j = 1; j <= i; j++) {
                if (compareFn(this[indicesArray[j - 1]], this[indicesArray[j]]) > 0) {
                    let temp = indicesArray[j - 1];
                    indicesArray[j - 1] = indicesArray[j];
                    indicesArray[j] = temp;
                }
            }
        }
        let tempArray = Array.prototype.splice.apply(this, [0, len]);
        let tempListeners = this.itemListeners.splice(0, this.itemListeners.length);

        for (let i: number = 0; i < len; i++) {
            Array.prototype.push.apply(this, [tempArray[indicesArray[i]]]);
            this.itemListeners.push(tempListeners[indicesArray[i]]);
        }

        if (this.onchange) this.onchange({ array: this, items: this, operation: ArrayOperationType.configure, mappings: indicesArray });
        return this;
    }
    public clear(): T[] {
        let r = this.splice(0, this.length);
        this.itemListeners.splice(0, this.itemListeners.length);
        if (this.childDefaultPath && this.childDefaultPath.length > 0) r.forEach(item => {
            obp.setPathValue(item, this.childDefaultPath, undefined, this, 'childDefaultPath');
        });
        if (this.onchange) this.onchange({ array: this, items: r, operation: ArrayOperationType.splice, startIndex: 0, spliceDeleteCount: r.length });
        return r;
    }
    public reverse(): T[] {
        let indicesArray: { [index: number]: number } = {};
        let len = this.length;
        for (let i: number = 0; i < len; i++) {
            indicesArray[i] = len - i -1;
        }
        let tempArray = Array.prototype.splice.apply(this, [0, len]);
        for (let i: number = 0; i < len; i++) {
            this.push(tempArray[indicesArray[i]]);
        }
        this.itemListeners.reverse();
        if (this.onchange) this.onchange({ array: this, items: this, operation: ArrayOperationType.configure, mappings: indicesArray });
        return this;
    }
    public asArray(): T[] {
        return this.slice(0, this.length);
    }
    //@obs.method public log(source: Object, propertyKey: string, decorators: memberDecorator[], observableArrayEvent: IObservableArrayEvent<any>) {
    //    console.log('--------------------- ObservableArray.log() invoked ---------------------.');
    //    console.log('observableArrayEvent: ', observableArrayEvent);
    //};

    @obs.after(()=>ObservableArray.prototype.populate).event
    public onchange: (observableArrayEvent: IObservableArrayEvent<T>) => void;
    
    public avatarizer: (source: any) => T;


    public avatarize<Source>(source: ObservableArray<Source>, avatarizer:(source:any)=>T) {
        this.avatarizer = avatarizer;
        source.forEach(item => {
            Array.prototype.push(this.avatarizer(item));
        });
    }
    
    
 
    @obs.property
    public parent: any;

    @obs.after(()=>ObservableArray.prototype.childDefaultChanged).property
    public childDefaultPath: string[];
    @obs.event
    public childDefaultChanged = (source: Object, key: string, decorators: memberDecorator[], newValue: string[], oldValue: string[]) => {
        if (oldValue && oldValue.length > 0) {
            this.forEach(item => {
                obp.setPathValue(item, oldValue, undefined, this, 'childDefaultPath');
            });
        }
        if (newValue && newValue.length > 0) {
            this.forEach(item => {
                obp.setPathValue(item, newValue, this, this, 'childDefaultPath');  
            });
        }
    }

    


    @obs.after(() => ObservableArray.prototype.observationSourceChanged).property
    public observationSource: ObservableArray<any>;
    private observationTrigger: ITrigger;
    @obs.method private observationSourceChanged(source: Object, key: string, decorators: memberDecorator[], newValue: ObservableArray<any>, oldValue: ObservableArray<any>) {
        //disable trigger for the old one;
        if (this.observationTrigger) this.observationTrigger.target = undefined;
        //set trigger for the new value
        this.observationTrigger = {
            target: this,
            method: this.observe
        };
        console.log(' >>>> observationSourceChanged newValue: ', newValue); 
        if (obs.isObservableArray(newValue)) {
            let decorator = obs.getDecorator(newValue, 'onchange', true);
            if (decorator) decorator.afters.push(this.observationTrigger);
        }
        //reset this
        this.observe(this.observationSource, "onchange", [], { array: this.observationSource, items: this.observationSource, operation: ArrayOperationType.reset });
    }
    @obs.after(() => ObservableArray.prototype.populate).property
    public observer: (source: any) => any;
    @obs.event
    public observe(source: Object, propertyKey: string, decorators: memberDecorator[], observableArrayEvent: IObservableArrayEvent<any>) {
        let converter = (item: any) => item;
        if (this.observer) converter = this.observer;
        let target = this.observationSource;
        if (!target || !obs.isObservableArray(target)) {
            let resetArgs = [0, this.length];
            Array.prototype.splice.apply(this, resetArgs);
            if (this.onchange) this.onchange({ array: this, items: this, operation: ArrayOperationType.reset });
            return;
        }
        if (!observableArrayEvent || !observableArrayEvent.array || !observableArrayEvent.operation) {
            let resetArgs = [0, this.length];
            //if (!this.observationSource.map) console.log('this.observationSource.map: ', this.observationSource);
            resetArgs.push.apply(resetArgs, this.observationSource.map(item => converter(item)));
            Array.prototype.splice.apply(this, resetArgs);
            if (this.onchange) this.onchange({ array: this, items: this, operation: ArrayOperationType.reset });
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
                let resetArgs = [0, this.length];
                resetArgs.push.apply(resetArgs, this.observationSource.map(item => converter(item)));
                Array.prototype.splice.apply(this, resetArgs);
                if (this.onchange) this.onchange({ array: this, items: this, operation: ArrayOperationType.reset });
                break;
            case ArrayOperationType.replace:
                this[observableArrayEvent.startIndex] = converter(observableArrayEvent.items[0]);
                break;
            case ArrayOperationType.delete:
                delete this[observableArrayEvent.startIndex];
                break;
            case ArrayOperationType.push:
                this.push.apply(this, observableArrayEvent.items.map(item => converter(item)));
                break;
            case ArrayOperationType.pop:
                this.pop();
                break;
            case ArrayOperationType.unshift:
                this.unshift.apply(this, observableArrayEvent.items.map(item => converter(item)));
                break;
            case ArrayOperationType.shift:
                this.shift();
                break;
            case ArrayOperationType.splice:
                let spliceArgs = [observableArrayEvent.startIndex, observableArrayEvent.spliceDeleteCount];
                if (observableArrayEvent.items) spliceArgs.push.apply(spliceArgs, observableArrayEvent.items.map(item => converter(item)));
                this.splice.apply(this, spliceArgs);
                break;
            case ArrayOperationType.configure:
                let configureArgs: any[] = [0, this.length];
                for (let i: number = 0; i < observableArrayEvent.array.length; i++) {
                    configureArgs.push(this[observableArrayEvent.mappings[i]]);
                }
                Array.prototype.splice.apply(this, configureArgs);
                //here an onchange event need to be invoked mannually; 
                if (this.onchange) this.onchange({ array: this, items: this, operation: ArrayOperationType.configure, mappings: observableArrayEvent.mappings });
                break;
        }
    }

    @obs.after(() => ObservableArray.prototype.populationTargetChanged).property public populationTarget: Array<any>;
    @obs.method private populationTargetChanged(source: Object, key: string, decorators: memberDecorator[], newValue: ObservableArray<any>, oldValue: ObservableArray<any>) {
        //clear the old one;
        if (oldValue) {
            oldValue.splice(0, oldValue.length);
        }
        //reset target
        this.populate(this.populationTarget, 'onchange', [], { array: this, items: this, operation: ArrayOperationType.reset });
    }
    @obs.after(() => ObservableArray.prototype.observe).property
    public populator: (source: any) => any;

    
    @obs.event
    private populate(source: Object, propertyKey: string, decorators: memberDecorator[], observableArrayEvent: IObservableArrayEvent<any>) {
        let converter = (item: any) => item;
        if (this.populator) converter = this.populator;
        let target: any[] = this.populationTarget;
        if (!target) return;
        if (!observableArrayEvent || !observableArrayEvent.array || !observableArrayEvent.operation) {
            let resetArgs = [0, target.length];
            resetArgs.push.apply(resetArgs, this.map(item => converter(item)));
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
                let resetArgs = [0, target.length];
                resetArgs.push.apply(resetArgs, this.map(item => converter(item)));
                target.splice.apply(target, resetArgs);
                break;
            case ArrayOperationType.replace:
                target[observableArrayEvent.startIndex] = converter(observableArrayEvent.items[0]);
                break;
            case ArrayOperationType.delete:
                delete target[observableArrayEvent.startIndex];
                break;
            case ArrayOperationType.push:
                target.push.apply(target, observableArrayEvent.items.map(item => converter(item)));
                break;
            case ArrayOperationType.pop:
                target.pop();
                break;
            case ArrayOperationType.unshift:
                this.unshift.apply(this, observableArrayEvent.items.map(item => converter(item)));
                break;
            case ArrayOperationType.shift:
                target.shift();
                break;
            case ArrayOperationType.splice:
                let spliceArgs = [observableArrayEvent.startIndex, observableArrayEvent.spliceDeleteCount];
                if (observableArrayEvent.items) spliceArgs.push.apply(spliceArgs, observableArrayEvent.items.map(item => converter(item)));
                target.splice.apply(target, spliceArgs);
                break;
            case ArrayOperationType.configure:
                let configureArgs: any[] = [0, target.length];
                for (let i: number = 0; i < this.length; i++) {
                    configureArgs.push(target[observableArrayEvent.mappings[i]]);
                }
                target.splice.apply(target, configureArgs);
                break;
        }
    }
    /**
    * a method that allows dynamic listening of each children;
    * @param path
    * @param handler
    */
    public listenChildren(...paths: (string[])[]) {
        //console.log('Observable Array -> listenChildren', paths);
        Array.prototype.push.apply(this.childrenListenPaths, paths);
        this.itemListeners.forEach(il => paths.forEach(path => il.addPath(path)));
    }
    public childrenListenPaths: (string[])[] = [];

    public itemListeners: itemListener[] = [];

    @obs.property
    public itemEvents: T = <any>(new EventProxy());
}

export class itemListener {
    constructor(public parent: ObservableArray<any>, public item: any, paths: (string[])[]) {
        //console.log('new Item Listener:', item, paths);
        this.item = item;
        let that = this;
        paths.forEach(path => that.addPath(path));
    }
    public listeners: { [path: string]: pathListener } = {};
    /**
     * add a new path listener to this;
     */
    public addPath = (path: string[]) => {
        let pl = new pathListener(this, path); 
        let p = path.join('');
        if (this.listeners[p]) {
            let pl = this.listeners[p];
            pl.clear();
            pl.parent = undefined;
        }
        this.listeners[p] = pl;
        pl.listen();
    }
    public removePath = (path: string[]) => {
        let p = path.join(''); 
        if (this.listeners[p]) {
            let pl = this.listeners[p];
            pl.clear();
            pl.parent = undefined;
            this.listeners[p] = undefined;
        }
    }
}

export class pathListener {
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
    constructor(public parent: itemListener, public path: string[]) {
    }

    target: Object;
    property: string;
    pathChanged: ITrigger;
    trigger: ITrigger;
    listen = () => {
        //console.trace('begin listen child: ', this.path);
        
        if (!this.parent || !this.parent.item || !this.parent.parent || !this.parent.parent.itemEvents) return;
        //console.log(!this.parent, !this.parent.item, !this.parent.parent, !this.parent.parent.itemEvents);
        if (this.path && this.path.length > 0) {
            let listenTarget = obp.getPathSourceKeyValue(this.parent.item, this.path);
            //console.log('listen Target: ', listenTarget);
            if (listenTarget && listenTarget.source && listenTarget.key) {
                let d = obs.getDecorator(listenTarget.source, listenTarget.key, true);
                let dev = obs.getDecorator(this.parent.parent.itemEvents, obp.getEventProxyPath(this.path));
                //console.log('decorator of EventProxy: ', dev, dev.propertyKey);
                if (d && d.type == 'event') {
                    let that = this;
                    //in this case, keep the listeningObject and listeningProperty will cause trouble.
                    this.trigger = {
                        target: this.parent.parent.itemEvents,
                        method: dev.handler
                    };
                    d.afters.push(this.trigger);
                    //console.log('d as event: ', d.afters, dev.afters);
                }
                else {
                    this.target = listenTarget.source;
                    this.property = listenTarget.key;
                    this.target[this.property] = dev.invoker;
                    //console.log('set invoker');
                }
            }
            if (this.path && this.path.length > 0) {
                this.pathChanged = {
                    target: this,
                    method: this.onPathChanged
                };
            }
            obp.setPathChangedTrigger(this.parent.item, this.path, this.pathChanged);
        }
    }
    clear = () => {
        if (this.pathChanged) {
            this.pathChanged.target = undefined;
            this.pathChanged.method = undefined;
            this.pathChanged = undefined;
        }
        if (this.target && this.property) {
            this.target[this.property] = undefined;
        }
        this.target = undefined;
        this.property = undefined;
        if (this.trigger) {
            this.trigger.target = undefined;
            this.trigger.method = undefined;
            this.trigger = undefined;
        }
    }
    onPathChanged = () => {
        this.clear();
        this.listen();
    }

}
/**
 * this is designed for itemEvents as the hub for listening events from item;
 * events are weak reference, so it won't cause trouble when the same item is added to a different ObservableArray at the same time;
 * this eventProxy must always has a decorator available for whatever listen and invoke access;
 */
export class EventProxy {
    constructor() {
        this['@ObjectService.EventProxy'] = true;
        this['@ObjectService.Decorators'] = {};
    }
}
 
export interface IObservableArrayEvent<T> {
    array: ObservableArray<T>
    items?: T[],
    operation: ArrayOperationType,
    startIndex?: number,
    spliceDeleteCount?:number,
    mappings?: { [index: number]: number } //map old index to new index
}
export enum ArrayOperationType {
    reset,
    replace,
    delete,
    push,
    pop,
    unshift,
    shift,
    splice,
    configure
}

module BindableTest {
    let enabled: boolean = false;
    if (enabled) {

        @obs.bindable
        class point {
            constructor() {
                console.log('creating new point .....................');
            }
            @obs.property public x: number;
            @obs.property public y: number;
            solo() {
                console.log('point.solo called. (' + this.x + ', ' + this.y + ')');
            }
            @obs.after(() => point.prototype.solo()).method public jam() {
            }
        }
        //Array.prototype.add = ArrayExtension.prototype.add;
        //let pushDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'push');
        //ArrExt.$push = Array.prototype.push;
        //Array.prototype.push = ArrExt.prototype.push;
        //console.log('Array.push', pushDescriptor);

        let values = new ObservableArray('james', 'stone');
        //values.push('200');
        //console.log('values: ', values);

        @obs.bindable
        class tester {
            constructor(public dom: string) {
            }
            stop() {
                console.log('stop();');
            }
            @obs.property public chidren: point[] = [];
            get value(): string {
                return '';
            }
            @obs.before(() => tester.prototype.close()).event
            loop() {
                console.log('loop();');
            }
            @obs.after(() => tester.prototype.chidren.$$invokeEachElementInArray().solo()).event
            close(): string {
                console.log('close();', this.joke);
                let z: Function;

                return '';
            }
            @obs.after(() => tester.prototype.close()).property
            joke: point;
            @obs.bind(() => tester.prototype.joke.x).property
            tom: string;
            @obs.after(() => tester.prototype.joke.solo()).property public jason: string;
            @obs.method
            public jazz() {
                console.log('jazz.........................');
            }
        }

        @obs.bindable
        class tester2 extends tester {
            @obs.bind(() => tester.prototype.jason).property public node: string;
        }
        console.log('before constructing tester2 .........................');
        let t = new tester2('hell');
        t.loop();
        let p = new point();
        let p2 = new point();
        p2.x = 200;
        p2.y = 300;

        let t2 = new tester2('zink');
        t2.chidren.push(p2);

        obs.bindBefore(() => {
            t.tom = t.jason;
            t2.tom = t.jason;
        });

        p.x = 30;
        p.y = 43;



        console.log('----------points: ', p, p2);

        t.chidren.push(p, p2);

        console.log('set t.joke as point ..........');
        t.joke = p;

        console.log('t.joke:', t.joke);
        console.log('t.tom:', t.tom);
        console.log('t.jason:', t.jason);
        console.log('t.node:', t.node);
        t2.tom = <any>88;

        console.log('t.joke:', t.joke);
        console.log('t.tom:', t.tom);
        console.log('t.jason:', t.jason);
        console.log('t.node:', t.node);





        console.log(t.chidren, t2.chidren, t2.tom);

        obs.invokeAfter(() => t.loop = <any>t.close);

        let arr = new ObservableArray(20, '30', 120);

        arr.onchange = (ev) => {
            console.log('ObservableArray Event:', ev.items, ev.startIndex, ev.operation);
        }

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
            let itr = obs.getIterator(arr);
            let ir: IteratorResult<any>;
            while (ir = itr.next()) {
                if (ir.done) break;
                console.log('iterating array: ', ir.value);

            }
        }
        delete arr[0];
        let jjjj = { test: 1, hello: 2 };
        console.log('Is Object Array? ', obs.isArray(jjjj));



        console.log('Array', arr.length, arr[0], arr[1], arr[2]);



        let arrIndex: number = 0;
        arr.forEach(item => {
            console.log(arrIndex, item);
            arrIndex++;
        });

        arr[0] = 198;

        console.log('Array', arr.length, arr[0], arr[1], arr[2]);

        let j: HTMLDivElement;


 
        class SyncElement {

            public pupolateHTMLElement(child: SyncElement) {

            }
            public parent: SyncElement;
        }
        class a extends SyncElement {
            constructor() {
                super();
                this.view = document.createElement('a');
            }
            @obs.property
            public view: HTMLAnchorElement;
        }
        class div extends SyncElement {
            constructor() {
                super();
            }
            @obs.property
            public view: HTMLDivElement;
            get flexBasis(): number {
                return Number(this.view.style.flexBasis);
            }
            set flexBasis(value: number) {
                this.view.style.flexBasis = value.toString();
            }
        }
        class flexSplitter extends div {
            @obs.property public button: div;
            @obs.property public arrow: svg;
        }

        class svg extends SyncElement {
            constructor() {
                super();
                this.view = document.createElement('svg');
            }
            @obs.property
            public view: HTMLElement;
        }
         
        class SyncWindow extends SyncElement {
            get window() {
                return window;
            }
            get document() {
                return window.document;
            }
            public children: ObservableArray<SyncElement> = new ObservableArray<SyncElement>();
        }
    }
}


module ObservableTest {
    let enabled: boolean = false;
    if (enabled) {
        @obs.bindable
        class Flower {
            @obs.property public Name: string;
        }
        class FlowerProduct {
            @obs.property public Name: string;
        }

        @obs.bindable
        class TargetArray<T> extends ObservableArray<T> {
            constructor(...items: T[]) {
                super();
                Array.prototype.push.apply(this, items);
            }
            @obs.property
            public moether: string = 'job seeker';
        }

        @obs.bindable
        class PopulationTest {
            constructor(public id: string) {
            }
            @obs.default(() => ObservableArray.prototype.parent).property
            public flowers: ObservableArray<Flower> = new ObservableArray<Flower>();


            @obs.method
            public flower2product(flower: Flower) {
                return obs.new(new FlowerProduct(), f => f.Name = flower.Name);
            }

            @obs.default(() => ObservableArray.prototype.parent)
                .observe(() => PopulationTest.prototype.flowers, () => PopulationTest.prototype.flower2product)
                .populate(() => PopulationTest.prototype.view)
                .property
            public products: ObservableArray<FlowerProduct> = new ObservableArray<FlowerProduct>();


            @obs.property
            public view: any[] = [];
        }

    
        @obs.bindable
        class Test2 extends PopulationTest {
        }

        console.log('----------- Begin Observable Array Test ------------');
        let pt = new PopulationTest('instance 0');

        console.log(pt.flowers.asArray(), pt.products.asArray(), pt.view);

        pt.flowers.push(obs.new(new Flower(), f=>f.Name = 'Rose'));



        console.log('after add one', pt.flowers.asArray(), pt.products.asArray(), pt.view);

        pt.flowers = new ObservableArray<Flower>();

        //debug.logPropertyDecorators(pt.flowers);

        pt.products = new TargetArray<FlowerProduct>();

        //debug.logPropertyDecorators(pt.products);

        console.log('after reset flowers', pt.flowers.asArray(), pt.products.asArray(), pt.view);

        pt.flowers.push(obs.new(new Flower(), f => f.Name = 'Rose'));
        console.log('after add again', pt.flowers.asArray(), pt.products.asArray(), pt.view);

        let t2 = new Test2('OK');

        //debug.logPropertyDecorators(t2);


        console.log('----------- End Observable Array Test ------------');

    }
}

module PathChangeTest {
    let enabled: boolean = false;
    if (enabled) {
        obs.bindable 
        class Bird {
            @obs.property
            public Name: string;
        }
        @obs.bindable
        class Branch {
            @obs.property
            public birds: ObservableArray<Bird> = new ObservableArray<Bird>();
        }
        @obs.bindable
        class host {
            @obs.property
            branch: Branch;
            @obs.default(()=>ObservableArray.prototype.parent).observe(() => host.prototype.branch.birds).property 
            public catched: ObservableArray<Bird> = new ObservableArray<Bird>();
        }

        let h = new host();
        console.log('just initialized', h.branch?h.branch.birds.asArray():null, h.catched.asArray());
        h.branch = new Branch();
        console.log('after set branch', h.branch.birds.asArray(), h.catched.asArray());
        h.branch.birds.push(obs.new(new Bird(), b => b.Name = 'macaw'));

        console.log('after add macaw', h.branch.birds.asArray(), h.catched.asArray());
    }
}

module ListenTest {
    let enabled: boolean = false;
    if (enabled) {
        class joker {
            onmouse: (x: number, y: number) => any;
            invoke = (x: number, y: number) => {
                if (this.onmouse) this.onmouse(x, y);
            }
        }

        @obs.bindable
        class host {
            @obs.property
            joke: joker;

            @obs.listen(() => host.prototype.joke.onmouse).event //
            whenJoke(x: number, y: number) {
                console.log('whenJoke:', x, y);
            }
        }

        let h = new host();

        let j = new joker();

        console.log('j: ', j.invoke);

        h.joke = j;

        console.log('h.joke.invoke: ', h.joke);
        h.joke.invoke(10, 18);

        obs.block(h, () => host.prototype.whenJoke, () => {
            console.log('h.joke.invoke(20, 24) when blocking');
            h.joke.invoke(20, 24);
        });

        h.joke.invoke(32, 228);
    }
}


let decoratorlist: memberDecorator[] = []; 
module inheritTest {
    let enabled: boolean = false; 
    if (enabled) {

        @obs.bindable
        class base {
            @obs.property
            seed0: sender = new sender();

            @obs.listen(()=>base.prototype.seed0.tick).event
            method = () => {
                console.log('--- base.method invoked ---');
            }
        }
        @obs.bindable
        class host extends base {
            @obs.property
            seed1: sender = new sender();
            @obs.property
            seed2: sender = new sender();


            @obs.listen(()=>host.prototype.seed1.tick, ()=>host.prototype.seed2.tick).event
            method = () => {
                console.log('--- host.method invoked ---');
            }
        }
        @obs.bindable
        class sender {
            @obs.event
            public tick = () => {
            }
        }

        let h = new host();
        console.log('h.seed0.tick()');
        h.seed0.tick();
        console.log('h.seed1.tick()');
        h.seed1.tick();
        console.log('h.seed2.tick()');
        h.seed2.tick();
    }
}

module observeTest {
    let enabled = true;
    if (enabled) {
        @obs.bindable
        class Host {
            @obs.observable(ObservableArray).default(()=>ObservableArray.prototype.parent).observe(()=>Host.prototype.views).property
            public children: ObservableArray<Child>;
            @obs.observable(ObservableArray).default(() => ObservableArray.prototype.parent).property
            public views: ObservableArray<Child>;

            @obs.listen(()=>Host.prototype.children.onchange).event
            public listenOb = () => {
            }
        }
        @obs.bindable
        class Child {
        }

        let h = new Host();


        console.log('begin set children.', h.views);
        h.children = new ObservableArray<Child>();

        console.log('end set children.');
    }
}