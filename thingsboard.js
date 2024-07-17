// thingsboard.js
class Thingsboard {
    constructor(devices, assets) {
        this.devices = Object.freeze(devices); // Freezing the devices array
        this.assets = Object.freeze(assets);   // Freezing the assets array
        this.wlSensorsWaiting = [];
    }

    pauseAndReceiveUplink(msg, metadata, msgType) {
        // Send Uplinks to the respective device rule chains
        var deviceName = metadata.originatorName;
        msg = msg;
        var device = this.devices[deviceName];
        var deviceType = device.type;

        if (deviceType === 'pump') {
            console.log(`[${new Date().toLocaleTimeString()}] Pump uplink message for device ${deviceName}: ${JSON.stringify(msg)}`);
            this.pumpRuleChain(msg, metadata, msgType);
        } else if (deviceType === 'valve') {
            console.log(`[${new Date().toLocaleTimeString()}] Valve uplink message for device ${deviceName}: ${JSON.stringify(msg)}`);
            this.valveRuleChain(msg, metadata, msgType);
        } else if (deviceType === 'water alert sensor') {
            console.log(`[${new Date().toLocaleTimeString()}] Water level sensor uplink message for device ${deviceName}: ${JSON.stringify(msg)}`);
            this.wlSensorRuleChain(msg, metadata, msgType);
        }
    }

    sendDownlink(msg, metadata, msgType='') {
        console.log(`[${new Date().toLocaleTimeString()}] Sending downlink to ${metadata.originatorName} with message: ${JSON.stringify(msg)}`);        
    }

    wlSensorRuleChain(msg, metadata, msgType) {
        if (msgType === 'POST_TELEMETRY_REQUEST') {
            console.log(`[${new Date().toLocaleTimeString()}] [UPLINK] Water level sensor uplink received: ${JSON.stringify(msg)} from water level sensor ${metadata.originatorName}`);
            console.log(`[${new Date().toLocaleTimeString()}] *** Water level sensor rule chain triggered with message: ${JSON.stringify(msg)}`);
            var wlSensor = this.devices[metadata.originatorName]; 
            wlSensor.status = msg.status;
        }
    }

    pumpRuleChain(msg, metadata, msgType) {
        if (msgType === 'POST_TELEMETRY_REQUEST') {
            console.log(`[${new Date().toLocaleTimeString()}] [UPLINK] Pump uplink received: ${JSON.stringify(msg)} from pump ${metadata.originatorName}`);
            console.log(`[${new Date().toLocaleTimeString()}] *** Pump rule chain triggered with message: ${JSON.stringify(msg)}`);
            var pump = this.devices[metadata.originatorName];     // get the pump
            pump.status = msg.status;      // save telemetry
            // console.log(`[${new Date().toLocaleTimeString()}] Pump information: ${JSON.stringify(pump, null, 2)}`);
            
            // find which farm the pump belongs to
            var curr_farm = this.assets[pump.toRelations[0]];      // which farm?
            msg.custom_irrig_info = curr_farm.custom_irrig_info;    // get the irrigation information
            
            // is it on?
            if (msg.status === "on") {
                // see which sequence gave the command to the pump
                for (var sequenceIndex = 0; sequenceIndex < msg.custom_irrig_info.transitioning_sequences.length; sequenceIndex++) {
                    var sequence = msg.custom_irrig_info.transitioning_sequences[sequenceIndex];
                    if (msg.custom_irrig_info.sequences[sequence].seqTransitionPlan.pumpsToOn.includes(metadata.originatorName)) {
                        metadata.parent_sequence = sequence;
                        break;
                    }
                }
                msgType = 'CHECK_TRANSITION_FOR_UPLINK';
            }
            else if (msg.status === "off") {
                // see which sequence gave the command to the pump
                for (var sequence in msg.custom_irrig_info.transitioning_sequences) {
                    if (msg.custom_irrig_info.sequences[sequence].seqTransitionPlan.pumpsToOff.includes(metadata.originatorName)) {
                        parent.curr_sequence = sequence;
                        break;
                    }
                }
                msgType = 'CHECK_TRANSITION_FOR_UPLINK';
            }
            
            this.seqRuleChain(msg, metadata, msgType);   // forward the message to the sequence rule chain
        }
    }

