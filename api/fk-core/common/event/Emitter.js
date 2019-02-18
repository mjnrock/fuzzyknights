import { Subject } from "rxjs";

class Emitter {
    constructor() {
        this.Subjects = {};
    }

    Emit(name, data) {
        this.Subjects[name] || (this.Subjects[name] = new Subject());
        this.Subjects[name].next(data);

        return this;
    }

    Listen(name, handler) {
        this.Subjects[name] || (this.Subjects[name] = new Subject());

        return this.Subjects[name].subscribe(handler);
    }

    GetData(name) {
        return this.Subjects[name].asObservable();
    }
}

export default Emitter;