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



// just the map part of script.js
  // Map Widget
  // Initialize the map
  var map = L.map('map').setView([-19.576, 147.31], 14); // Centering on a general coordinate
  
  // Add a tile layer to the map
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri — Source: Esri, DeLorme, NAVTEQ',
      maxZoom: 45
  }).addTo(map);
  
  // Add polygons to the map
  setsData.forEach((set, index) => {
    const irrigationStatus = sets[set.name].irrigationStatus;
    const color = irrigationStatus === 'on' ? "#0088D1" : irrigationStatus === 'off' ? '#E65200' : 'blue';
    const isSelected = sets[set.name].selected === 'yes';
  
    L.polygon(set.coordinates, {
      color: isSelected ? 'yellow' : color,
      fillOpacity: isSelected ? 0.5 : 0.3,
      opacity: isSelected ? 1 : 0.6,
      weight: isSelected ? 3 : 1.5
    }).addTo(map)
      .bindPopup(`<b>Set ${index + 1}</b>`)
      .bindTooltip(`s${index + 1}`, { permanent: true, direction: 'center', className: 'plain-text-tooltip' });
  });
  
  // Fit the map to the bounds of the polygons with a padding of 50px
  map.fitBounds(setsData.map(set => set.coordinates), { padding: [40, 40] });
  
  // Add custom CSS to remove the box and style the text
  var style = document.createElement('style');
  style.innerHTML = `
  .plain-text-tooltip {
    background: none;
    border: none;
    box-shadow: none;
    font-size: 12px; /* Adjust the font size as needed */
    color: white; /* Adjust the text color as needed */
  }
  `;
  document.head.appendChild(style);
  
  // Add the event listener for the Set2 fill button
  document.getElementById('start-set2-fill').addEventListener('click', function() {
    startSet2Fill();
  });
  
  // Function to create the progress polygon
  function createProgressPolygon(polygonCoords, progress) {
    const boundingBox = findBoundingBox(polygonCoords);
    const minX = boundingBox.minX;
    const maxX = boundingBox.maxX;
    const minY = boundingBox.minY;
    const maxY = boundingBox.maxY;
  
    const currentY = minY + (maxY - minY) * progress;
  
    const progressPolygonCoords = [
        [minY, minX],
        [currentY, minX],
        [currentY, maxX],
        [minY, maxX]
    ];
  
    return L.polygon(progressPolygonCoords, {color: '#007BFF', fillOpacity: 0.4, opacity: 0.8});
  }
  
  // Function to find the bounding box of the polygon
  function findBoundingBox(coords) {
    let minX = coords[0][1], maxX = coords[0][1];
    let minY = coords[0][0], maxY = coords[0][0];
  
    coords.forEach(function(coord) {
        if (coord[1] < minX) minX = coord[1];
        if (coord[1] > maxX) maxX = coord[1];
        if (coord[0] < minY) minY = coord[0];
        if (coord[0] > maxY) maxY = coord[0];
    });
  
    return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
  }
  
  // Function to start the simulation for Set2
  function startSet2Fill() {
    const button = document.getElementById('start-set2-fill');
    button.disabled = true; // Disable the button
    // change style of button to make it look disabled
    button.style.backgroundColor = "grey";
  
    let progress = 0;
    const set2Coordinates = setsData.find(set => set.name === 'c1fa-set2').coordinates;
    let progressPolygon = createProgressPolygon(set2Coordinates, progress);
    progressPolygon.addTo(map);
  
    const interval = setInterval(function() {
        if (progress >= 1) {
            clearInterval(interval);
            button.disabled = true; // Keep the button disabled
        } else {
            progress += 0.01;
            map.removeLayer(progressPolygon);
            progressPolygon = createProgressPolygon(set2Coordinates, progress);
            progressPolygon.addTo(map);
            clipProgressPolygon(progressPolygon, set2Coordinates);
        }
    }, 100);
  
    map.on('zoomend', () => {
        clipProgressPolygon(progressPolygon, set2Coordinates);
    });
  
    // Allow for manual interruption of the simulation (optional)
    document.getElementById('stop-irrigation-plan').addEventListener('click', function() {
        clearInterval(interval);
        button.disabled = false; // Re-enable the button if interrupted
    });
  }
  
  // Function to clip the progress polygon to the main polygon
  function clipProgressPolygon(progressPolygon, mainPolygonCoords) {
    const svg = d3.select(map.getPanes().overlayPane).select("svg").select("g");
    const clipPathId = "clip-" + Math.random().toString(36).substr(2, 9);
  
    svg.select("defs").remove(); // Remove previous clip paths
    const clipPath = svg.append("defs").append("clipPath")
        .attr("id", clipPathId);
  
    clipPath.append("polygon")
        .attr("points", mainPolygonCoords.map(function(coord) {
            return map.latLngToLayerPoint(coord).x + "," + map.latLngToLayerPoint(coord).y;
        }).join(" "));
  
    // Apply clip path to the progress polygon
    d3.select(progressPolygon._path).attr("clip-path", "url(#" + clipPathId + ")");
  }
  
  // Initial setup and event listeners for the map
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('sequence-container');
    displaySequences(container, sequences, all_sequences[1]);
  
    map.on('zoomend', () => {
        setsData.forEach((set, index) => {
            const setLayer = L.polygon(set.coordinates, {color: 'transparent'}).addTo(map);
            clipProgressPolygon(setLayer, set.coordinates);
        });
    });
  });
  