    valveRuleChain(msg, metadata, msgType) {
        if (msgType === 'POST_TELEMETRY_REQUEST') {
            console.log(`[${new Date().toLocaleTimeString()}] [UPLINK] Valve uplink received: ${JSON.stringify(msg)} from valve ${metadata.originatorName}`);
            console.log(`[${new Date().toLocaleTimeString()}] *** Valve rule chain triggered with message: ${JSON.stringify(msg)}`);
            var device = this.devices[metadata.originatorName];     // get the device
            device.status = msg.status;      // save telemetry
            // console.log(`[${new Date().toLocaleTimeString()}] Valve information: ${JSON.stringify(device, null, 2)}`);

            var curr_set = this.assets[this.devices[metadata.originatorName].toRelations[0]];    // which set?
            var curr_farm = this.assets[curr_set.toRelations[0]];      // which farm?

            msg.custom_irrig_info = curr_farm.custom_irrig_info;    // get the irrigation information
            
            msgType = 'CHECK_VALVES_TO_VISIT';
            this.setRuleChain(msg, metadata, msgType);   // forward the message to the set rule chain to check if all valves have been visited
        }
        }

    farmRuleChain(msg, metadata, msgType) {
        console.log(`[${new Date().toLocaleTimeString()}] *** Farm rule chain triggered with message keys: ${JSON.stringify(Object.keys(msg))}`);
        var farm = metadata.originatorName;
        farm.auto_irrig = msg.auto_irrig;
        
        // print farm information - just return the keys
        console.log(`[${new Date().toLocaleTimeString()}] Farm information: ${JSON.stringify(Object.keys(farm), null, 2)}`);

        // console.log(`Farm information: ${JSON.stringify(farm.irrig_info, null, 2)}, ${farm.auto_irrig}`);

        metadata.curr_sequence = "root";
        msgType = 'TRANSITION_SEQUENCE';
        msg.custom_irrig_info = farm.custom_irrig_info;
        this.seqRuleChain(msg, metadata, msgType);

    }

