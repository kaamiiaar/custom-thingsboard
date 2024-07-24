document.getElementById('toggleSidebar').onclick = function() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay-sidebar');
  var mainContent = document.getElementById('mainContent');
  var header = document.getElementById('header');
  var menuIcon = document.getElementById('menuIcon');
  
  if (sidebar.style.width === '250px') {
    sidebar.style.width = '0';
    overlay.style.display = 'none';
    mainContent.style.marginLeft = '0';
    header.style.marginLeft = '0';
    menuIcon.src = './icons/sidebar.png';  // Change to menu icon
  } else {
    sidebar.style.width = '250px';
    // overlay.style.display = 'block';
    mainContent.style.marginLeft = '250px';
    header.style.marginLeft = '250px';
    menuIcon.src = './icons/sidebar.png';  // Change to close icon
  }
};

// document.getElementById('overlay-sidebar').onclick = function() {
//   var sidebar = document.getElementById('sidebar');
//   var overlay = document.getElementById('overlay-sidebar');
//   var mainContent = document.getElementById('mainContent');
//   var header = document.getElementById('header');
//   var menuIcon = document.getElementById('menuIcon');
  
//   sidebar.style.width = '0';
//   overlay.style.display = 'none';
//   mainContent.style.marginLeft = '0';
//   header.style.marginLeft = '0';
//   menuIcon.src = 'menu-icon.png';  // Change to menu icon
// };