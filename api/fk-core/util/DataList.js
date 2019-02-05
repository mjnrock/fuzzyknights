import { NewUUID } from "./Functions";
import DataListItem from "./DataListItem";

class DataList {
    constructor(values, weights) {
        this.Values = this.SetValues(values);
        this.Weights = this.SetWeights(weights);
    }

    GetValues() {
        return this.Values;
    }
    SetValues(values = {}) {
        this.Values = values;

        return this;
    }

    GetWeights() {
        return this.Weights;
    }
    SetWeights(weights = {}) {
        this.Weights = weights;

        return this;
    }
    

    Add(key, value, { order = 1, weight = 1 }) {
        let item = new DataListItem(key, value, { weight, order });
        
        this.Values[item.key] = (item);

        return this;
    }
}

export default DataList;