import {BehaviorSubject} from "rxjs";

class Service {
    constructor() {
        this.table_data = new BehaviorSubject([]);
    }
}

export default new Service();