// Highlight the current section in the navigation and keep the footer year current.
(function () {
  var path = window.location.pathname.replace(/\/+$/, "") || "/";

  document.querySelectorAll(".site-nav a").forEach(function (link) {
    var href = link.getAttribute("href").replace(/\/+$/, "");
    if (path === href || path.indexOf(href + "/") === 0) {
      link.setAttribute("aria-current", "page");
    }
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
