'use strict';

// =========================================================
// 1. FUNCIONES UTILITARIAS Y DE UI (BASE)
// =========================================================

const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebarBtn) sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// [Mantener aquí toda tu lógica de modals, select, filter y forms del sidebar]
// ... (Toda la lógica de tu sidebar y forms de ingreso va aquí) ...

// =========================================================
// 2. LÓGICA DE NAVEGACIÓN Y CARGA DINÁMICA
// =========================================================

const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pageContentContainer = document.getElementById("page-content-container"); 

// Objeto que mapea el nombre de la vista (del botón) con la función de inicialización del script
// Aquí se agregará el import dinámico para cada script de vista.
const viewInitializers = {
    'Consultar Precios': () => import('./views/materiales.js').then(module => module.initMaterialesLogic()),
    'Ventas': () => import('./views/ventas.js').then(module => module.initVentasLogic()),
    // 'Editar': () => import('./views/editar.js').then(module => module.initEditarLogic()),
    // 'Eliminar': () => import('./views/eliminar.js').then(module => module.initEliminarLogic()),
};


/**
 * Carga el contenido de una vista HTML dinámicamente.
 * Luego, llama al script JS específico para esa vista.
 */
const loadView = function (viewName) {
    if (!pageContentContainer) return;

    // Genera el nombre de archivo: "Consultar Precios" -> "consultar_precios"
    const fileName = viewName.toLowerCase().replace(/\s/g, '_'); 
    const viewUrl = `../../app/Views/${fileName}.html`; 

    fetch(viewUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Error ${response.status} al cargar la vista: ${viewUrl}`);
            return response.text();
        })
        .then(html => {
            pageContentContainer.innerHTML = html;
            window.scrollTo(0, 0); 
            
            // 🚨 Punto de inicialización del script específico 🚨
            if (viewInitializers[viewName]) {
                viewInitializers[viewName]().catch(err => console.error(`Fallo al inicializar lógica de ${viewName}:`, err));
            }
        })
        .catch(error => {
            console.error(`Fallo al cargar la vista ${viewName}: `, error);
            pageContentContainer.innerHTML = `<h2 style="color:red; text-align:center;">Error al cargar la vista.</h2><p style="text-align:center;">Verifique que el archivo <b>${viewUrl}</b> exista y que la ruta sea correcta.</p>`;
        });
};

// Asigna el evento click a todos los botones de navegación
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const viewName = this.innerHTML; // Ej: "Consultar Precios"
    loadView(viewName);

    // Gestiona la clase 'active'
    for (let j = 0; j < navigationLinks.length; j++) {
      navigationLinks[j].classList.remove("active");
    }
    this.classList.add("active");
  });
}

// Inicialización: Carga la vista 'Ventas' al cargar la página por primera vez
window.addEventListener('load', () => {
    if (navigationLinks.length > 0) {
        loadView('Ventas'); 
        navigationLinks[0].classList.add("active"); 
    }
});