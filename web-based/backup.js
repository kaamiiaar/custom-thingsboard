EventModule.addEvent('set', metadata.curr_set);

EventModule.addEvent('sequence', sequence);



// if there are no sets to open
if (seqTransitionPlanParent.setsToOpen.length === 0) {
    // msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "TURNING_PUMPS_ON";
    console.log(`[${new Date().toLocaleTimeString()}] Checking if there are pumps to turn on ...`);

    // if there are pumps to turn on
    if (seqTransitionPlanParent.pumpsToOn.length > 0) {
        // send downlink to turn on the pumps
        for (var i = 0; i < seqTransitionPlanParent.pumpsToOn.length; i++) {
            metadata.originatorName = seqTransitionPlanParent.pumpsToOn[i];
            msg = {
                "status": "on"
            };
            this.sendDownlink(msg, metadata);
        } 

        setTimeout(() => {
            console.log(`[${new Date().toLocaleTimeString()}] waiting for uplinks ...`);
        }, 3000);

        // Simulate uplinks from the pumps
        for (var i = 0; i < seqTransitionPlanParent.pumpsToOn.length; i++) {
            metadata.originatorName = seqTransitionPlanParent.pumpsToOn[i];
            msg = {
                "status": "on"
            };
            msgType = 'POST_TELEMETRY_REQUEST';
            this.pumpRuleChain(msg, metadata, msgType);
        }

    // if there are no pumps to turn on, check if there are pumps to turn off  
    } else if (seqTransitionPlanParent.pumpsToOff.length > 0) {
        // msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "TURNING_PUMPS_OFF";
        console.log(`[${new Date().toLocaleTimeString()}] Checking if there are pumps to turn off ...`);
        // send downlink to turn off the pumps
        for (var i = 0; i < seqTransitionPlanParent.pumpsToOff.length; i++) {
            metadata.originatorName = seqTransitionPlanParent.pumpsToOff[i];
            msg = {
                "status": "off"
            };
            this.sendDownlink(msg, metadata);
        }

        setTimeout(() => {
            console.log(`[${new Date().toLocaleTimeString()}] waiting for uplinks ...`);
        }, 3000);

        // Simulate uplinks from the pumps
        for (var i = 0; i < seqTransitionPlanParent.pumpsToOff.length; i++) {
            metadata.originatorName = seqTransitionPlanParent.pumpsToOff[i];
            msg = {
                "status": "off"
            };
            msgType = 'POST_TELEMETRY_REQUEST';
            this.pumpRuleChain(msg, metadata, msgType);
        }

    // if there are no pumps to turn on or off, check if there are sets to close
    } else if (seqTransitionPlanParent.setsToClose.length > 0) {
        // msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "CLOSING_PREV_VALVES";
        console.log(`[${new Date().toLocaleTimeString()}] Checking if there are sets to close ...`);

        // send downlink to close the sets
        for (var i = 0; i < seqTransitionPlanParent.setsToClose.length; i++) {
            metadata.curr_set = seqTransitionPlanParent.setsToClose[i];
            msgType = 'CLOSE_SET';
            this.setRuleChain(msg, metadata, msgType);
    }
} 



else if (msgType === 'NEXT_STEP_TRANSITION') {  
    var ALL_STATUSES = ["OPENING_NEXT_VALVES", "TURNING_PUMPS_ON", "TURNING_PUMPS_OFF", "CLOSING_PREV_VALVES", "COMPLETED"];

    // if parent sequence doesn't exist in metadata
    if (!metadata.parent_sequence) {
        metadata.parent_sequence = msg.custom_irrig_info.sequences[metadata.curr_sequence].parent;
    }
    
    var seqTransitionPlanParent = msg.custom_irrig_info.sequences[metadata.parent_sequence].seqTransitionPlan;
    var seqTransitionParentStatus = msg.custom_irrig_info.sequences[metadata.parent_sequence].status;
    console.log(`[${new Date().toLocaleTimeString()}] *** Next step in transition from parent sequence "${metadata.parent_sequence}" to its children sequences: ${msg.custom_irrig_info.sequences[metadata.parent_sequence].children}`);

    function splitForDownlink(iterable, deviceStatus, transitionStatus, tb_instance){
        // remove current set/pump from the iterable and print what's left
        switch (transitionStatus) {
            case "OPENING_NEXT_VALVES":
                var index = iterable.indexOf(metadata.curr_set);
                if (index > -1) {
                    iterable.splice(index, 1);
                }
                console.log(`[${new Date().toLocaleTimeString()}] How many sets left to open? ${seqTransitionPlanParent.setsToOpen.length}`);
                break;
            case "TURNING_PUMPS_ON":
                console.log(`[${new Date().toLocaleTimeString()}] How many pumps left to turn on? ${seqTransitionPlanParent.pumpsToOn.length}`);
                var index = iterable.indexOf(metadata.originatorName);
                if (index > -1) {
                    iterable.splice(index, 1);
                }
                break;
            case "TURNING_PUMPS_OFF":
                console.log(`[${new Date().toLocaleTimeString()}] How many pumps left to turn off? ${seqTransitionPlanParent.pumpsToOff.length}`);
                var index = iterable.indexOf(metadata.originatorName);
                if (index > -1) {
                    iterable.splice(index, 1);
                }
                break;
            case "CLOSING_PREV_VALVES":
                var index = iterable.indexOf(metadata.curr_set);
                if (index > -1) {
                    iterable.splice(index, 1);
                }
                console.log(`[${new Date().toLocaleTimeString()}] How many sets left to close? ${seqTransitionPlanParent.setsToClose.length}`);
                break;
            default:
                console.log(`[${new Date().toLocaleTimeString()}] Sequence status not recognized`);
        }

        // if there are no more elements in the iterable
        // move to the next step in the transition
        if (iterable.length === 0) {
            console.log(`[${new Date().toLocaleTimeString()}] Moving to the next step in the transition ...`);
            // find the index of the status and go to the next one
            var index = ALL_STATUSES.indexOf(transitionStatus);
            if (index < ALL_STATUSES.length - 1) {
                msg.custom_irrig_info.sequences[metadata.parent_sequence].status = ALL_STATUSES[index + 1];
                tb_instance.seqRuleChain(msg, metadata, 'NEXT_STEP_TRANSITION');
            }
            
            // if the transition is completed
            else if (index === ALL_STATUSES.length - 1) {
                console.log(`[${new Date().toLocaleTimeString()}] Transition completed for sequence ${metadata.parent_sequence} to its children sequences: ${msg.custom_irrig_info.sequences[metadata.parent_sequence].children}`);
                msg.custom_irrig_info.sequences[metadata.parent_sequence].status = "COMPLETED";
                // remove the parent sequence from the transitioning_sequences
                var index = msg.custom_irrig_info.transitioning_sequences.indexOf(metadata.parent_sequence);
                if (index > -1) {
                    msg.custom_irrig_info.transitioning_sequences.splice(index, 1);
                }
            }
            // now we just have to wait for timer or water leak uplink
            return; // it stops the function
        }

        // in case there are still elements in the iterable
        for (var i = 0; i < iterable.length; i++) {
            metadata.originatorName = iterable[i];
            msg = {
                "status": deviceStatus
            };
            tb_instance.sendDownlink(msg, metadata);
        };

        // pause for 3 seconds
        setTimeout(() => {
            console.log(`[${new Date().toLocaleTimeString()}] waiting for uplinks ...`);
        }, 3000);

        // Simulate uplinks from the pumps
        for (var i = 0; i < iterable.length; i++) {
            metadata.originatorName = iterable[i];
            msg = {
                "status": deviceStatus
            };
            msgType = 'POST_TELEMETRY_REQUEST';
            tb_instance.pumpRuleChain(msg, metadata, msgType);
        }
    };

    // let's rewrite everything using switch
    switch (seqTransitionParentStatus) {
        case "OPENING_NEXT_VALVES":
            console.log(`[${new Date().toLocaleTimeString()}] Checking if there are sets to open ...`);
            splitForDownlink(seqTransitionPlanParent.setsToOpen, 'on', 'OPENING_NEXT_VALVES', this);
            break;
        case "TURNING_PUMPS_ON":
            console.log(`[${new Date().toLocaleTimeString()}] Checking if there are pumps to turn on ...`);
            splitForDownlink(seqTransitionPlanParent.pumpsToOn, 'on', 'TURNING_PUMPS_ON', this);
            break;
        case "TURNING_PUMPS_OFF":
            console.log(`[${new Date().toLocaleTimeString()}] Checking if there are pumps to turn off ...`);
            splitForDownlink(seqTransitionPlanParent.pumpsToOff, 'off', 'TURNING_PUMPS_OFF', this);
            break;
        case "CLOSING_PREV_VALVES":
            console.log(`[${new Date().toLocaleTimeString()}] Checking if there are sets to close ...`);
            splitForDownlink(seqTransitionPlanParent.setsToClose, 'off', 'CLOSING_PREV_VALVES', this);
            break;
        default:
            console.log(`[${new Date().toLocaleTimeString()}] Sequence status not recognized`);
    }
}


{  
    // var ALL_STATUSES = ["OPENING_FIRST_SETS", "TURNING_PUMPS_ON", "TURNING_PUMPS_OFF", "CLOSING_PREV_VALVES", "COMPLETED"];

    // if parent sequence doesn't exist in metadata
    if (!metadata.parent_sequence) {
        metadata.parent_sequence = msg.custom_irrig_info.sequences[metadata.curr_sequence].parent;
    }
    
    var seqTransitionPlanParent = msg.custom_irrig_info.sequences[metadata.parent_sequence].seqTransitionPlan;
    var seqTransitionParentStatus = msg.custom_irrig_info.sequences[metadata.parent_sequence].status;
    console.log(`[${new Date().toLocaleTimeString()}] *** ${seqTransitionParentStatus} - Next step in transition from parent sequence "${metadata.parent_sequence}" to its children sequences: ${msg.custom_irrig_info.sequences[metadata.parent_sequence].children}`);

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
            console.log(`[${new Date().toLocaleTimeString()}] Sequence status not recognized`);
    

    // in case we just started a new transitionStatus
    if (metadata.TransitionStepStarted) {
        for (var i = 0; i < iterable.length; i++) {
            metadata.originatorName = iterable[i];
            msg = {
                "status": deviceStatus
            };
            tb_instance.sendDownlink(msg, metadata);
        };

        // pause for 3 seconds
        setTimeout(() => {
            console.log(`[${new Date().toLocaleTimeString()}] waiting for uplinks ...`);
        }, 3000);

        // Simulate uplinks from the pumps
        for (var i = 0; i < iterable.length; i++) {
            metadata.originatorName = iterable[i];
            msg = {
                "status": deviceStatus
            };
            msgType = 'POST_TELEMETRY_REQUEST';
            tb_instance.pumpRuleChain(msg, metadata, msgType);
        }
    }
}
}
