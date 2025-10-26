'use strict';

// =========================================================
// 1. FUNCIONES UTILITARIAS Y DE UI (BASE)
// =========================================================

const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebarBtn) sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// =========================================================
// 2. LÓGICA DE NAVEGACIÓN Y CARGA DINÁMICA
// =========================================================

const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pageContentContainer = document.getElementById("page-content-container"); 

// Objeto que mapea el nombre de la vista con la función de inicialización
const viewInitializers = {
    'Consultar Precios': () => import('./views/materiales.js').then(module => module.initMaterialesLogic()),
    'Ventas': () => import('./views/ventas.js').then(module => module.initVentasLogic()),
    'Editar': () => import('./views/editar.js').then(module => module.initEditarLogic()),
    'Eliminar': () => import('./views/eliminar.js').then(module => module.initEliminarLogic()),
};

/**
 * Carga el contenido de una vista HTML dinámicamente
 */
const loadView = function (viewName) {
    if (!pageContentContainer) return;

    // Genera el nombre de archivo: "Consultar Precios" -> "consultar"
    let fileName = viewName.toLowerCase();
    if (fileName === 'consultar precios') fileName = 'consultar';
    
    const viewUrl = `../../app/Views/${fileName}.html`; 

    fetch(viewUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Error ${response.status} al cargar la vista: ${viewUrl}`);
            return response.text();
        })
        .then(html => {
            pageContentContainer.innerHTML = html;
            window.scrollTo(0, 0); 
            
            // Punto de inicialización del script específico
            if (viewInitializers[viewName]) {
                viewInitializers[viewName]().catch(err => console.error(`Fallo al inicializar lógica de ${viewName}:`, err));
            }
        })
        .catch(error => {
            console.error(`Fallo al cargar la vista ${viewName}: `, error);
            pageContentContainer.innerHTML = `
                <h2 style="color:red; text-align:center;">Error al cargar la vista.</h2>
                <p style="text-align:center;">Verifique que el archivo <b>${viewUrl}</b> exista y que la ruta sea correcta.</p>
            `;
        });
};

// Asigna el evento click a todos los botones de navegación
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const viewName = this.innerHTML.trim();
    loadView(viewName);

    // Gestiona la clase 'active'
    for (let j = 0; j < navigationLinks.length; j++) {
      navigationLinks[j].classList.remove("active");
    }
    this.classList.add("active");
  });
}

// =========================================================
// 3. LÓGICA DEL FORMULARIO DE REGISTRO DE VENTAS (SIDEBAR)
// =========================================================

/**
 * Manejar el envío del formulario de registro de ventas
 */
function setupFormularioVentas() {
    const form = document.querySelector('.login');
    if (!form) return;

    // Cambiar el método del formulario
    form.method = '';
    
    // Gestionar checkboxes
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const inputFields = checkbox.parentElement.querySelector('.input-fields input[type="number"]');
        
        checkbox.addEventListener('change', function() {
            if (inputFields) {
                inputFields.disabled = !this.checked;
                if (!this.checked) {
                    inputFields.value = '0';
                }
            }
        });
        
        // Inicializar el estado
        if (inputFields) {
            inputFields.disabled = !checkbox.checked;
        }
    });

    // Manejar el botón "Enviar"
    const btnEnviar = form.querySelector('.boton-ecogo');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', async function(e) {
            e.preventDefault();
            await registrarVenta();
        });
    }

    // Manejar el botón "Eliminar"
    const btnEliminar = form.querySelector('.B');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', function(e) {
            e.preventDefault();
            limpiarFormulario();
        });
    }
}

/**
 * Registrar nueva venta
 */
async function registrarVenta() {
    const form = document.querySelector('.login');
    if (!form) return;

    // Obtener valores
    const nombreCliente = form.querySelector('input[name="nc"]').value.trim();
    const nombreVendedor = form.querySelector('input[name="v"]').value.trim();

    // Validar campos obligatorios
    if (!nombreCliente || !nombreVendedor) {
        alert('⚠️ Por favor ingresa el nombre del cliente y del vendedor');
        return;
    }

    // Obtener cantidades de materiales
    const fierroCheckbox = form.querySelector('input[name="opcion1"]');
    const plasticoCheckbox = form.querySelector('input[name="opcion2"]');
    const cartonCheckbox = form.querySelector('input[name="opcion3"]');

    const fierroKg = fierroCheckbox.checked ? parseFloat(form.querySelector('input[name="cantidad1"]').value) || 0 : 0;
    const plasticoKg = plasticoCheckbox.checked ? parseFloat(form.querySelector('input[name="cantidad2"]').value) || 0 : 0;
    const cartonKg = cartonCheckbox.checked ? parseFloat(form.querySelector('input[name="cantidad3"]').value) || 0 : 0;

    // Validar que al menos un material tenga cantidad
    if (fierroKg === 0 && plasticoKg === 0 && cartonKg === 0) {
        alert('⚠️ Por favor selecciona al menos un material con cantidad mayor a 0');
        return;
    }

    // Preparar datos
    const ventaData = {
        nombre_cliente: nombreCliente,
        nombre_vendedor: nombreVendedor,
        fierro_kg: fierroKg,
        plastico_kg: plasticoKg,
        carton_kg: cartonKg
    };

    try {
        const response = await fetch('/api.php/ventas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ventaData)
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ Venta registrada exitosamente\nTotal: ${parseFloat(data.total).toFixed(2)}`);
            limpiarFormulario();
            
            // Si estamos en la vista de ventas, recargarlas
            if (window.location.hash === '#ventas' || document.querySelector('.ventas.active')) {
                // Esperar un momento y recargar ventas
                setTimeout(() => {
                    const ventasBtn = Array.from(navigationLinks).find(btn => btn.textContent.trim() === 'Ventas');
                    if (ventasBtn) ventasBtn.click();
                }, 500);
            }
        } else {
            alert('❌ Error: ' + (data.message || 'No se pudo registrar la venta'));
        }
    } catch (error) {
        console.error('Error al registrar venta:', error);
        alert('❌ Error al conectar con el servidor');
    }
}

/**
 * Limpiar formulario de ventas
 */
function limpiarFormulario() {
    const form = document.querySelector('.login');
    if (!form) return;

    form.querySelector('input[name="nc"]').value = '';
    form.querySelector('input[name="v"]').value = '';
    
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const inputFields = checkbox.parentElement.querySelector('.input-fields input[type="number"]');
        if (inputFields) {
            inputFields.value = '0';
            inputFields.disabled = true;
        }
    });
}

// =========================================================
// 4. INICIALIZACIÓN
// =========================================================

// Inicialización: Carga la vista 'Ventas' al cargar la página
window.addEventListener('load', () => {
    // Configurar formulario de ventas del sidebar
    setupFormularioVentas();
    
    // Cargar vista inicial
    if (navigationLinks.length > 0) {
        loadView('Ventas'); 
        navigationLinks[0].classList.add("active"); 
    }
});