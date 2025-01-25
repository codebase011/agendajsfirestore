import { SECTIONS } from "../consts.js";
import AgendaDAO from "./AgendaDAO.js";

export default class Agenda {
  $container;
  agendaDAO;

  constructor($container) {
    console.log("agenda constructor");
    this.$container = $container;
    this.agendaDAO = new AgendaDAO();
    
    // Renderizar de nuevo la seccion "Listar" cada vez que se actualicen los contactos de la firestore
    // Tengo que usar el .bind(this) por que si no da error (se pierde el contexto)
    this.agendaDAO.onContactsChange(this.updateContacts.bind(this));
  }

  /**********************************************************************************************************
   * Actualiza los contactos en la interfaz
   * Este método se llama cada vez que se detecta un cambio en la base de datos en tiempo real
   **********************************************************************************************************/
  updateContacts() {
    this.render(SECTIONS.LIST); // Vuelve a renderizar la lista con los datos actualizados
  }

  /**********************************************************************************************************
   * Renderiza la sección asociada a cada botón
   * @param {*} section - Sección a renderizar
   * @param {*} contact - Opcional para renderizar la sección "Editar"  con los datos de un contacto
   **********************************************************************************************************/
  render(section, contact) {
    // Según la sección que se va a renderizar, se cambia el estilo correspondiente al li
    const $opcionesMenu = document.querySelectorAll("nav li");
    $opcionesMenu.forEach((li) => li.classList.remove("active"));
    Array.from($opcionesMenu)
      .find((o) => o.dataset.section === section)
      .classList.add("active");

    // Rendedizar la sección correspondiente
    switch (section) {
      case SECTIONS.ADD:
        console.log("render add section");
        this.renderAddSection();
        break;
      case SECTIONS.LIST:
        console.log("render list section");
        this.renderListSection();
        break;
      case SECTIONS.EDIT:
        console.log("render edit section", contact);
        this.renderEditSection(contact);
        break;
      case SECTIONS.SEARCH:
        console.log("render search section");
        this.renderSearchSection();
        break;
      default:
        console.log("page error");
    }
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Añadir"
   **********************************************************************************************************/
  renderAddSection() {
    const $addSection = document.createElement("div");

    // Poner el id para los estilos
    $addSection.id = "add-section";

    // Codigo HTML de la sección "Añadir"
    $addSection.innerHTML = `
      <div class="fila">
        <label for="name">Nombre:</label>
        <input type="text" name="name" id="name">
      </div>
      <div class="fila">
        <label for="surname">Apellidos:</label>
        <input type="text" name="surname" id="surname">
      </div>
      <div class="fila">
        <label for="address">Dirección:</label>
        <input type="te" name="address" id="address">
      </div>
      <div class="fila">
        <label for="tel">Teléfono:</label>
        <input type="tel" name="tel" id="tel">
      </div>
      <div class="fila-alinear-dcha">
        <p id="error"></p>
        <button id="save-button">Guardar</button>
      </div>
    `;

    this.$container.innerHTML = "";
    this.$container.appendChild($addSection);

    // Selectores de la sección
    const $name = $addSection.querySelector("#name");
    const $surname = $addSection.querySelector("#surname");
    const $address = $addSection.querySelector("#address");
    const $tel = $addSection.querySelector("#tel");
    const $error = $addSection.querySelector("#error");
    const $addButton = $addSection.querySelector("#save-button");

    $name.focus();

    // Asociar el evento al botón
    $addButton.addEventListener("click", () => {
      this.handleAddClick($name, $surname, $address, $tel, $error);
    });
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Listar"
   **********************************************************************************************************/
  async renderListSection() {
    const $listSection = document.createElement("div");

    // Para los estilos
    $listSection.id = "list-section";

    // Obtener los contactos de Firestore
    try {
      const contacts = await this.agendaDAO.getContacts(); // Obtener contactos de Firestore

      $listSection.innerHTML = "";

      if (contacts.length === 0) {
        $listSection.innerHTML += `
            <div id="no-contacts-container">
              <p id="list-section-info">No hay ningún contacto en la agenda.</p>
              <button id="add-button-list">Añadir contacto</button>
            </div>
          `;

        const $addButton = $listSection.querySelector("button");
        $addButton.addEventListener("click", () => this.render(SECTIONS.ADD));
      } else {
        contacts.forEach((contact) => {
          const $contactContainer = document.createElement("div");

          $contactContainer.classList.add("contact");
          $contactContainer.innerHTML += `
              <p>${contact.name} ${contact.surname}</p>
              <p>${contact.address}</p>
              <p>${contact.tel}</p>
              <div id="button-container">
                <button class="edit-button" title="Editar registro">✏️</button>
                <button class="delete-button" title="Eliminar registro">🗑️</button>
              </div>
          `;

          const $editButton = $contactContainer.querySelector(".edit-button");
          const $deleteButton = $contactContainer.querySelector(".delete-button");

          $editButton.addEventListener("click", () => {
            this.render(SECTIONS.EDIT, contact);
            console.log("Editando el contacto", contact);
          });

          $deleteButton.addEventListener("click", () => {
            console.log("Eliminando el contacto", contact);
            this.agendaDAO
              .deleteContact(contact.id)
              .then(() => {
                this.renderListSection(); // Volver a cargar la lista después de eliminar el contacto
              })
              .catch((error) => console.error("Error al eliminar contacto", error));
          });

          $listSection.appendChild($contactContainer);
        });
      }

      this.$container.innerHTML = "";
      this.$container.appendChild($listSection);
    } catch (error) {
      console.error("Error al obtener los contactos:", error);
    }
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Buscar"
   * Busca la entrada por nombre, apellido o telefono
   **********************************************************************************************************/
  renderSearchSection() {
    const $searchSection = document.createElement("div");

    // Para los estilos
    $searchSection.id = "search-section";

    $searchSection.innerHTML = `
    <div class="search-menu">
      <div>
        <span>Filtrar por</span>
        <select id="select-search">
          <option value="name">Nombre</option>
          <option value="surname">Apellidos</option>
          <option value="tel">Teléfono</option>
        </select>
        <input type="text" id="input-search-string" placeholder="Texto a buscar">
      </div>  
      <div>
        <input type="checkbox" id="checkbox-exact-search">
        <label for="checkbox-exact-search"><small>Palabras exactas</small></label>
        <input type="checkbox" id="checkbox-case-sensitive">
        <label for="checkbox-case-sensitive"><small>Case sensitive</small></label>
      </div>
    </div>
    <div id="container-filtered-contacts">
    </div>
  `;

    this.$container.innerHTML = "";
    this.$container.appendChild($searchSection);

    // Selectores
    const $selectSearch = $searchSection.querySelector("#select-search");
    const $inputSearchString = $searchSection.querySelector("#input-search-string");
    const $checkboxExactSearch = $searchSection.querySelector("#checkbox-exact-search");
    const $checkboxCaseSensitive = $searchSection.querySelector("#checkbox-case-sensitive");
    const $containerFilteredContacts = $searchSection.querySelector("#container-filtered-contacts");

    // Función para renderizar los resultados
    const renderFilteredContacts = (filteredContacts) => {
      $containerFilteredContacts.innerHTML = "";

      if (filteredContacts.length === 0) {
        $containerFilteredContacts.innerHTML = `<p id="info">No se encontraron resultados.</p>`;
        return;
      }

      filteredContacts.forEach((contact) => {
        $containerFilteredContacts.innerHTML += `
        <div class="contact">
          <p>${contact.name} ${contact.surname}</p>
          <p>${contact.address}</p>
          <p>${contact.tel}</p>
        </div>
      `;
      });
    };

    // Manejador para los cambios
    const handleOnChange = async () => {
      const exactSearch = $checkboxExactSearch.checked;
      const caseSensitive = $checkboxCaseSensitive.checked;
      const searchField = $selectSearch.value;
      const searchString = caseSensitive
        ? $inputSearchString.value.trim()
        : $inputSearchString.value.trim().toLowerCase();

      let filteredContacts = await this.agendaDAO.getContacts();

      if (searchString !== "") {
        filteredContacts = filteredContacts.filter((contact) => {
          const fieldValue = caseSensitive ? contact[searchField] : contact[searchField].toLowerCase();

          // Si la busqueda exacta está activada se devuelve el contacto solo si coincide
          if (exactSearch) return fieldValue === searchString;

          // Si no está activada se devuelve el contacto si el campo incluye el texto buscado
          return fieldValue.includes(searchString);
        });
      }

      renderFilteredContacts(filteredContacts);
    };

    // Asociar eventos
    $selectSearch.addEventListener("change", handleOnChange);
    $inputSearchString.addEventListener("input", handleOnChange);
    $checkboxExactSearch.addEventListener("change", handleOnChange);
    $checkboxExactSearch.addEventListener("click", () => $inputSearchString.focus());
    $checkboxCaseSensitive.addEventListener("change", handleOnChange);
    $checkboxCaseSensitive.addEventListener("click", () => $inputSearchString.focus());

    // Mostrar todos los contactos por defecto
    handleOnChange();
  }

  /**********************************************************************************************************
   * Renderiza la sección de "Editar"
   * @param {*} contact
   * Se le puede pasar un contacto (opcional)
   **********************************************************************************************************/
  async renderEditSection(contact) {
    const $editSection = document.createElement("div");
    const contacts = await this.agendaDAO.getContacts();
    let selectedIndex;

    // Para los estilos
    $editSection.id = "edit-section";

    // Código HTML de la sección "Editar"
    $editSection.innerHTML = `
      <div id="edit-contact-menu">
        <div class="fila">
          <label for="select-contact-list">Contacto:</label>
          <select id="select-contact-list" size="1">
          <option disabled>Selecciona un contacto</option>
          ${contacts.map((c, index) => {
            // Si el contacto que se pasa por parametro es el actual,
            // Guardar el indice para luego asiganrlo al "selectedIndex" del select
            // (Si no, no coincidirán los datos que se muestran)
            if (contact?.tel === c.tel) {
              selectedIndex = index + 1;
              console.log("si", selectedIndex);
            }

            return `<option value='${c.tel}'>${c.name} ${c.surname} | ${c.tel} | ${c.address}</option>`;
          })}
          </select>
        </div>
      </div>
      <div class="fila">
        <label for="name">Nombre:</label>
        <input type="text" id="name" value="${contact?.name || ""}">
      </div>
      <div class="fila">
        <label for="surname">Apellidos:</label>
        <input type="text" id="surname" value="${contact?.surname || ""}">
      </div>
      <div class="fila">
        <label for="address">Dirección:</label>
        <input type="text" id="address" value="${contact?.address || ""}">
      </div>
      <div class="fila">
        <label for="tel">Teléfono:</label>
        <input type="tel" id="tel" value="${contact?.tel || ""}">
      </div>
      <div class="fila-alinear-dcha">
        <p id="error"></p>
        <button id="cancel-button">Cancelar</button>
        <button id="save-button">Guardar</button>
      </div>
    `;

    this.$container.innerHTML = "";
    this.$container.appendChild($editSection);

    // Selectores
    const $name = $editSection.querySelector("#name");
    const $surname = $editSection.querySelector("#surname");
    const $address = $editSection.querySelector("#address");
    const $tel = $editSection.querySelector("#tel");
    const $cancelButton = $editSection.querySelector("#cancel-button");
    const $saveButton = $editSection.querySelector("#save-button");
    const $error = $editSection.querySelector("#error");
    const $selectContactList = $editSection.querySelector("#select-contact-list");

    // Seleccionar el option correspondiente de la lista
    $selectContactList.selectedIndex = selectedIndex;

    // Menejar el "onchange" del select
    $selectContactList.addEventListener("change", () => {
      contact = contacts.find((c) => c.tel === $selectContactList.value);
      console.log("cs", contact);
      this.renderEditSection(contact);
    });

    // Si se pulsa cancelar, simplemente se renderiza de nuevo la sección "Listar"
    $cancelButton.addEventListener("click", () => this.render(SECTIONS.LIST));

    // Si se pulsa guardar, actualizar el contacto
    $saveButton.addEventListener("click", () => {
      // Comprobar si se está editando algún contacto antes de guardar
      if (!contact) {
        $error.textContent = "No se ha seleccionado ningún contacto";
        return;
      }

      // Comprobar si hay algún campo vacío
      if (
        $name.value.trim() === "" ||
        $surname.value.trim() === "" ||
        $address.value.trim() === "" ||
        $tel.value.trim() === ""
      ) {
        $error.textContent = "Rellena todos los campos subnormal";
        return;
      }

      // Crear el nuevo objeto de contacto
      const updatedContact = {
        name: $name.value.trim(),
        surname: $surname.value.trim(),
        address: $address.value.trim(),
        tel: $tel.value.trim(),
      };

      this.agendaDAO
        .updateContact(contact.id, updatedContact)
        .then(() => {
          console.log("Contacto actualizado");
          this.render(SECTIONS.LIST); // Volver a cargar la lista de contactos
        })
        .catch((error) => {
          console.error("Error al actualizar el contacto", error);
          $error.textContent = "Hubo un error al actualizar el contacto.";
        });
    });
  }

  /**********************************************************************************************************
   * Manejador para el botón "Guardar" tanto para añadir o editar un contacto
   **********************************************************************************************************/
  handleAddClick($name, $surname, $address, $tel, $error) {
    const name = $name.value.trim();
    const surname = $surname.value.trim();
    const address = $address.value.trim();
    const tel = $tel.value.trim();

    if (name === "" || surname === "" || address === "" || tel === "") {
      $error.textContent = "Rellena todos los campos";
      return;
    }

    const newContact = { name, surname, address, tel };

    this.agendaDAO
      .addContact(newContact)
      .then(() => {
        $error.textContent = "Contacto añadido correctamente";
        this.render(SECTIONS.LIST); // Volver a cargar la lista después de añadir el contacto
      })
      .catch((error) => {
        console.error("Error al añadir contacto", error);
        $error.textContent = "Hubo un error al añadir el contacto";
      });
  }
}
