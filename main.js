const Set = require('./set.js');
const Thingsboard = require('./thingsboard.js');
const Farm = require('./farm.js');
const Valve = require('./valve.js');
const Pump = require('./pump.js');
const WLSensor = require('./wlsensor.js');

// instantiate pumps
const pumps = {
    "c1fa-pump1": new Pump("c1fa-pump1", "Pump #2-1 (B)", "pump", -19.576565, 147.310215, "off", ["sequence2", "sequence4"], ["c1fa"]), // name, label, type, lat, long, status, sequences, toRelations
    "c1fa-pump2": new Pump("c1fa-pump2", "Pump #2-2 (B)", "pump", -19.577155, 147.313087, "off", ["sequence1", "sequence2"], ["c1fa"]),
    "c1fa-pump3": new Pump("c1fa-pump3", "Pump #2-3 (B)", "pump", -19.5776455, 147.3141453, "off", ["sequence3", "sequence3"], ["c1fa"]),
    "c1fa-pump4": new Pump("c1fa-pump4", "Pump #2-4 (B)", "pump", -19.577057, 147.317569, "off", ["sequence3", "sequence5"], ["c1fa"])
};

// instantiate WLSensors
const wlsensors = {
    "c1fa-was1": new WLSensor("c1fa-was1", "wl-sensor1", "water alert sensor", -19.575590, 147.3087600, "Dry", ['c1fa-set1']), // name, label, type, lat, long, status, toRelation
    "c1fa-was2": new WLSensor("c1fa-was2", "wl-sensor2", "water alert sensor", -19.569946, 147.3101766, "Dry", ['c1fa-set2']),
    "c1fa-was3": new WLSensor("c1fa-was3", "wl-sensor3", "water alert sensor", -19.5700269, 147.3110885, "Dry", ['c1fa-set3']),
    "c1fa-was4": new WLSensor("c1fa-was4", "wl-sensor4", "water alert sensor", -19.570128, 147.3119468, "Dry", ['c1fa-set4']),
    "c1fa-was5": new WLSensor("c1fa-was5", "wl-sensor5", "water alert sensor", -19.5702291, 147.312891, "Dry", ['c1fa-set5']),
    "c1fa-was6": new WLSensor("c1fa-was6", "wl-sensor6", "water alert sensor", -19.570301, 147.313817, "Dry", ['c1fa-set6']),
    "c1fa-was7": new WLSensor("c1fa-was7", "wl-sensor7", "water alert sensor", -19.570368, 147.314682, "Dry", ['c1fa-set7']),
    "c1fa-was8": new WLSensor("c1fa-was8", "wl-sensor8", "water alert sensor", -19.5704212, 147.3154337, "Dry", ['c1fa-set8']),
    "c1fa-was9": new WLSensor("c1fa-was9", "wl-sensor9", "water alert sensor", -19.5704919, 147.3161954, "Dry", ['c1fa-set9']),
    "c1fa-was10": new WLSensor("c1fa-was10", "wl-sensor10", "water alert sensor", -19.5705526, 147.3168928, "Dry", ['c1fa-set10']),
    "c1fa-was11": new WLSensor("c1fa-was11", "wl-sensor11", "water alert sensor", -19.5705829, 147.3175473, "Dry", ['c1fa-set11']),
    "c1fa-was12": new WLSensor("c1fa-was12", "wl-sensor12", "water alert sensor", -19.5706638, 147.318427, "Dry", ['c1fa-set12']),
    "c1fa-was13": new WLSensor("c1fa-was13", "wl-sensor13", "water alert sensor", -19.5707244, 147.319221, "Dry", ['c1fa-set13']),
    "c1fa-was14": new WLSensor("c1fa-was14", "wl-sensor14", "water alert sensor", -19.5748489, 147.3199183, "Dry", ['c1fa-set14'])
};


