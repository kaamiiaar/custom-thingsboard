const all_sequences = ["root", "sequence1", "sequence2", "sequence3", "sequence4", "sequence5"];

const sequences = {
  root: {
    children: ["sequence1"],
    pumps: [],
    sets: [],
    curr_set_idx: 0,
    completed: false
  },
  sequence1: {
    sets: ["c1fa-set7"],
    pumps: ["c1fa-pump2", "c1fa-pump3"],
    children: ["sequence2", "sequence3"],
    parent: "root",
    curr_set_idx: 0,
    completed: false
  },
  sequence2: {
    sets: ["c1fa-set6", "c1fa-set5", "c1fa-set4", "c1fa-set3", "c1fa-set2"],
    pumps: ["c1fa-pump1", "c1fa-pump2"],
    children: ["sequence4"],
    parent: "sequence1",
    curr_set_idx: 0,
    completed: false
  },
  sequence3: {
    sets: ["c1fa-set8", "c1fa-set9", "c1fa-set10", "c1fa-set11", "c1fa-set12", "c1fa-set13"],
    pumps: ["c1fa-pump3", "c1fa-pump4"],
    children: ["sequence5"],
    parent: "sequence1",
    curr_set_idx: 0,
    completed: false
  },
  sequence4: {
    sets: ["c1fa-set1"],
    pumps: ["c1fa-pump1"],
    children: [],
    parent: "sequence2",
    curr_set_idx: 0,
    completed: false
  },
  sequence5: {
    sets: ["c1fa-set14"],
    pumps: ["c1fa-pump4"],
    children: [],
    parent: "sequence3",
    curr_set_idx: 0,
    completed: false
  }
};

function createSequenceElement(sequenceKey, sequence) {
  const sequenceElement = document.createElement('div');
  sequenceElement.classList.add('sequence');
  sequenceElement.id = sequenceKey;

  const title = document.createElement('h3');
  title.textContent = sequenceKey;
  sequenceElement.appendChild(title);

  const setsContainer = document.createElement('div');
  setsContainer.classList.add('sets-container');
  setsContainer.setAttribute('data-sequence', sequenceKey);

  sequence.sets.forEach(set => {
      const setElement = document.createElement('div');
      setElement.classList.add('set');
      setElement.id = set;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('set-checkbox');
      checkbox.addEventListener('change', function() {
        setDuration.disabled = !checkbox.checked;
      });

      const setName = document.createElement('span');
      setName.classList.add('set-name');
      setName.textContent = set;

      const setDuration = document.createElement('input');
      setDuration.type = 'number';
      setDuration.classList.add('set-duration');
      setDuration.placeholder = 'Hours';
      setDuration.min = 0;
      setDuration.disabled = true;

      setElement.appendChild(checkbox);
      setElement.appendChild(setName);
      setElement.appendChild(setDuration);
      setElement.draggable = true;
      setElement.addEventListener('dragstart', dragStart);
      setElement.addEventListener('dragend', dragEnd);
      setsContainer.appendChild(setElement);
  });

  setsContainer.addEventListener('dragover', dragOver);
  setsContainer.addEventListener('drop', drop);

  sequenceElement.appendChild(setsContainer);

  if (sequence.children.length > 0) {
      const childrenContainer = document.createElement('div');
      childrenContainer.classList.add('children');
      sequence.children.forEach(childKey => {
          const childElement = createSequenceElement(childKey, sequences[childKey]);
          childrenContainer.appendChild(childElement);
      });
      sequenceElement.appendChild(childrenContainer);
  }

  return sequenceElement;
}

function displaySequences(container, sequences, sequenceKey) {
  const sequence = sequences[sequenceKey];
  const sequenceElement = createSequenceElement(sequenceKey, sequence);
  container.appendChild(sequenceElement);
}

function markSequenceCompleted(sequenceKey) {
  const sequenceElement = document.getElementById(sequenceKey);
  if (sequenceElement) {
      sequenceElement.style.backgroundColor = '#d4edda';
      sequenceElement.style.borderColor = '#c3e6cb';
  }
}

function markSetCompleted(setId) {
  const setElement = document.getElementById(setId);
  if (setElement) {
      setElement.style.backgroundColor = '#d4edda';
      setElement.style.borderColor = '#c3e6cb';
  }
}

function dragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.id);
  e.target.classList.add('dragging');
}

function dragEnd(e) {
  e.target.classList.remove('dragging');
}

function dragOver(e) {
  e.preventDefault();
  const container = e.currentTarget;
  const afterElement = getDragAfterElement(container, e.clientY);
  const dropIndicators = document.querySelectorAll('.drop-indicator');
  dropIndicators.forEach(indicator => indicator.remove());

  const dropIndicator = document.createElement('div');
  dropIndicator.classList.add('drop-indicator');

  if (afterElement == null) {
      container.appendChild(dropIndicator);
  } else {
      container.insertBefore(dropIndicator, afterElement);
  }
}

function drop(e) {
  e.preventDefault();
  const setId = e.dataTransfer.getData('text');
  const draggedElement = document.getElementById(setId);
  const dropZone = e.target.closest('.sets-container');
  
  if (dropZone && draggedElement && dropZone.getAttribute('data-sequence') === draggedElement.closest('.sets-container').getAttribute('data-sequence')) {
      const afterElement = getDragAfterElement(dropZone, e.clientY);
      if (afterElement == null) {
          dropZone.appendChild(draggedElement);
      } else {
          dropZone.insertBefore(draggedElement, afterElement);
      }
      
      const sequenceKey = dropZone.getAttribute('data-sequence');
      const sequence = sequences[sequenceKey];
      
      sequence.sets = Array.from(dropZone.children).filter(child => child.classList.contains('set')).map(child => child.id);
  }
  
  const dropIndicators = document.querySelectorAll('.drop-indicator');
  dropIndicators.forEach(indicator => indicator.remove());
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.set:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
      } else {
          return closest;
      }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sequence-container');
  displaySequences(container, sequences, all_sequences[1]);
});

// Expose the functions to be used by the main.js
window.markSequenceCompleted = markSequenceCompleted;
window.markSetCompleted = markSetCompleted;


// Map Widget
const setsData = [
  {
    name: 'c1fa-set1',
    coordinates: [[-19.5759306, 147.3085443], [-19.5763669, 147.3085083], [-19.576442, 147.309018], [-19.5738569, 147.309299], [-19.5744596, 147.3091785], [-19.5749966, 147.3090017], [-19.5754109, 147.3088465], [-19.5756734, 147.3087131], [-19.5759306, 147.3085443]],
  },
  {
    name: 'c1fa-set2',
    coordinates: [[-19.576442, 147.309018], [-19.576544, 147.309902], [-19.569991, 147.310641], [-19.569924, 147.310022], [-19.569991, 147.3097126], [-19.576442, 147.309018]],
  },
  {
    name: 'c1fa-set3',
    coordinates: [[-19.57663, 147.310775], [-19.570082, 147.3115], [-19.569991, 147.310642], [-19.576543, 147.309901], [-19.576487, 147.310217], [-19.57658, 147.310362], [-19.57663, 147.310775]],
  },
  {
    name: 'c1fa-set4',
    coordinates: [[-19.576738, 147.311664], [-19.570178, 147.312403], [-19.570081, 147.3115], [-19.57663, 147.310775], [-19.576738, 147.311664]],
  },
  {
    name: 'c1fa-set5',
    coordinates: [[-19.576738, 147.311664], [-19.576796, 147.312146], [-19.576731, 147.312156], [-19.576831, 147.312562], [-19.570271, 147.313275], [-19.570178, 147.312403], [-19.576738, 147.311664]],
  },
  {
    name: 'c1fa-set6',
    coordinates: [[-19.577305, 147.313446], [-19.57033, 147.31419], [-19.570254, 147.313325], [-19.576894, 147.312593], [-19.577051, 147.312909], [-19.577077, 147.313126], [-19.577213, 147.313253], [-19.577305, 147.313446]],
  },
  {
    name: 'c1fa-set7',
    coordinates: [[-19.577676, 147.314292], [-19.570408, 147.315062], [-19.570331, 147.314191], [-19.577305, 147.313446], [-19.57766, 147.314192], [-19.577676, 147.314292]],
  },
  {
    name: 'c1fa-set8',
    coordinates: [[-19.577676, 147.314292], [-19.577684, 147.314339], [-19.577894, 147.314825], [-19.577919, 147.314932], [-19.57792, 147.315015], [-19.570473, 147.315807], [-19.570407, 147.315062], [-19.577676, 147.314292]],
  },
  {
    name: 'c1fa-set9',
    coordinates: [[-19.57792, 147.315015], [-19.577921, 147.315078], [-19.577689, 147.31577], [-19.570543, 147.316609], [-19.570473, 147.315807], [-19.57792, 147.315015]],
  },
  {
    name: 'c1fa-set10',
    coordinates: [[-19.5705519, 147.3166574], [-19.577685, 147.315863], [-19.577527, 147.316312], [-19.570592, 147.31714], [-19.5705519, 147.3166574]],
  },
  {
    name: 'c1fa-set11',
    coordinates: [[-19.577527, 147.316311], [-19.577216, 147.317194], [-19.570659, 147.317981], [-19.570592, 147.31714], [-19.577527, 147.316311]],
  },
  {
    name: 'c1fa-set12',
    coordinates: [[-19.577216, 147.317194], [-19.577127, 147.317447], [-19.576987, 147.317577], [-19.576997, 147.317816], [-19.576897, 147.318085], [-19.570728, 147.318833], [-19.570659, 147.317981], [-19.577216, 147.317194]],
  },
  {
    name: 'c1fa-set13',
    coordinates: [[-19.576897, 147.318085], [-19.576557, 147.319003], [-19.5708001, 147.3196194], [-19.570728, 147.318833], [-19.576897, 147.318085]],
  },
  {
    name: 'c1fa-set14',
    coordinates: [[-19.576519, 147.319128], [-19.575962, 147.3204706], [-19.575216, 147.320539], [-19.5745013, 147.3192953], [-19.5765008, 147.3190615], [-19.5765352, 147.3190894], [-19.576519, 147.319128]],
  },
];

