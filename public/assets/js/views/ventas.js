// public/assets/js/views/ventas.js
// Gestión de ventas (Vista READ)

const API_URL = '/api.php';

/**
 * Cargar y mostrar todas las ventas
 */
async function cargarVentas() {
    const loading = document.getElementById('ventasLoading');
    const tableBody = document.getElementById('ventasTableBody');
    const noDataMessage = document.getElementById('noVentasMessage');
    
    if (loading) loading.style.display = 'block';
    if (tableBody) tableBody.innerHTML = '';
    
    try {
        const response = await fetch(`${API_URL}/ventas`);
        const data = await response.json();
        
        if (loading) loading.style.display = 'none';
        
        if (data.success && data.data.length > 0) {
            if (noDataMessage) noDataMessage.style.display = 'none';
            renderVentas(data.data);
        } else {
            if (noDataMessage) noDataMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error al cargar ventas:', error);
        if (loading) loading.style.display = 'none';
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:#f44336;">Error al cargar las ventas</td></tr>';
        }
    }
}

/**
 * Renderizar ventas en la tabla
 */
function renderVentas(ventas) {
    const tableBody = document.getElementById('ventasTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    ventas.forEach(venta => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${venta.id}</td>
            <td>${venta.nombre_cliente}</td>
            <td>${venta.nombre_vendedor}</td>
            <td>${venta.fecha}</td>
            <td>${venta.hora}</td>
            <td>${parseFloat(venta.fierro_kg).toFixed(2)}</td>
            <td>${parseFloat(venta.plastico_kg).toFixed(2)}</td>
            <td>${parseFloat(venta.carton_kg).toFixed(2)}</td>
            <td>$${parseFloat(venta.total).toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="window.navigateToEdit(${venta.id})">
                        <ion-icon name="create-outline"></ion-icon> Editar
                    </button>
                    <button class="btn-delete" onclick="window.navigateToDelete(${venta.id})">
                        <ion-icon name="trash-outline"></ion-icon> Eliminar
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Funciones globales para navegar a otras vistas
 */
window.navigateToEdit = function(id) {
    // Simular click en el botón Editar de navegación
    const editarBtn = Array.from(document.querySelectorAll('[data-nav-link]'))
        .find(btn => btn.textContent.trim() === 'Editar');
    if (editarBtn) {
        editarBtn.click();
        // Después de un pequeño delay, seleccionar la venta
        setTimeout(() => {
            if (window.cargarVentaParaEditar) {
                window.cargarVentaParaEditar(id);
            }
        }, 300);
    }
};

window.navigateToDelete = function(id) {
    // Simular click en el botón Eliminar de navegación
    const eliminarBtn = Array.from(document.querySelectorAll('[data-nav-link]'))
        .find(btn => btn.textContent.trim() === 'Eliminar');
    if (eliminarBtn) {
        eliminarBtn.click();
        // Después de un pequeño delay, abrir modal de confirmación
        setTimeout(() => {
            if (window.confirmarEliminarVenta) {
                window.confirmarEliminarVenta(id);
            }
        }, 300);
    }
}; // ← ESTE era el punto y coma que faltaba

/**
 * Configurar event listeners
 */
function setupVentasEventListeners() {
    const btnRefresh = document.getElementById('btnRefrescarVentas');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', cargarVentas);
    }
}

/**
 * PUNTO DE INICIALIZACIÓN (exportado)
 */
export function initVentasLogic() {
    console.log("Lógica de Ventas inicializada.");
    setupVentasEventListeners();
    cargarVentas();
}