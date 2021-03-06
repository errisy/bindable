# Bindable TS
a typescript binding over decorator

* This package has been upgraded as npm module errisy-bindable, use the following command to install errisy-bindable (updated in Fed 2017):
```
npm install errisy-bindable
```

## Why?
Many javascript framework has the binding feature for HMTL templates, such AngularJS, KnockoutJS, etc.
But with the power of typescript decorators, it is possible to set up object to object bindings with simple decorator codes.

Bindings and Events are the basis of UI automation. This project was inspired by the concept of WPF(Windows Presentation Foundation).

[bindable.ts](bindable/bindable/bindable.ts) is the basis for setting bindings, in which the obs ("Object Binding Service") offers the access to most binding features; and [ui.ts](bindable/bindable/ui.ts) contains the ofs ("Object Framework Service"), which is designed for structured UI. Eventually, [ui.ts](bindable/bindable/ui.ts) will allows the description of UI template with typescript.

Here is an example of a UI class with is view children defined by the embedded controlTemplate class. When the class control is built, the 'rect' and 'Text' are initiated and added to the 'viewChildren' ObservableArray.
```typescript
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
```

## Weak Reference in Binding and Event with Path Change Detection.
All the bindings and events are kept as 'weak reference' ITrigger. Once ITrigger.target is set to undefined, the ITrigger will be removed by the caller.

When A.property binds to (or A.method listens to) A.branch.value, if A.branch is changed, the path change can be detected by either the binding host and listener. They will set the ITrigger.target of previous ITrigger to undefined to disable previous binding and listen and then set up new binding and listen to the newly assigned branch.

The author has another project that he must finish by the end of Sep 2016, so the progress of this framework is suspended.



Eventually, the bindable framework should offer a front-end UI style that is very similar to WPF.

## How to get the example working on your computer?
[bindable.ts](bindable/bindable/bindable.ts) relies on nothing. You can use this single file in anywhere.
[ui.ts](bindable/bindable/ui.ts) contains canvas layout examples, so it requires EaselJS and AngularJS2. But [ui.ts](bindable/bindable/ui.ts) itself is a set of logic that mimics WPF. You can change the underlying view implementation to DOM elements and it should work for HTML.

The exmaple contains on AngularJS2 and EaselJS. It also has a NodeJS server script in the [/bindable/bindable/server.sys.js](bindable/server.sys.js). You can start the server with [watch.cmd](bindable/watch.cmd). You can certainly use any other web servers, since the files in this project are purely front-end.

## where is the file?
the bindable.ts is at [bindable\bindable.ts](bindable/bindable/bindable.ts)

## how it works?
bindable ts enables simple binding set up with member decorators
@obs.bind(()
### Set up binding simply and specify behaviors of a property with before/after etc.
```typescript
@obs.bindable 
class Person {
    @obs.property
    public Name: string;
    @obs
      .bind(()=>Person.prototyope.Name.FirstName)
      .before(()=>Person.prototype.beforeFirstNameChange)
      .after(()=>Person.prototype.FirstNameChanged)
      .property
    public FirstName: string;
    @obs.event
    public beforeFirstNameChange = () => {
        console.log('before first name is changed.');
    }
    @obs.event
    public FirstNameChanged = () => {
        console.log('first name is changed.');
    }
}
@obs.bindable
class Name{
    @obs.property
    public Surname: string;
    @obs.property
    public FirstName: string;
}

let p = new Person();
p.FirstName = 'Jack'; // p.Name.FirstName will change as well.
```

### Observe an Observable Array
ObservableArray is another feature of the bindable ts. It can monitor another ObservableArray (ObservationSource), transform the elements with observer, and keep the transformed elements in it. It can also transform its own elements with populator and write into the PopulationTarget array.
```typescript
@obs.bindable 
class Bird {
    @obs.property
    public Name: string;
}
@obs.bindable
class Branch {
    @obs.observable(ObservableArray).property
    public birds: ObservableArray<Bird>;
}
@obs.bindable
class host {
    @obs.property
    branch: Branch;
    @obs.observable(ObservableArray).default(()=>ObservableArray.prototype.parent).observe(() => host.prototype.branch.birds).property 
    public catched: ObservableArray<Bird>;
}

let h = new host();
console.log('just initialized', h.branch?h.branch.birds.asArray():null, h.catched.asArray());
h.branch = new Branch();
console.log('after set branch', h.branch.birds.asArray(), h.catched.asArray());
h.branch.birds.push(obs.new(new Bird(), b => b.Name = 'macaw'));

console.log('after add macaw', h.branch.birds.asArray(), h.catched.asArray());
```

### Set up event listener

```typescript
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


    @obs
      .listen(()=>host.prototype.seed1.tick, ()=>host.prototype.seed2.tick) //the event can listen multiple sources
      .event
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

```