class Set {
  constructor(name, label, type, duration, irrigationStatus, sequence, valves, pumps, wlSensors) {
    this.name = name;
    this.label = label;
    this.type = type;
    this.duration = duration;
    this.irrigationStatus = irrigationStatus;
    this.sequence = sequence;
    this.valves = valves;
    this.pumps = pumps;
    this.wlSensors = wlSensors;
    this.selected = false;
    this.duration = 0;
    this.progress = 0;
  }
}

const sets = {
  "c1fa-set1": new Set("c1fa-set1", "Set 1", "irrigation set", 10, "off", "sequence4", ["c1fa-valve5-w"], ["c1fa-pump1"], ["c1fa-was1"]),   // name, label, type, duration, irrigationStatus, sequence, valves, pumps, wlSensors
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


// Initialize the map
var map = L.map('map').setView([-19.576, 147.31], 14); // Centering on a general coordinate

// Add a tile layer to the map
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, DeLorme, NAVTEQ',
    maxZoom: 55
}).addTo(map);


// Add polygons to the map
setsData.forEach((set, index) => {
  const irrigationStatus = sets[set.name].irrigationStatus;
  const color = irrigationStatus === 'on' ? "#0088D1" : irrigationStatus === 'off' ? '#E65200' : 'blue';
  
  L.polygon(set.coordinates, { color, fillOpacity: 0.3, opacity: 0.6, weight: 1.5 }).addTo(map)
    .bindPopup(`<b>Set ${index + 1}</b>`)
    .bindTooltip(`s${index + 1}`, { permanent: true, direction: 'center', className: 'plain-text-tooltip' });
});

// Fit the map to the bounds of the polygons
map.fitBounds(setsData.flatMap(set => set.coordinates));

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

// Data
// Define device classes
class Device {
  constructor(name, label, type, lat, long, status) {
    this.name = name;
    this.label = label;
    this.type = type;
    this.lat = lat;
    this.long = long;
    this.status = status;
  }
}

class Pump extends Device {
  constructor(name, label, type, lat, long, status, sequences, toRelations) {
    super(name, label, type, lat, long, status);
    this.sequences = sequences;
    this.toRelations = toRelations;
  }
}

class WLSensor extends Device {
  constructor(name, label, type, lat, long, status, toRelations) {
    super(name, label, type, lat, long, status);
    this.toRelations = toRelations;
  }
}

