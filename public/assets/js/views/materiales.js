// public/assets/js/views/materiales.js

let materiales = []; // Base de datos local temporal

/**
 * Renderiza un solo material en la lista y actualiza localStorage.
 */
function renderMaterial(material) {
  localStorage.setItem("materiales", JSON.stringify(materiales));

  const list = document.querySelector(".Contact_list");
  const item = document.querySelector(`[data-key='${material.id}']`);

  if (material.deleted) {
    if(item) item.remove();
    return;
  }
  
  if(item) {
      // Lógica de actualización si ya existe (para el CRUD UPDATE)
      return; 
  }

  const node = document.createElement("article");
  node.setAttribute("class", "person"); 
  node.setAttribute("data-key", material.id);
  
  node.innerHTML = `
<div>
<h1><i></i> ${material.name}</h1>
<p><i>Precio de Venta: $</i> ${material.price_sell}</p>
<p><i>Precio de Compra: $</i> ${material.price_buy}  </p>
<p><i>Unidad: </i> ${material.unit}  </p>
</div>
    <button class="delete-contact js-delete-contact">
        <svg fill="var(--svgcolor)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
    </button>
`;
  if(list) list.append(node);
}

/**
 * Recoge datos del formulario de Consultar Precios y añade un nuevo material (CREATE).
 */
function addMaterial(event) {
  event.preventDefault();

  const nameInput = document.getElementById("materialName");
  const sellInput = document.getElementById("priceSell");
  const buyInput = document.getElementById("priceBuy");
  const unitInput = document.getElementById("unitType");

  if (!nameInput || !sellInput || !buyInput) return;
  
  const materialObject = {
    name: nameInput.value,
    price_sell: sellInput.value,
    price_buy: buyInput.value,
    unit: unitInput ? unitInput.value : 'kg', 
    id: Date.now(), // ID temporal
  };

  materiales.push(materialObject);
  renderMaterial(materialObject);
  event.target.reset(); // Limpia el formulario
}

/**
 * Elimina un material por su ID (DELETE).
 */
function deleteMaterial(key) {
  const index = materiales.findIndex((item) => item.id === Number(key));
  if(index === -1) return;
  
  const UpdatedMaterialObject = {
    deleted: true,
    ...materiales[index],
  };
  materiales = materiales.filter((item) => item.id !== Number(key));
  renderMaterial(UpdatedMaterialObject);
}

/**
 * Configura los Event Listeners para la vista de Precios.
 */
function setupMaterialesEventListeners() {
    const list = document.querySelector(".Contact_list");
    if (list) {
        list.addEventListener("click", (event) => {
          const deleteButton = event.target.closest(".js-delete-contact");
          if (deleteButton) {
            const itemKey = deleteButton.parentElement.dataset.key;
            deleteMaterial(itemKey);
          }
        });
    }

    const form = document.querySelector(".js-form");
    if(form) {
        form.addEventListener("submit", addMaterial);
    }
}


/**
 * PUNTO DE INICIALIZACIÓN (exportado): Carga datos y configura eventos.
 * Llamada por core.js.
 */
export function initMaterialesLogic() {
    // 1. Cargar datos persistentes (READ)
    const ref = localStorage.getItem("materiales");
    if (ref) {
        materiales = JSON.parse(ref);
        materiales.forEach((t) => {
          renderMaterial(t);
        });
    }
    
    // 2. Configurar los Event Listeners
    setupMaterialesEventListeners();
    console.log("Lógica de Consultar Precios inicializada.");
}