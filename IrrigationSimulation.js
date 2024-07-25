import React, { useState, useEffect } from 'react';
import { ProgressBar } from '@/components/ui/progress';

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

const sets = {
  "c1fa-set1": { name: "c1fa-set1", label: "Set 1", duration: 10 },
  "c1fa-set2": { name: "c1fa-set2", label: "Set 2", duration: 10 },
  "c1fa-set3": { name: "c1fa-set3", label: "Set 3", duration: 10 },
  "c1fa-set4": { name: "c1fa-set4", label: "Set 4", duration: 10 },
  "c1fa-set5": { name: "c1fa-set5", label: "Set 5", duration: 10 },
  "c1fa-set6": { name: "c1fa-set6", label: "Set 6", duration: 10 },
  "c1fa-set7": { name: "c1fa-set7", label: "Set 7", duration: 10 },
  "c1fa-set8": { name: "c1fa-set8", label: "Set 8", duration: 10 },
  "c1fa-set9": { name: "c1fa-set9", label: "Set 9", duration: 10 },
  "c1fa-set10": { name: "c1fa-set10", label: "Set 10", duration: 10 },
  "c1fa-set11": { name: "c1fa-set11", label: "Set 11", duration: 10 },
  "c1fa-set12": { name: "c1fa-set12", label: "Set 12", duration: 10 },
  "c1fa-set13": { name: "c1fa-set13", label: "Set 13", duration: 10 },
  "c1fa-set14": { name: "c1fa-set14", label: "Set 14", duration: 10 }
};

const IrrigationSimulation = () => {
  const [currentSequence, setCurrentSequence] = useState('root');
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = { ...prevProgress };
        let sequenceCompleted = true;

        sequences[currentSequence].sets.forEach(setName => {
          if (newProgress[setName] < 100) {
            newProgress[setName] = (newProgress[setName] || 0) + 1;
            sequenceCompleted = false;
          }
        });

        if (sequenceCompleted) {
          const nextSequence = getNextSequence(currentSequence);
          if (nextSequence) {
            setCurrentSequence(nextSequence);
          } else {
            clearInterval(timer);
          }
        }

        return newProgress;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(timer);
  }, [currentSequence]);

  const getNextSequence = (sequence) => {
    const current = sequences[sequence];
    if (current.children.length > 0) {
      return current.children[0];
    }
    if (current.parent) {
      const parentSequence = sequences[current.parent];
      const currentIndex = parentSequence.children.indexOf(sequence);
      if (currentIndex < parentSequence.children.length - 1) {
        return parentSequence.children[currentIndex + 1];
      }
      return getNextSequence(current.parent);
    }
    return null;
  };

  const renderSequence = (sequenceKey) => {
    const sequence = sequences[sequenceKey];
    return (
      <div key={sequenceKey} className="sequence mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {sequenceKey.charAt(0).toUpperCase() + sequenceKey.slice(1)}
        </h3>
        {sequence.sets.map(setName => (
          <div key={setName} className="set mb-2">
            <div className="flex justify-between mb-1">
              <span>{sets[setName].label}</span>
              <span>{progress[setName] || 0}%</span>
            </div>
            <ProgressBar value={progress[setName] || 0} className="w-full" />
          </div>
        ))}
        {sequence.children.map(childKey => renderSequence(childKey))}
      </div>
    );
  };

  return (
    <div className="irrigation-simulation p-4">
      <h2 className="text-2xl font-bold mb-4">Irrigation Simulation</h2>
      {renderSequence('root')}
    </div>
  );
};

function App() {
    return (
      <div className="App">
        <IrrigationSimulation />
      </div>
    );
}

// export default IrrigationSimulation;