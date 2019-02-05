import { NewUUID } from "./Functions";

class DataListItem {
    constructor(key, value, { order = 1, weight = 1, uuid = NewUUID() }) {
        this.UUID = uuid;
        this.Key = key;
        this.Value = value;
        this.Order = order;
        this.Weight = weight;
    }
}

export default DataListItem;