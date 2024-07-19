// thingsboard.js
export class Thingsboard {
    constructor(devices, assets) {
        this.devices = Object.freeze(devices); // Freezing the devices array
        this.assets = Object.freeze(assets);   // Freezing the assets array
        this.wlSensorsWaiting = [];
    }

    pauseAndReceiveUplink(msg, metadata, msgType) {
        // Send Uplinks to the respective device rule chains
        var deviceName = metadata.originatorName;
        var device = this.devices[deviceName];
        var deviceType = device.type;

        if (deviceType === 'pump') {
            // console.log(`[${new Date().toLocaleTimeString()}] Pump uplink message for device ${deviceName}: ${JSON.stringify(msg)}`);
            this.pumpRuleChain(msg, metadata, msgType);
        } else if (deviceType === 'valve') {
            // console.log(`[${new Date().toLocaleTimeString()}] Valve uplink message for device ${deviceName}: ${JSON.stringify(msg)}`);
            this.valveRuleChain(msg, metadata, msgType);
        } else if (deviceType === 'water alert sensor') {
            // console.log(`[${new Date().toLocaleTimeString()}] water alert sensor uplink message for device ${deviceName}: ${JSON.stringify(msg)}`);
            this.wlSensorRuleChain(msg, metadata, msgType);
        }
    }

    sendDownlink(msg, metadata, msgType='') {
        console.log(`[${new Date().toLocaleTimeString()}] Sending downlink to ${metadata.originatorName} with message: ${JSON.stringify(msg)}`);        
        // pause and receive uplink
        this.pauseAndReceiveUplink(msg, metadata, msgType='POST_TELEMETRY_REQUEST');
    }

