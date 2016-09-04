# bindable
a typescript binding over decorator

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
