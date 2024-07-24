// pump.js
export class Pump {
    constructor(name, label, type, lat, long, status, sequences, toRelations = ['c1fa']) {
        this.name = name;
        this.label = label;
        this.type = type;
        this.lat = lat;
        this.long = long;
        this.status = status;
        this.sequences = sequences;
        this.toRelations = toRelations;
    }

    deviceRuleChain(msg, metadata, msgType) {
        if (msgType === 'POST_TELEMETRY_REQUEST') {
            this.status = msg.status;
        }

        return {
            msg: msg,
            metadata: metadata,
            msgType: msgType
        };
    }
}

// module.exports = Pump;