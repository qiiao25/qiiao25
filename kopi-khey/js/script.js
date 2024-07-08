document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const closeBtn = document.getElementById("close-btn");

  hamburgerMenu.addEventListener("click", function () {
    sidebar.style.width = "250px";
  });

  closeBtn.addEventListener("click", function () {
    sidebar.style.width = "0";
  });

  // Close the sidebar when clicking outside of it
  window.addEventListener("click", function (event) {
    if (
      event.target !== sidebar &&
      !sidebar.contains(event.target) &&
      event.target !== hamburgerMenu &&
      !hamburgerMenu.contains(event.target)
    ) {
      sidebar.style.width = "0";
    }
  });
});
