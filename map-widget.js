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
  L.polygon(set.coordinates, { color: 'blue' }).addTo(map)
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