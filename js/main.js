import Agenda from "./clases/Agenda.js";
import { SECTIONS } from "./consts.js";

document.addEventListener("DOMContentLoaded", () => {
  const $lis = document.querySelectorAll("nav ul li");

  const $mainContent = document.querySelector("#main-content");
  const agenda = new Agenda($mainContent);

  // Añadir el evento "click" de cada opción del menú
  $lis.forEach(($li) => {
    $li.addEventListener("click", () => {
      agenda.render($li.dataset.section);
    });
  });

  // Renderizar por defecto la seccion de Añadir
  agenda.render(SECTIONS.LIST);
});