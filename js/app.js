document.addEventListener('DOMContentLoaded', () => {
    // 1. REFERENCIAS AL DOM
    
    // Navegación y Vistas
    const vistaDashboard = document.querySelector('#vista-dashboard');
    const vistaNuevo = document.querySelector('#vista-nuevo');
    const btnNavDashboard = document.querySelector('#nav-dashboard');
    const btnNavNuevo = document.querySelector('#nav-nuevo');
    
    // Panel y Listado
    const statTotal = document.querySelector('#stat-total');
    const statPendientes = document.querySelector('#stat-pendientes');
    const statProceso = document.querySelector('#stat-proceso');
    const statResueltas = document.querySelector('#stat-resueltas');
    const inputFiltroTexto = document.querySelector('#filtro-texto');
    const selectFiltroEstado = document.querySelector('#filtro-estado');
    const tbody = document.querySelector('#lista-incidencias-body');
    const toastContainer = document.querySelector('#toast-container');
    
    // Formulario de Registro
    const formRegistro = document.querySelector('#form-registro');
    const btnCancelarRegistro = document.querySelector('#btn-cancelar-registro');
    const inputRegTitulo = document.querySelector('#reg-titulo');
    const inputRegUbicacion = document.querySelector('#reg-ubicacion');
    const selectRegCategoria = document.querySelector('#reg-categoria');
    const selectRegPrioridad = document.querySelector('#reg-prioridad');
    const inputRegDescripcion = document.querySelector('#reg-descripcion');
    const charTitulo = document.querySelector('#char-titulo');
    const charDescripcion = document.querySelector('#char-descripcion');
    
    // Modal de Edición
    const modalEditar = document.querySelector('#modal-editar');
    const formEditar = document.querySelector('#form-editar');
    const displayEditTitulo = document.querySelector('#edit-titulo-display');
    const selectEditEstado = document.querySelector('#edit-estado');
    const selectEditPrioridad = document.querySelector('#edit-prioridad');
    const inputEditDescripcion = document.querySelector('#edit-descripcion');
    const btnCerrarEditar = document.querySelector('#btn-cerrar-editar');
    
    // Modal de Eliminación
    const modalEliminar = document.querySelector('#modal-eliminar');
    const displayDelTitulo = document.querySelector('#del-titulo-display');
    const btnCerrarEliminar = document.querySelector('#btn-cerrar-eliminar');
    const btnConfirmarEliminar = document.querySelector('#btn-confirmar-eliminar');

    // 2. VARIABLES GLOBALES DE ESTADO
    let listaActual = []; 
    let idEdicionActual = null;
    let idEliminacionActual = null;

    // 3. LÓGICA Y FUNCIONES (FLECHA)
    
    const mostrarToast = (mensaje, tipo = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    };

    const cambiarVista = (vistaDestino) => {
        vistaDashboard.classList.remove('active', 'hidden');
        vistaNuevo.classList.remove('active', 'hidden');
        btnNavDashboard.classList.remove('active');
        btnNavNuevo.classList.remove('active');

        if (vistaDestino === 'dashboard') {
            vistaDashboard.classList.add('active');
            vistaNuevo.classList.add('hidden');
            btnNavDashboard.classList.add('active');
            cargarIncidencias(); 
        } else {
            vistaNuevo.classList.add('active');
            vistaDashboard.classList.add('hidden');
            btnNavNuevo.classList.add('active');
        }
    };

    const actualizarEstadisticas = (datos) => {
        statTotal.textContent = datos.length;
        statPendientes.textContent = datos.filter(d => d.estado === 'Pendiente').length;
        statProceso.textContent = datos.filter(d => d.estado === 'En proceso').length;
        statResueltas.textContent = datos.filter(d => d.estado === 'Resuelta').length;
    };

    const renderizarTabla = (datos) => {
        tbody.innerHTML = ''; 
        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay reportes que coincidan con la búsqueda.</td></tr>';
            return;
        }

        // Diccionario para mapear textos a clases de color (Badges)
        const obtenerClaseBadge = (valor) => {
            const mapa = {
                'Alta': 'badge-peligro', 'Pendiente': 'badge-peligro',
                'Media': 'badge-alerta', 'En proceso': 'badge-alerta',
                'Baja': 'badge-exito', 'Resuelta': 'badge-exito'
            };
            return mapa[valor] || '';
        };

        datos.forEach(incidencia => {
            const tr = document.createElement('tr');
            
            const crearCelda = (texto) => {
                const td = document.createElement('td');
                td.textContent = texto; 
                return td;
            };

            // Función para crear celdas con diseño de "Píldora/Badge"
            const crearCeldaBadge = (texto) => {
                const td = document.createElement('td');
                const span = document.createElement('span');
                span.className = `badge ${obtenerClaseBadge(texto)}`;
                span.textContent = texto;
                td.appendChild(span);
                return td;
            };

            const fechaFormat = new Date(incidencia.fecha).toLocaleDateString('es-MX');

            tr.appendChild(crearCelda(incidencia.titulo));
            tr.appendChild(crearCelda(incidencia.ubicacion));
            tr.appendChild(crearCelda(incidencia.categoria));
            tr.appendChild(crearCeldaBadge(incidencia.prioridad)); // Usamos el badge
            tr.appendChild(crearCeldaBadge(incidencia.estado));    // Usamos el badge
            tr.appendChild(crearCelda(fechaFormat));

            const tdAcciones = document.createElement('td');
            
            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn-secondary btn-icon';
            btnEditar.textContent = 'Editar';
            btnEditar.onclick = () => abrirModalEditar(incidencia);
            
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-danger btn-icon';
            btnEliminar.textContent = 'Borrar';
            btnEliminar.onclick = () => abrirModalEliminar(incidencia);

            tdAcciones.appendChild(btnEditar);
            tdAcciones.appendChild(btnEliminar);
            tr.appendChild(tdAcciones);

            tbody.appendChild(tr);
        });
    };

    const aplicarFiltros = () => {
        const texto = inputFiltroTexto.value.toLowerCase();
        const estado = selectFiltroEstado.value;

        const filtrados = listaActual.filter(inc => {
            const coincideTexto = inc.titulo.toLowerCase().includes(texto) || inc.ubicacion.toLowerCase().includes(texto);
            const coincideEstado = estado === 'Todos' || inc.estado === estado;
            return coincideTexto && coincideEstado;
        });

        actualizarEstadisticas(listaActual); 
        renderizarTabla(filtrados);
    };

    const cargarIncidencias = async () => {
        try {
            listaActual = await API.listarIncidencias();
            aplicarFiltros(); 
        } catch (error) {
            mostrarToast('Error al cargar los datos.', 'error');
        }
    };

    const abrirModalEditar = (incidencia) => {
        idEdicionActual = incidencia._id;
        displayEditTitulo.textContent = incidencia.titulo;
        selectEditEstado.value = incidencia.estado;
        selectEditPrioridad.value = incidencia.prioridad;
        inputEditDescripcion.value = incidencia.descripcion;
        modalEditar.showModal(); 
    };

    const abrirModalEliminar = (incidencia) => {
        idEliminacionActual = incidencia._id;
        displayDelTitulo.textContent = incidencia.titulo;
        modalEliminar.showModal();
    };

    // 4. EVENT LISTENERS (INTERACCIONES DEL USUARIO)
    
    // Navegación
    btnNavDashboard.addEventListener('click', () => cambiarVista('dashboard'));
    btnNavNuevo.addEventListener('click', () => cambiarVista('nuevo'));
    
    btnCancelarRegistro.addEventListener('click', () => {
        formRegistro.reset();
        cambiarVista('dashboard');
    });

    // Filtros
    inputFiltroTexto.addEventListener('input', aplicarFiltros);
    selectFiltroEstado.addEventListener('change', aplicarFiltros);

    // Contadores del formulario
    inputRegTitulo.addEventListener('input', (e) => {
        charTitulo.textContent = e.target.value.length;
    });
    inputRegDescripcion.addEventListener('input', (e) => {
        charDescripcion.textContent = e.target.value.length;
    });

    // Envío de Formularios
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const datos = {
            titulo: inputRegTitulo.value.trim(),
            ubicacion: inputRegUbicacion.value.trim(),
            categoria: selectRegCategoria.value,
            prioridad: selectRegPrioridad.value,
            descripcion: inputRegDescripcion.value.trim()
        };

        try {
            await API.registrarIncidencia(datos);
            mostrarToast('Reporte registrado con éxito.', 'success');
            formRegistro.reset();
            charTitulo.textContent = '0';
            charDescripcion.textContent = '0';
            cambiarVista('dashboard');
        } catch (error) {
            mostrarToast('No se pudo guardar el reporte.', 'error');
        }
    });

    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cambios = {
            estado: selectEditEstado.value,
            prioridad: selectEditPrioridad.value,
            descripcion: inputEditDescripcion.value.trim()
        };

        try {
            await API.actualizarIncidencia(idEdicionActual, cambios);
            mostrarToast('Reporte actualizado correctamente.', 'success');
            modalEditar.close();
            cargarIncidencias();
        } catch (error) {
            mostrarToast('Error al actualizar el reporte.', 'error');
        }
    });

    // Acciones de Modales
    btnCerrarEditar.addEventListener('click', () => {
        modalEditar.close();
        idEdicionActual = null;
    });

    btnCerrarEliminar.addEventListener('click', () => {
        modalEliminar.close();
        idEliminacionActual = null;
        mostrarToast('Eliminación cancelada.', 'info');
    });

    btnConfirmarEliminar.addEventListener('click', async () => {
        try {
            await API.eliminarIncidencia(idEliminacionActual);
            mostrarToast('Reporte eliminado de forma permanente.', 'success');
            modalEliminar.close();
            cargarIncidencias();
        } catch (error) {
            mostrarToast('Error al eliminar el reporte.', 'error');
        }
    });

    // 5. INICIALIZACIÓN
    cargarIncidencias();
});