    wlSensorRuleChain(msg, metadata, msgType) {
        if (msgType === 'POST_TELEMETRY_REQUEST') {
            console.log(`[${new Date().toLocaleTimeString()}] [UPLINK] water alert sensor uplink received: ${JSON.stringify(msg)} from water alert sensor ${metadata.originatorName}`);
            console.log(`[${new Date().toLocaleTimeString()}] *** water alert sensor rule chain triggered with message: ${JSON.stringify(msg)}`);
            
            var wlSensor = this.devices[metadata.originatorName]; 
            wlSensor.status = msg.status;

            // remove the water alert sensor from the waiting list
            var index = this.wlSensorsWaiting.indexOf(metadata.originatorName);
            if (index > -1) {
                this.wlSensorsWaiting.splice(index, 1);
            }

            var curr_set = this.assets[wlSensor.toRelations[0]];    // which set?
            var curr_farm = this.assets[curr_set.toRelations[0]];    // which farm?
            msg.custom_irrig_info = curr_farm.custom_irrig_info;    // get the irrigation information

            // check if the water alert sensor is wet
            if (msg.status === "Wet") {
                // transition that set
                metadata.curr_set = curr_set.name;
                EventModule.addEvent('set', metadata.curr_set);
                msgType = 'TRANSITION_SET';
                this.setRuleChain(msg, metadata, msgType);
            }
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
                // see which sequence gave the command to the pump, do this by seeing which transitioning sequence the pump belongs to
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
                // see which sequence gave the command to the pump, do this by seeing which transitioning sequence the pump belongs to
                for (var sequenceIndex = 0; sequenceIndex < msg.custom_irrig_info.transitioning_sequences.length; sequenceIndex++) {
                    var sequence = msg.custom_irrig_info.transitioning_sequences[sequenceIndex];
                    if (msg.custom_irrig_info.sequences[sequence].seqTransitionPlan.pumpsToOff.includes(metadata.originatorName)) {
                        metadata.parent_sequence = sequence;
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

            var curr_set_name = device.toRelations[0];    // which set?
            var curr_set = this.assets[curr_set_name];    // which set?
            var curr_farm = this.assets[curr_set.toRelations[0]];      // which farm?

            msg.custom_irrig_info = curr_farm.custom_irrig_info;    // get the irrigation information
            metadata.curr_set = curr_set_name;      // set the current set

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
                // msg.custom_irrig_info.sets[firstSet].valvesToVisit = [...msg.custom_irrig_info.sets[firstSet].valves];
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
            var theLastSet = msg.custom_irrig_info.sequences[metadata.curr_sequence].sets.length > 0 ? [msg.custom_irrig_info.sequences[metadata.curr_sequence].sets[msg.custom_irrig_info.sequences[metadata.curr_sequence].sets.length - 1]] : [];

            // have to save this attribute inside the parent sequence
            var seqTransitionPlan = {
                
                // 1. open all first sets
                "setsToOpen": [...allFirstSets],
                
                // 2. turn on all the pumpsToOn
                "pumpsToOn": [...pumpsToOn],
                
                // 3. turn off all the pumpsToOff
                "pumpsToOff": [...pumpsToOff],
                
                // 4. close all sets inside the curr_sequence
                "setsToClose": theLastSet
            };

            console.log(`[${new Date().toLocaleTimeString()}] Transition plan for sequence ${metadata.curr_sequence} to children sequences: ${children_sequences} is: ${JSON.stringify(seqTransitionPlan, null, 2)}`);

            msg.custom_irrig_info.sequences[metadata.curr_sequence].seqTransitionPlan = seqTransitionPlan;
            msg.custom_irrig_info.sequences[metadata.curr_sequence]["status"] = "OPENING_FIRST_SETS";     // options: OPENING_FIRST_SETS, TURNING_PUMPS_ON, TURNING_PUMPS_OFF, CLOSING_PREV_VALVES
            
            // add this sequence to the transitioning_sequences
            msg.custom_irrig_info.transitioning_sequences.push(metadata.curr_sequence);

            // reset the waiting list for water alert sensors
            this.wlSensorsWaiting = [];

            // // send downlink to open all the first sets
            // for (var i = 0; i < allFirstSets.length; i++) {
            //     metadata.curr_set = allFirstSets[i];       // can also change the originator to the set in TB
            //     msgType = 'OPEN_SET';
            //     this.setRuleChain(msg, metadata, msgType);

            // }    
            msg.custom_irrig_info.sequences[metadata.curr_sequence].status = "OPENING_FIRST_SETS";
            metadata.parent_sequence = metadata.curr_sequence;
            this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');   
        }

        else if (msgType === 'CHECK_TRANSITION_FOR_UPLINK') {
            // if parent sequence doesn't exist in metadata
            // if (!metadata.parent_sequence) {
            //     metadata.parent_sequence = msg.custom_irrig_info.sequences[metadata.curr_sequence].parent;
            // }
            var seqTransitionPlanParent = msg.custom_irrig_info.sequences[metadata.parent_sequence].seqTransitionPlan;
            var seqTransitionParentStatus = msg.custom_irrig_info.sequences[metadata.parent_sequence].status;
            console.log(`[${new Date().toLocaleTimeString()}] *** Checking transition for uplink with message type: ${msgType} for parent sequence ${metadata.parent_sequence} having status: ${seqTransitionParentStatus}`);

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
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    }
                    break;
                default:
                    console.log(`[${new Date().toLocaleTimeString()}] No transition status found for sequence ${metadata.parent_sequence}`);
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
                case "OPENING_FIRST_SETS":
                    var allFirstSets = [...seqTransitionPlanParent.setsToOpen];
                    var iterable = seqTransitionPlanParent.setsToOpen;

                    console.log(`[${new Date().toLocaleTimeString()}] How many sets left to open? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "TURNING_PUMPS_ON";
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    } else {
                        for (var i = 0; i < allFirstSets.length; i++) {
                            metadata.curr_set = allFirstSets[i];
                            msgType = 'OPEN_SET';
                            this.setRuleChain(msg, metadata, msgType);
                        }
                    }
                    break;
                case "TURNING_PUMPS_ON":
                    var allPumpsToOn = [...seqTransitionPlanParent.pumpsToOn];
                    var iterable = seqTransitionPlanParent.pumpsToOn;

                    console.log(`[${new Date().toLocaleTimeString()}] How many pumps left to turn on? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "TURNING_PUMPS_OFF";
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    } else {
                        for (var i = 0; i < allPumpsToOn.length; i++) {
                            metadata.originatorName = allPumpsToOn[i];
                            msg = {
                                "status": "on"
                            };
                            this.sendDownlink(msg, metadata);
                        };
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
                        for (var i = 0; i < allPumpsToOff.length; i++) {
                            metadata.originatorName = allPumpsToOff[i];
                            msg = {
                                "status": "off"
                            };
                            this.sendDownlink(msg, metadata);
                        };
                    }
                    break;
                    
                case "CLOSING_PREV_VALVES":
                    var iterable = seqTransitionPlanParent.setsToClose;
                    var allSetsToClose = [...seqTransitionPlanParent.setsToClose];
                    var index = iterable.indexOf(metadata.curr_set);
                    
                    console.log(`[${new Date().toLocaleTimeString()}] How many sets left to close? ${iterable.length}`);
                    if (iterable.length === 0) {
                        msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "COMPLETED";
                        this.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
                    } else {
                        // send downlink to close all these sets
                        for (var i = 0; i < allSetsToClose.length; i++) {
                            metadata.curr_set = allSetsToClose[i];       // can also change the originator to the set in TB
                            msgType = 'CLOSE_SET';
                            this.setRuleChain(msg, metadata, msgType);
                        }
                    }
                    break;

                case "COMPLETED":
                    // remove the parent sequence from the transitioning_sequences and add it to the visited sequences
                    var index = msg.custom_irrig_info.transitioning_sequences.indexOf(metadata.parent_sequence);
                    if (index > -1) {
                        msg.custom_irrig_info.transitioning_sequences.splice(index, 1);
                    }
                    msg.custom_irrig_info.visited_sequences.push(metadata.parent_sequence);

                    // if all sequences have been visited
                    if (msg.custom_irrig_info.visited_sequences.length === msg.custom_irrig_info.all_sequences.length) {
                        console.log(`[${new Date().toLocaleTimeString()}] *** Farm irrigation completed - all sequences visited.`);
                        console.log("=".repeat(120));
                        console.log("=".repeat(120));
                    } else {
                    
                        console.log(`[${new Date().toLocaleTimeString()}] *** Transition of sequence ${metadata.parent_sequence} completed.`);
                        console.log("=".repeat(120));
                        console.log(`Children sequences initiated in parallel: ${msg.custom_irrig_info.sequences[metadata.parent_sequence].children}
                            waiting for uplink from water alert sensors: ${this.wlSensorsWaiting}`);

                        // pause and receive uplink for all the wlSensors
                        var allWlSensors = [...this.wlSensorsWaiting];
                        for (var j = 0; j < allWlSensors.length; j++) {
                            metadata.originatorName = allWlSensors[j];
                            // remove the wlSensor from the waiting list
                            var index = this.wlSensorsWaiting.indexOf(metadata.originatorName);
                            if (index > -1) {
                                this.wlSensorsWaiting.splice(index, 1);
                            }
                            this.pauseAndReceiveUplink(msg={
                                "status": "Wet"
                            }, metadata, msgType='POST_TELEMETRY_REQUEST');
                        }
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

            // add the water alert sensor to the waiting list
            this.wlSensorsWaiting.push(set.wlSensors[0]);

            // send downlink to open the valves
            var valves = set.valves;
            set.valvesToVisit = [...set.valves];
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
            set.valvesToVisit = [...set.valves];
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
            
            // if all valves have been visited for a set
            if (valvesToVisit.length === 0) {
                console.log(`[${new Date().toLocaleTimeString()}] All valves have been visited for set ${metadata.curr_set}`);
                msg.custom_irrig_info.sets[metadata.curr_set].irrigationStatus = msg.status;  // set the irrigation status to on or off
                metadata.curr_sequence = msg.custom_irrig_info.sets[metadata.curr_set].sequence;
                metadata.parent_sequence = msg.custom_irrig_info.sequences[metadata.curr_sequence].parent;

                // is parent sequence in transition? this also means that it is the first set in the sequence; may change it in the future
                if (msg.status === 'on'){
                    // if parent is transitioning
                    if (msg.custom_irrig_info.transitioning_sequences.includes(metadata.parent_sequence)) {
                        msgType = 'CHECK_TRANSITION_FOR_UPLINK';
                        this.seqRuleChain(msg, metadata, msgType);
                    } else {
                    var prev_set_index = msg.custom_irrig_info.sequences[metadata.curr_sequence].sets.indexOf(metadata.curr_set)-1;
                        if (prev_set_index >= 0) {
                            var prev_set = msg.custom_irrig_info.sequences[metadata.curr_sequence].sets[prev_set_index];
                            metadata.curr_set = prev_set;
                            msgType = 'CLOSE_SET';
                            this.setRuleChain(msg, metadata, msgType);
                        }
                    }
                } else if (msg.status === 'off') {
                    // if curr sequence is transitioning
                    if (msg.custom_irrig_info.transitioning_sequences.includes(metadata.curr_sequence)) {
                        metadata.parent_sequence = metadata.curr_sequence;
                        msgType = 'CHECK_TRANSITION_FOR_UPLINK';
                        this.seqRuleChain(msg, metadata, msgType);
                    } 
                    // if curr set is transitioning
                    else if (msg.custom_irrig_info.sets[metadata.curr_set].inTransition) {
                        console.log(`[${new Date().toLocaleTimeString()}] Set ${metadata.curr_set} transition is completed - waiting for the next set water alert sensor.`);
                        console.log("=".repeat(120));

                        // if exists, call uplink for the next water alert sensor in waiting
                        // in real world, this shouldn't work but I'm just using this approach for the simulation
                        if (this.wlSensorsWaiting.length > 0) {
                            metadata.originatorName = this.wlSensorsWaiting[0];
                            this.pauseAndReceiveUplink(msg={
                                "status": "Wet"
                            }, metadata, msgType='POST_TELEMETRY_REQUEST');
                        }
                        
                    }
                    else {
                        msgType = 'TRANSITION_SET';
                        this.setRuleChain(msg, metadata, msgType);
                    }
                        
                }
            }
        
        }
        else if (msgType === 'TRANSITION_SET') {
            var curr_set_name = metadata.curr_set;
            var curr_set_obj = msg.custom_irrig_info.sets[curr_set_name];

            // find the sequence that the set belongs to
            var sequence = curr_set_obj.sequence;
            var curr_set_index = msg.custom_irrig_info.sequences[sequence].sets.indexOf(metadata.curr_set);

            // if there is a next set in the sequence
            if (curr_set_index < msg.custom_irrig_info.sequences[sequence].sets.length - 1) {
                // set isTransition to true
                curr_set_obj.inTransition = true;
                var next_set_name = msg.custom_irrig_info.sequences[sequence].sets[curr_set_index + 1];

                metadata.curr_set = next_set_name;
                msgType = 'OPEN_SET';
                this.setRuleChain(msg, metadata, msgType);
                // closing the previous set will be handled in the CHECK_VALVES_TO_VISIT after all valves have been visited in the next set
            
            } else {
                // if there is no next set in the sequence, transition to the next sequence
                console.log(`[${new Date().toLocaleTimeString()}] Sequence ${sequence} completed - go for sequence transition.`);
                EventModule.addEvent('sequence', sequence);

                console.log("=".repeat(120));
                // console.log(`Transitioning to the next sequences: ${msg.custom_irrig_info.sequences[sequence].children}`);

                // change the status of the set to off
                curr_set_obj.irrigationStatus = "off";
                metadata.curr_sequence = sequence;
                this.seqRuleChain(msg, metadata, 'TRANSITION_SEQUENCE');
            }              
    }
}
}

// module.exports = Thingsboard;