// instantiate Valves
const valves = {
    "c1fa-valve5-w": new Valve("c1fa-valve5-w", "HW1-5-west", "valve", -19.576446, 147.309009, "off", ["c1fa-set1"]),   // name, label, type, lat, long, status, toRelations
    "c1fa-valve5-e": new Valve("c1fa-valve5-e", "HW1-5-east", "valve", -19.576446, 147.309009, "off", ["c1fa-set2"]),
    "c1fa-valve4-w": new Valve("c1fa-valve4-w", "HW1-4-west", "valve", -19.576551, 147.309899, "off", ["c1fa-set2"]),
    "c1fa-valve4-e": new Valve("c1fa-valve4-e", "HW1-4-east", "valve", -19.576551, 147.309899, "off", ["c1fa-set3"]),
    "c1fa-valve3-w": new Valve("c1fa-valve3-w", "HW1-3-west", "valve", -19.576651, 147.31077, "off", ["c1fa-set3"]),
    "c1fa-valve3-e": new Valve("c1fa-valve3-e", "HW1-3-east", "valve", -19.576651, 147.31077, "off", ["c1fa-set4"]),
    "c1fa-valve2-w": new Valve("c1fa-valve2-w", "HW1-2-west", "valve", -19.576757, 147.311664, "off", ["c1fa-set4"]),
    "c1fa-valve2-e": new Valve("c1fa-valve2-e", "HW1-2-east", "valve", -19.576757, 147.311664, "off", ["c1fa-set5"]),
    "c1fa-valve1-w": new Valve("c1fa-valve1-w", "HW1-1-west", "valve", -19.576853, 147.312555, "off", ["c1fa-set5"]),
    "c1fa-valve6-w": new Valve("c1fa-valve6-w", "HW2-1-west", "valve", -19.577325, 147.313441, "off", ["c1fa-set6"]),
    "c1fa-valve6-e": new Valve("c1fa-valve6-e", "HW2-1-east", "valve", -19.577325, 147.313441, "off", ["c1fa-set7"]),
    "c1fa-valve7-w": new Valve("c1fa-valve7-w", "HW2-2-west", "valve", -19.5777175, 147.3143739, "off", ["c1fa-set7"]),
    "c1fa-valve7-e": new Valve("c1fa-valve7-e", "HW2-2-east", "valve", -19.5777175, 147.3143739, "off", ["c1fa-set8"]),
    "c1fa-valve8-w": new Valve("c1fa-valve8-w", "HW2-3-west", "valve", -19.577926, 147.315014, "off", ["c1fa-set8"]),
    "c1fa-valve8-e": new Valve("c1fa-valve8-e", "HW2-3-east", "valve", -19.577926, 147.315014, "off", ["c1fa-set9"]),
    "c1fa-valve9-e": new Valve("c1fa-valve9-e", "HW2-4-east", "valve", -19.577836, 147.315373, "off", ["c1fa-set9"]),
    "c1fa-valve10-w": new Valve("c1fa-valve10-w", "HW3-1-west", "valve", -19.577519, 147.316314, "off", ["c1fa-set10"]),
    "c1fa-valve10-e": new Valve("c1fa-valve10-e", "HW3-1-east", "valve", -19.577519, 147.316314, "off", ["c1fa-set11"]),
    "c1fa-valve11-e": new Valve("c1fa-valve11-e", "HW3-2-east", "valve", -19.577221, 147.317197, "off", ["c1fa-set12"]),
    "c1fa-valve12-e": new Valve("c1fa-valve12-e", "HW3-3-east", "valve", -19.576906, 147.318083, "off", ["c1fa-set13"]),
    "c1fa-valve13-e": new Valve("c1fa-valve13-e", "HW4-1-east", "valve", -19.5765265, 147.3191342, "off", ["c1fa-set14"]),
};

