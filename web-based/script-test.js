const sequences = {
    sequence1: {
        sets: ["c1fa-set7"],
        pumps: ["c1fa-pump2", "c1fa-pump3"],
        children: ["sequence2", "sequence3"],
        parent: null,
        curr_set_idx: 0,
        completed: false
    },
    sequence2: {
        sets: ["c1fa-set6", "c1fa-set4", "c1fa-set2"],
        pumps: ["c1fa-pump1", "c1fa-pump2"],
        children: ["sequence4"],
        parent: "sequence1",
        curr_set_idx: 0,
        completed: false
    },
    sequence3: {
        sets: ["c1fa-set8", "c1fa-set10", "c1fa-set13"],
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
        setElement.textContent = set;
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

function displaySequences(container, sequenceKey) {
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
    displaySequences(container, 'sequence1');
});

// Expose the functions to be used by the main.js
window.markSequenceCompleted = markSequenceCompleted;
window.markSetCompleted = markSetCompleted;