    seqRuleChain(msg, metadata, msgType) {
        console.log(`[${new Date().toLocaleTimeString()}] *** Sequence rule chain triggered with message type: ${msgType} for sequence ${metadata.curr_sequence}`);
        if (msgType === 'TRANSITION_SEQUENCE') {
            var children_sequences = msg.custom_irrig_info.sequences[metadata.curr_sequence].children;
            var parentPumps = msg.custom_irrig_info.sequences[metadata.curr_sequence].pumps;

            var allFirstSets = [];
            var childrenPumps = [];
            for (var i = 0; i < children_sequences.length; i++) {
                var child = children_sequences[i];
                var sequence = msg.custom_irrig_info.sequences[child];
                var firstSet = sequence.sets[0];
                allFirstSets.push(firstSet);
                
                // To keep track of which valves are to be visited within a set
                msg.custom_irrig_info.sets[firstSet].valvesToVisit = [...msg.custom_irrig_info.sets[firstSet].valves];
                childrenPumps = childrenPumps.concat(sequence.pumps);
            }

            function arrayDifference(array1, array2) {
                var difference = [];
                for (var i = 0; i < array1.length; i++) {
                    if (array2.indexOf(array1[i]) === -1) {
                        difference.push(array1[i]);
                    }
                }
                return difference;
            }

            var pumpsToOn = arrayDifference(childrenPumps, parentPumps);
            var pumpsToOff = arrayDifference(parentPumps, childrenPumps);


            // have to save this attribute inside the parent sequence
            var seqTransitionPlan = {
                
                // 1. open all first sets
                "setsToOpen": allFirstSets,
                
                // 2. turn on all the pumpsToOn
                "pumpsToOn": pumpsToOn,
                
                // 3. turn off all the pumpsToOff
                "pumpsToOff": pumpsToOff,
                
                // 4. close all sets inside the curr_sequence
                "setsToClose": msg.custom_irrig_info.sequences[metadata.curr_sequence].sets
            };

            msg.custom_irrig_info.sequences[metadata.curr_sequence].seqTransitionPlan = seqTransitionPlan;
            msg.custom_irrig_info.sequences[metadata.curr_sequence]["status"] = "OPENING_FIRST_SETS";     // options: OPENING_FIRST_SETS, TURNING_PUMPS_ON, TURNING_PUMPS_OFF, CLOSING_PREV_VALVES
            
            // add this sequence to the transitioning_sequences
            msg.custom_irrig_info.transitioning_sequences.push(metadata.curr_sequence);

            // send downlink to open all the first sets
            for (var i = 0; i < allFirstSets.length; i++) {
                metadata.curr_set = allFirstSets[i];       // can also change the originator to the set in TB
                msgType = 'OPEN_SET';
                this.setRuleChain(msg, metadata, msgType);
            }

            // prepare message for uplink simulation
            for (var i = 0; i < allFirstSets.length; i++) {
                var valves = msg.custom_irrig_info.sets[allFirstSets[i]].valves;
                this.wlSensorsWaiting.push(msg.custom_irrig_info.sets[allFirstSets[i]].wlSensors[0]);

                // pause and receive uplink
                for (var j = 0; j < valves.length; j++) {
                    metadata.originatorName = valves[j];
                    this.pauseAndReceiveUplink(msg={
                        "status": "on"
                    }, metadata, msgType='POST_TELEMETRY_REQUEST');
                }
            }
        }

        else if (msgType === 'CHECK_TRANSITION_FOR_UPLINK') {
            // if parent sequence doesn't exist in metadata
            if (!metadata.parent_sequence) {
                metadata.parent_sequence = msg.custom_irrig_info.sequences[metadata.curr_sequence].parent;
            }
            var seqTransitionPlanParent = msg.custom_irrig_info.sequences[metadata.parent_sequence].seqTransitionPlan;
            var seqTransitionParentStatus = msg.custom_irrig_info.sequences[metadata.parent_sequence].status;
            console.log(`[${new Date().toLocaleTimeString()}] *** Checking transition for uplink with message type: ${msgType} for sequence ${metadata.parent_sequence} having status: ${seqTransitionParentStatus}`);

            switch (seqTransitionParentStatus) {
                case "OPENING_FIRST_SETS":
                    var iterable = seqTransitionPlanParent.setsToOpen;
                    var index = iterable.indexOf(metadata.curr_set);
                    if (index > -1) {
                        iterable.splice(index, 1);
                    }
                    console.log(`[${new Date().toLocaleTimeString()}] How many sets left to open? ${iterable.length}`);

                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "TURNING_PUMPS_ON";
                        metadata.TransitionStepStarted = true;
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    }
                    break;
                case "TURNING_PUMPS_ON":
                    var iterable = seqTransitionPlanParent.pumpsToOn;
                    var index = iterable.indexOf(metadata.originatorName);
                    if (index > -1) {
                        iterable.splice(index, 1);
                    }
                    console.log(`[${new Date().toLocaleTimeString()}] How many pumps left to turn on? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "TURNING_PUMPS_OFF";
                        metadata.TransitionStepStarted = true;
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    }
                    break;
                case "TURNING_PUMPS_OFF":
                    var iterable = seqTransitionPlanParent.pumpsToOff;
                    var index = iterable.indexOf(metadata.originatorName);
                    if (index > -1) {
                        iterable.splice(index, 1);
                    }
                    console.log(`[${new Date().toLocaleTimeString()}] How many pumps left to turn off? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "CLOSING_PREV_VALVES";
                        metadata.TransitionStepStarted = true;
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    }
                    break;
                case "CLOSING_PREV_VALVES":
                    var iterable = seqTransitionPlanParent.setsToClose;
                    var index = iterable.indexOf(metadata.curr_set);
                    if (index > -1) {
                        iterable.splice(index, 1);
                    }
                    console.log(`[${new Date().toLocaleTimeString()}] How many sets left to close? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "COMPLETED";

                        // remove the parent sequence from the transitioning_sequences
                        var index = msg.custom_irrig_info.transitioning_sequences.indexOf(metadata.parent_sequence);
                        if (index > -1) {
                            msg.custom_irrig_info.transitioning_sequences.splice(index, 1);
                        }
                    }   
                    break;
                default:
                    console.log(`[${new Date().toLocaleTimeString()}] Sequence status ${seqTransitionParentStatus} not recognized`);
        
                }
            }

        else if (msgType === 'NEXT_STEP_TRANSITION') 
        {
            if (!metadata.parent_sequence) {
                metadata.parent_sequence = msg.custom_irrig_info.sequences[metadata.curr_sequence].parent;
            }
            var seqTransitionPlanParent = msg.custom_irrig_info.sequences[metadata.parent_sequence].seqTransitionPlan;
            var seqTransitionParentStatus = msg.custom_irrig_info.sequences[metadata.parent_sequence].status;
            
            switch (seqTransitionParentStatus) {
                case "TURNING_PUMPS_ON":
                    var allPumpsToOn = [...seqTransitionPlanParent.pumpsToOn];
                    var iterable = seqTransitionPlanParent.pumpsToOn;

                    console.log(`[${new Date().toLocaleTimeString()}] How many pumps left to turn on? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "TURNING_PUMPS_OFF";
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    } else {
                        for (var i = 0; i < iterable.length; i++) {
                            metadata.originatorName = iterable[i];
                            msg = {
                                "status": "on"
                            };
                            this.sendDownlink(msg, metadata);
                        };

                        // pause and receive uplink for simulation
                        for (var j = 0; j < allPumpsToOn.length; j++) {
                            metadata.originatorName = allPumpsToOn[j];
                            this.pauseAndReceiveUplink(msg={
                                "status": "on"
                            }, metadata, msgType='POST_TELEMETRY_REQUEST');
                        }
                    }
                    break;
                case "TURNING_PUMPS_OFF":
                    var allPumpsToOff = [...seqTransitionPlanParent.pumpsToOff];
                    var iterable = seqTransitionPlanParent.pumpsToOff;

                    console.log(`[${new Date().toLocaleTimeString()}] How many pumps to turn off? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "CLOSING_PREV_VALVES";
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    } else {
                        for (var i = 0; i < iterable.length; i++) {
                            metadata.originatorName = iterable[i];
                            msg = {
                                "status": "off"
                            };
                            this.sendDownlink(msg, metadata);
                        };
                        // pause and receive uplink for simulation
                        for (var j = 0; j < allPumpsToOff.length; j++) {
                            metadata.originatorName = allPumpsToOff[j];
                            this.pauseAndReceiveUplink(msg={
                                "status": "off"
                            }, metadata, msgType='POST_TELEMETRY_REQUEST');
                        }
                    }
                    break;
                    
                case "CLOSING_PREV_VALVES":
                    var iterable = seqTransitionPlanParent.setsToClose;
                    var index = iterable.indexOf(metadata.curr_set);
                    
                    console.log(`[${new Date().toLocaleTimeString()}] How many sets left to close? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "COMPLETED";
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    } else {
                        // send downlink to close all these sets
                        for (var i = 0; i < iterable.length; i++) {
                            metadata.curr_set = iterable[i];       // can also change the originator to the set in TB
                            msgType = 'CLOSE_SET';
                            this.setRuleChain(msg, metadata, msgType);
                        }
                    }
                    break;

                case "COMPLETED":
                    // pause and receive uplink for all the wlSensors
                    console.log(`[${new Date().toLocaleTimeString()}] *** Sequence ${metadata.parent_sequence} completed`);
                    for (var j = 0; j < this.wlSensorsWaiting.length; j++) {
                        metadata.originatorName = this.wlSensorsWaiting[j];
                        this.pauseAndReceiveUplink(msg={
                            "status": "Wet"
                        }, metadata, msgType='POST_TELEMETRY_REQUEST');
                    }
        }
    }
}

    setRuleChain(msg, metadata, msgType) {
        console.log(`[${new Date().toLocaleTimeString()}] *** Set rule chain triggered with message type: ${msgType} for set ${metadata.curr_set}`);
        if (msgType === 'OPEN_SET') {
            // Find the set
            var set = msg.custom_irrig_info.sets[metadata.curr_set];
            console.log(`[${new Date().toLocaleTimeString()}] Set information: ${JSON.stringify(set, null, 2)}`);

            // send downlink to open the valves
            var valves = set.valves;
            for (var i = 0; i < valves.length; i++) {
                metadata.originatorName = valves[i];
                msg = {
                    "status": "on"
                };
                this.sendDownlink(msg, metadata);
            }
        }

        else if (msgType === 'CLOSE_SET') {
            // Find the set
            var set = msg.custom_irrig_info.sets[metadata.curr_set];
            console.log(`[${new Date().toLocaleTimeString()}] Set information: ${JSON.stringify(set, null, 2)}`);

            // send downlink to close the valves
            var valves = set.valves;
            for (var i = 0; i < valves.length; i++) {
                metadata.originatorName = valves[i];
                msg = {
                    "status": "off"
                };
                this.sendDownlink(msg, metadata);
            }
        }

        else if (msgType === 'CHECK_VALVES_TO_VISIT') {
            var valvesToVisit = msg.custom_irrig_info.sets[metadata.curr_set].valvesToVisit;

            // remove the current valve
            var index = valvesToVisit.indexOf(metadata.originatorName);
            if (index > -1) {
                valvesToVisit.splice(index, 1);
            }

            console.log(`[${new Date().toLocaleTimeString()}] How many valves left to visit? ${valvesToVisit.length}`);
            
            if (valvesToVisit.length === 0) {
                console.log(`[${new Date().toLocaleTimeString()}] All valves have been visited for set ${metadata.curr_set}`);
                msg.custom_irrig_info.sets[metadata.curr_set].irrigationStatus = msg.status;  // set the irrigation status to on or off
                metadata.curr_sequence = msg.custom_irrig_info.sequences[metadata.curr_sequence].children[0];
                msgType = 'CHECK_TRANSITION_FOR_UPLINK';
                this.seqRuleChain(msg, metadata, msgType);
            }
        
        }
    }
}


module.exports = Thingsboard;
