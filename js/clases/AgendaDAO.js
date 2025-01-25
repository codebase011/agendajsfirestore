import { app } from '../datosFirebase.js';
import { COLLECTION_NAME } from '../consts.js';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

class AgendaDAO {
  constructor() {
    this.db = getFirestore(app); // Inicializa la base de datos Firestore
    this.agendaCollection = collection(this.db, COLLECTION_NAME); 
  }

  // Obtiene los contactos de Firestore
  async getContacts() {
    const querySnapshot = await getDocs(this.agendaCollection);
    const contacts = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id // Añadir el ID del documento para poder identificarlo en la actualización/eliminación
    }));
    return contacts;
  }

  // Añadir un nuevo contacto
  async addContact(contact) {
    try {
      await addDoc(this.agendaCollection, contact);
    } catch (error) {
      console.error("Error al añadir el contacto: ", error);
    }
  }

  // Actualizar un contacto
  async updateContact(id, contact) {
    try {
      const contactRef = doc(this.db, COLLECTION_NAME, id); 
      await updateDoc(contactRef, contact);
    } catch (error) {
      console.error("Error al actualizar el contacto: ", error);
    }
  }

  // Eliminar un contacto
  async deleteContact(id) {
    try {
      const contactRef = doc(this.db, COLLECTION_NAME, id); 
      await deleteDoc(contactRef);
    } catch (error) {
      console.error("Error al eliminar el contacto: ", error);
    }
  }

  // Escuchar cambios en tiempo real de la colección de contactos
  onContactsChange(callback) {
    // Usar onSnapshot para escuchar cualquier cambio en la colección "agenda"
    onSnapshot(this.agendaCollection, (querySnapshot) => {
      const contacts = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(contacts); // Llamamos al callback con los nuevos contactos
    });
  }
}

export default AgendaDAO;