class Valve extends Device {
  constructor(name, label, type, lat, long, status, toRelations) {
    super(name, label, type, lat, long, status);
    this.toRelations = toRelations;
  }
}

// Instantiate devices
const pumps = {
  "c1fa-pump1": new Pump("c1fa-pump1", "Pump #2-1 (B)", "pump", -19.576565, 147.310215, "off", ["sequence2", "sequence4"], ["c1fa"]),   // name, label, type, lat, long, status, sequences, toRelations
  "c1fa-pump2": new Pump("c1fa-pump2", "Pump #2-2 (B)", "pump", -19.577155, 147.313087, "off", ["sequence1", "sequence2"], ["c1fa"]),
  "c1fa-pump3": new Pump("c1fa-pump3", "Pump #2-3 (B)", "pump", -19.5776455, 147.3141453, "off", ["sequence3", "sequence3"], ["c1fa"]),
  "c1fa-pump4": new Pump("c1fa-pump4", "Pump #2-4 (B)", "pump", -19.577057, 147.317569, "off", ["sequence3", "sequence5"], ["c1fa"])
};

const wlsensors = {
  "c1fa-was1": new WLSensor("c1fa-was1", "wl-sensor1", "water alert sensor", -19.575590, 147.3087600, "Dry", ['c1fa-set1']),    // name, label, type, lat, long, status, toRelations
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

// Add devices to the map
const devices = { ...pumps, ...wlsensors, ...valves };

// Define custom icons for each device type and status
const iconSize = [22, 22]; // Adjust the size as needed

const pumpOnIcon = L.icon({
  iconUrl: 'path/to/pump-on.png', // Replace with the path to your pump on icon
  iconSize: iconSize,
  iconAnchor: [12.8, 25.6], // Adjust the anchor as needed
  popupAnchor: [0, -25.6] // Adjust the popup anchor as needed
});

const pumpOffIcon = L.icon({
  iconUrl: './icons/pump-off.png', // Replace with the path to your pump off icon
  iconSize: iconSize,
  iconAnchor: [12.8, 25.6], // Adjust the anchor as needed
  popupAnchor: [0, -25.6] // Adjust the popup anchor as needed
});

const wlSensorWetIcon = L.icon({
  iconUrl: './icons/wlsensor-wet.png', // Replace with the path to your WLSensor wet icon
  iconSize: iconSize,
  iconAnchor: [12.8, 25.6], // Adjust the anchor as needed
  popupAnchor: [0, -25.6] // Adjust the popup anchor as needed
});

const wlSensorDryIcon = L.icon({
  iconUrl: './icons/wlsensor-dry.png', // Replace with the path to your WLSensor dry icon
  iconSize: iconSize,
  iconAnchor: [12.8, 25.6], // Adjust the anchor as needed
  popupAnchor: [0, -25.6] // Adjust the popup anchor as needed
});

const valveClosedIcon = L.icon({
  iconUrl: './icons/valve-closed.png', // Replace with the path to your valve closed icon
  iconSize: iconSize,
  iconAnchor: [16, 32], // Adjust the anchor as needed
  popupAnchor: [0, -32] // Adjust the popup anchor as needed
});

const valveOpenLeftIcon = L.icon({
  iconUrl: './icons/valve-open-left.png', // Replace with the path to your valve open left icon
  iconSize: iconSize,
  iconAnchor: [16, 32], // Adjust the anchor as needed
  popupAnchor: [0, -32] // Adjust the popup anchor as needed
});

const valveOpenRightIcon = L.icon({
  iconUrl: './icons/valve-open-right.png', // Replace with the path to your valve open right icon
  iconSize: iconSize,
  iconAnchor: [16, 32], // Adjust the anchor as needed
  popupAnchor: [0, -32] // Adjust the popup anchor as needed
});

// Function to get the appropriate icon based on device type and status
function getIcon(device) {
  switch (device.type) {
    case 'pump':
      return device.status === 'on' ? pumpOnIcon : pumpOffIcon;
    case 'water alert sensor':
      return device.status === 'Wet' ? wlSensorWetIcon : wlSensorDryIcon;
    case 'valve':
      if (device.name.slice(-1) === 'e') {
        return device.status === 'off' ? valveClosedIcon : valveOpenRightIcon;
      } else if (device.name.slice(-1) === 'w') {
        return device.status === 'off' ? valveClosedIcon : valveOpenLeftIcon;
      } else {
        return valveClosedIcon;
      }
    default:
      return null;
  }
}

// Add devices to the map with custom icons
Object.values(devices).forEach(device => {
  L.marker([device.lat, device.long], { icon: getIcon(device) })
    .addTo(map)
    .bindPopup(`<b>${device.label}</b><br>Type: ${device.type}<br>Status: ${device.status}`);
});


document.addEventListener('DOMContentLoaded', function() {
  // Check the localStorage for the state
  if (localStorage.getItem('irrigationState') === 'started') {
    document.getElementById('sequence-container-wrapper').style.display = 'none';
    document.getElementById('irrigation-controls').style.display = 'block';
    document.getElementById('irrigation-controls').style.flex = '1';
    document.getElementById('irrigation-controls').style.overflowY = 'auto';
    document.getElementById('irrigation-controls').style.maxWidth = '800px';
  } else {
    document.getElementById('sequence-container-wrapper').style.display = 'block';
    document.getElementById('irrigation-controls').style.display = 'none';
    document.getElementById('sequence-container-wrapper').style.flex = '1';
    document.getElementById('sequence-container-wrapper').style.overflowY = 'auto';
    document.getElementById('sequence-container-wrapper').style.maxWidth = '800px';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Check the localStorage for the state
  if (localStorage.getItem('irrigationState') === 'started') {
    document.getElementById('sequence-container-wrapper').style.display = 'none';
    document.getElementById('irrigation-controls').style.display = 'block';
    document.getElementById('irrigation-controls').style.flex = '1';
    document.getElementById('irrigation-controls').style.overflowY = 'auto';
    document.getElementById('irrigation-controls').style.maxWidth = '800px';
  } else {
    document.getElementById('sequence-container-wrapper').style.display = 'block';
    document.getElementById('irrigation-controls').style.display = 'none';
    document.getElementById('sequence-container-wrapper').style.flex = '1';
    document.getElementById('sequence-container-wrapper').style.overflowY = 'auto';
    document.getElementById('sequence-container-wrapper').style.maxWidth = '800px';
  }
});

function getSelectedSets() {
  const selectedSets = [];
  let allDurationsProvided = true;

  document.querySelectorAll('.set-checkbox:checked').forEach(checkbox => {
    const set = checkbox.closest('.set').id;
    selectedSets.push(set);
    sets[set].selected = 'yes';

    const durationInput = checkbox.closest('.set').querySelector('.set-duration');
    const duration = durationInput.value;

    if (!duration) {
      durationInput.style.borderColor = 'red';
      allDurationsProvided = false;
    } else {
      durationInput.style.borderColor = ''; // Reset the border color if duration is provided
      sets[set].duration = duration;
    }
  });

  if (!allDurationsProvided) {
    alert('You need to provide a duration for any selected set.');
  }

  return allDurationsProvided ? selectedSets : [];
}

// on click of the start irrigation plan button
function showIrrigationControlPanel(selectedSets) {
  const container = document.getElementById('custom-sequence-container');
  container.innerHTML = '';

  selectedSets.forEach(set => {
    const setElement = document.createElement('div');
    setElement.classList.add('custom-set');
    setElement.id = set;

    const setLabel = document.createElement('label');
    setLabel.textContent = sets[set].label;
    setElement.appendChild(setLabel);

    const durationLabel = document.createElement('label');
    durationLabel.textContent = `Duration: ${sets[set].duration} hours`;
    setElement.appendChild(durationLabel);

    const irrigationStatus = document.createElement('label');
    irrigationStatus.textContent = `Status: ${sets[set].irrigationStatus}`;
    setElement.appendChild(irrigationStatus);

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');

    const progressBarFill = document.createElement('div');
    progressBarFill.classList.add('progress-bar-fill');
    progressBarFill.style.width = `${sets[set].progress}%`;
    progressBarFill.textContent = `${sets[set].progress}%`;

    progressBar.appendChild(progressBarFill);
    setElement.appendChild(progressBar);

    container.appendChild(setElement);
  });
}

// event listener for start irrigation button
document.getElementById('start-irrigation-plan').addEventListener('click', function() {
  const selectedSets = getSelectedSets();

  if (selectedSets.length > 0) {
    showIrrigationControlPanel(selectedSets);
    document.getElementById('sequence-container-wrapper').style.display = 'none';
    document.getElementById('irrigation-controls').style.display = 'block';
    document.getElementById('irrigation-controls').style.flex = '1';
    document.getElementById('irrigation-controls').style.overflowY = 'auto';
    document.getElementById('irrigation-controls').style.maxWidth = '800px';
    localStorage.setItem('irrigationState', 'started');
  }
});

// Clicking on stop irrigation plan button
document.getElementById('stop-irrigation-plan').addEventListener('click', function() {
  document.getElementById('irrigation-controls').style.display = 'none';
  document.getElementById('sequence-container-wrapper').style.display = 'block';
  document.getElementById('sequence-container-wrapper').style.flex = '1';
  document.getElementById('sequence-container-wrapper').style.overflowY = 'auto';
  document.getElementById('sequence-container-wrapper').style.maxWidth = '800px';
  localStorage.setItem('irrigationState', 'stopped');
});




// // showing the selected sets on the control irrigation panel
// function deleteSet(sequences, sequence, setToDelete) {
//   if (sequences.hasOwnProperty(sequence)) {
//       if (sequences[sequence].hasOwnProperty("sets")) {
//           var sets = sequences[sequence].sets;
//           var index = sets.indexOf(setToDelete);
//           if (index != -1) {
//               sets.splice(index, 1);
//           }
//       }
//   }
// }

// function deleteSequence(sequences, sequenceToDelete) {
//   if (sequences.hasOwnProperty(sequenceToDelete)) {
//       var sequence = sequences[sequenceToDelete];
//       var parent = sequence.parent;
//       var children = sequence.children;

//       if (parent) {
//           // Update the parent's children to remove the sequence to delete
//           var parentChildren = sequences[parent].children;
//           parentChildren.splice(parentChildren.indexOf(sequenceToDelete), 1);
//           // Add the children of the deleted sequence to the parent
//           parentChildren.push.apply(parentChildren, children);
//       }

//       for (var i = 0; i < children.length; i++) {
//           // Update each child's parent to the grandparent
//           sequences[children[i]].parent = parent;
//       }

//       // Remove the sequence from the dictionary
//       delete sequences[sequenceToDelete];
//   }
// }

// function getExcludedSets() {
//   // get the list of all set from keys of sets const
//   const all_sets = Object.keys(sets);
//   console.log(all_sets);

//   // get the list of selected sets
//   const selectedSets = [];
//   document.querySelectorAll('.set-checkbox:checked').forEach(checkbox => {
//     selectedSets.push(checkbox.closest('.set').id);
//   });

//   // excluded sets is the difference between all sets and the selected sets
//   const excluded_sets = all_sets.filter(set => !selectedSets.includes(set));
//   console.log(excluded_sets);
//   return excluded_sets;
// }

// // create custom sequences const
// function showCustomSequences() {
//   const custom_sequences = JSON.parse(JSON.stringify(sequences));
//   const custom_all_sequences = [...all_sequences];
//   const excluded_sets = getExcludedSets();

//   function createCustomSequences() {  
//     // Delete the excluded sets from the custom sequences
//     for (var i = 0; i < excluded_sets.length; i++) {
//       var curr_set = excluded_sets[i];
//       var sequence = sets[curr_set].sequence;
  
//       deleteSet(custom_sequences, sequence, curr_set);
  
//       if (custom_sequences[sequence].sets.length === 0) {
//           deleteSequence(custom_sequences, sequence);
          
//           // remove the sequence from all_sequences
//           if (custom_all_sequences.includes(sequence)) {
//             custom_all_sequences.splice(custom_all_sequences.indexOf(sequence), 1);
//           }
//           console.log(custom_all_sequences);
//       }
//     }
//     console.log(custom_sequences);
//   }  

//   createCustomSequences();
//   const container = document.getElementById('custom-sequence-container');
//   // console.log(custom_all_sequences[1]);
//   // console.log(custom_sequences);

//   // reset the container
//   container.innerHTML = '';

//   // if it has more than one sequence, display the sequences
//   if (custom_all_sequences.length > 1) {
//     displaySequences(container, custom_sequences, custom_all_sequences[1]);
//   }

// }

