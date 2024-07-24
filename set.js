// set.js
export class Set {
    constructor(name, label, type, duration, irrigationStatus, sequence, valves = [], pumps = [], wlSensors = []) {
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
        this.wlSensors = wlSensors;
    }
}

// module.exports = Set;

