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
  sequenceElement.id = sequenceKey; // Add an ID to the sequence element

  if (sequenceKey === 'root') {
      sequenceElement.classList.add('root');
  }

  const title = document.createElement('h3');
  title.textContent = sequenceKey;
  sequenceElement.appendChild(title);

  sequence.sets.forEach(set => {
      const setElement = document.createElement('div');
      setElement.classList.add('set');
      setElement.id = set; // Add an ID to the set element
      setElement.textContent = set;
      sequenceElement.appendChild(setElement);
  });

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

function displaySequences(container, sequenceKey) {
  const sequence = sequences[sequenceKey];
  const sequenceElement = createSequenceElement(sequenceKey, sequence);
  container.appendChild(sequenceElement);
}

function markSequenceCompleted(sequenceKey) {
  const sequenceElement = document.getElementById(sequenceKey);
  if (sequenceElement) {
      sequenceElement.style.backgroundColor = '#d4edda'; // Light green background
      sequenceElement.style.borderColor = '#c3e6cb'; // Green border
  }
}

function markSetCompleted(setId) {
  const setElement = document.getElementById(setId);
  if (setElement) {
      setElement.style.backgroundColor = '#d4edda'; // Light green background
      setElement.style.borderColor = '#c3e6cb'; // Green border
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sequence-container');
  displaySequences(container, 'root');
});

// Expose the functions to be used by the main.js
window.markSequenceCompleted = markSequenceCompleted;
window.markSetCompleted = markSetCompleted;
