// js/incidencias-api.js
/**
 * MÓDULO DE DATOS (VERSIÓN DE DEMOSTRACIÓN)
 * Este archivo simula el comportamiento de PouchDB.
 * manteniendo exactamente los mismos nombres, parámetros y retornos.
 */

const API = (() => {
    // Arreglo en memoria (se borra al recargar la página).
    // Incluimos un par de datos de demostración para poder ver el diseño.
    let registros = [
        {
            _id: "demo-1",
            titulo: "Fuga de agua en lavabos",
            ubicacion: "Baños Edificio A",
            categoria: "Plomería",
            prioridad: "Alta",
            estado: "Pendiente",
            descripcion: "Hay una fuga constante de agua en el segundo lavabo.",
            fecha: new Date().toISOString()
        },
        {
            _id: "demo-2",
            titulo: "Proyector no enciende",
            ubicacion: "Aula 302",
            categoria: "Equipamiento",
            prioridad: "Media",
            estado: "En proceso",
            descripcion: "El proyector marca error de lámpara.",
            fecha: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    // Simula el tiempo que tarda una base de datos real en responder (400ms)
    const simularRetraso = () => new Promise(resolve => setTimeout(resolve, 400));

    return {
        listarIncidencias: async () => {
            await simularRetraso();
            return [...registros];
        },

        registrarIncidencia: async (datos) => {
            await simularRetraso();
            const nueva = {
                ...datos,
                _id: "inc-" + Date.now(), // ID generado en la capa de datos
                estado: "Pendiente",      // Obligatorio: iniciar en Pendiente
                fecha: new Date().toISOString() // Fecha generada en la capa de datos
            };
            registros.push(nueva);
            return nueva;
        },

        obtenerIncidencia: async (id) => {
            await simularRetraso();
            return registros.find(r => r._id === id);
        },

        actualizarIncidencia: async (id, cambios) => {
            await simularRetraso();
            const index = registros.findIndex(r => r._id === id);
            if (index === -1) throw new Error("Incidencia no encontrada");
            
            // Solo actualiza los campos permitidos (Estado, Prioridad, Descripción)
            registros[index] = { ...registros[index], ...cambios };
            return registros[index];
        },

        eliminarIncidencia: async (id) => {
            await simularRetraso();
            registros = registros.filter(r => r._id !== id);
            return true;
        }
    };
})();