// instantiate Sets
const sets = {
    "c1fa-set1": new Set("c1fa-set1", "Set 1", "irrigation set", 10, "off", "sequence4", ["c1fa-valve5-w"], ["c1fa-pump1"], ["c1fa-was1"]),    // name, label, type, duration, irrigationStatus, sequence, valves = [], pumps = [], wlSensors = []
    "c1fa-set2": new Set("c1fa-set2", "Set 2", "irrigation set", 10, "off", "sequence2", ["c1fa-valve5-e", "c1fa-valve4-w"], ["c1fa-pump1", "c1fa-pump2"], ["c1fa-was2"]),
    "c1fa-set3": new Set("c1fa-set3", "Set 3", "irrigation set", 10, "off", "sequence2", ["c1fa-valve4-e", "c1fa-valve3-w"], ["c1fa-pump1", "c1fa-pump2"], ["c1fa-was3"]),
    "c1fa-set4": new Set("c1fa-set4", "Set 4", "irrigation set", 10, "off", "sequence2", ["c1fa-valve3-e", "c1fa-valve2-w"], ["c1fa-pump1", "c1fa-pump2"], ["c1fa-was4"]),
    "c1fa-set5": new Set("c1fa-set5", "Set 5", "irrigation set", 10, "off", "sequence2", ["c1fa-valve2-e", "c1fa-valve1-w"], ["c1fa-pump1", "c1fa-pump2"], ["c1fa-was5"]),
    "c1fa-set6": new Set("c1fa-set6", "Set 6", "irrigation set", 10, "off", "sequence2", ["c1fa-valve6-w"], ["c1fa-pump1", "c1fa-pump2"], ["c1fa-was6"]),
    "c1fa-set7": new Set("c1fa-set7", "Set 7", "irrigation set", 10, "off", "sequence1", ["c1fa-valve6-e", "c1fa-valve7-w"], ["c1fa-pump2", "c1fa-pump3"], ["c1fa-was7"]),
    "c1fa-set8": new Set("c1fa-set8", "Set 8", "irrigation set", 10, "off", "sequence3", ["c1fa-valve7-e", "c1fa-valve8-w"], ["c1fa-pump3", "c1fa-pump4"], ["c1fa-was8"]),
    "c1fa-set9": new Set("c1fa-set9", "Set 9", "irrigation set", 10, "off", "sequence3", ["c1fa-valve8-e", "c1fa-valve9-e"], ["c1fa-pump3", "c1fa-pump4"], ["c1fa-was9"]),
    "c1fa-set10": new Set("c1fa-set10", "Set 10", "irrigation set", 10, "off", "sequence3", ["c1fa-valve10-w"], ["c1fa-pump3", "c1fa-pump4"], ["c1fa-was10"]),
    "c1fa-set11": new Set("c1fa-set11", "Set 11", "irrigation set", 10, "off", "sequence3", ["c1fa-valve10-e"], ["c1fa-pump3", "c1fa-pump4"], ["c1fa-was11"]),
    "c1fa-set12": new Set("c1fa-set12", "Set 12", "irrigation set", 10, "off", "sequence3", ["c1fa-valve11-e"], ["c1fa-pump3", "c1fa-pump4"], ["c1fa-was12"]),
    "c1fa-set13": new Set("c1fa-set13", "Set 13", "irrigation set", 10, "off", "sequence3", ["c1fa-valve12-e"], ["c1fa-pump3", "c1fa-pump4"], ["c1fa-was13"]),
    "c1fa-set14": new Set("c1fa-set14", "Set 14", "irrigation set", 10, "off", "sequence5", ["c1fa-valve13-e"], ["c1fa-pump4"], ["c1fa-was14"])
};


// Define irrigation information with references to Set object keys
const irrig_info = {
    sets: sets,
    visitedSequences: [],
    transitioning_sequences: [],
    allSequences: ["root", "sequence1", "sequence2", "sequence3", "sequence4", "sequence5"],
    sequences: {
        root: {
            children: ["sequence1"],
            pumps: [],
            sets: [],
            curr_set_idx: 0
        },
        sequence1: {
            sets: ["c1fa-set7"],
            pumps: ["c1fa-pump2", "c1fa-pump3"],
            children: ["sequence2", "sequence3"],
            parent: "root",
            curr_set_idx: 0
        },
        sequence2: {
            sets: ["c1fa-set2", "c1fa-set3", "c1fa-set4", "c1fa-set5", "c1fa-set6"],
            pumps: ["c1fa-pump1", "c1fa-pump2"],
            children: ["sequence4"],
            parent: "sequence1",
            curr_set_idx: 0
        },
        sequence3: {
            sets: ["c1fa-set8", "c1fa-set9", "c1fa-set10", "c1fa-set11", "c1fa-set12", "c1fa-set13"],
            pumps: ["c1fa-pump3", "c1fa-pump4"],
            children: ["sequence5"],
            parent: "sequence1",
            curr_set_idx: 0
        },
        sequence4: {
            sets: ["c1fa-set1"],
            pumps: ["c1fa-pump1"],
            children: [],
            parent: "sequence2",
            curr_set_idx: 0
        },
        sequence5: {
            sets: ["c1fa-set14"],
            pumps: ["c1fa-pump4"],
            children: [],
            parent: "sequence3",
            curr_set_idx: 0
        }
    }
};

// Instantiate Farm
const farm_c1fa = new Farm(sets, irrig_info);

const devices = {
    ...pumps,
    ...wlsensors,
    ...valves
};

const assets = {
    "c1fa": farm_c1fa,
    ...sets
};

// Instantiate thingsboard
tb_pe = new Thingsboard(devices, assets);

// Use tb_pe when calling methods that need it
farm_c1fa.onClickStartIrrigation(tb_pe);
