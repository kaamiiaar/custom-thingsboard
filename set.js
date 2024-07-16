// set.js
class Set {
    constructor(name, label, type, duration, irrigationStatus, sequence, valves = [], pumps = []) {
        this.name = name;
        this.label = label;
        this.type = type;
        this.duration = duration;
        this.irrigationStatus = irrigationStatus;
        this.sequence = sequence;
        this.valves = valves;
        this.pumps = pumps;
        this.fromRelations = [];
        this.toRelations = ["c1fa"];
    }
}

module.exports = Set;

