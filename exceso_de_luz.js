// ================================================================
// exceso_de_luz.js - Sistema completo de progreso y gestión
// ================================================================

// ── Sistema de almacenamiento local ──
class ProgresoManager {
    constructor() {
        this.storageKey = 'exceso_luz_progreso';
        this.progreso = this.cargarProgreso();
    }

    cargarProgreso() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {
            completados: {},
            historial: []
        };
    }

    guardarProgreso() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progreso));
    }

    marcarCompletado(id, titulo, categoria) {
        if (!this.progreso.completados[id]) {
            this.progreso.completados[id] = {
                titulo: titulo,
                categoria: categoria,
                fecha: new Date().toISOString()
            };
            
            this.progreso.historial.unshift({
                id: id,
                titulo: titulo,
                categoria: categoria,
                fecha: new Date().toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
            
            this.guardarProgreso();
            // Actualizar estadísticas de home si estamos en la página principal
            if (typeof actualizarEstadisticasHome === 'function') {
                actualizarEstadisticasHome();
            }
            return true;
        }
        return false;
    }

    desmarcarCompletado(id) {
        if (this.progreso.completados[id]) {
            delete this.progreso.completados[id];
            this.progreso.historial = this.progreso.historial.filter(item => item.id !== id);
            this.guardarProgreso();
            // Actualizar estadísticas de home si estamos en la página principal
            if (typeof actualizarEstadisticasHome === 'function') {
                actualizarEstadisticasHome();
            }
            return true;
        }
        return false;
    }

    estaCompletado(id) {
        return !!this.progreso.completados[id];
    }

    limpiarTodo() {
        if (confirm('¿Estás seguro de que quieres borrar todo tu progreso? Esta acción no se puede deshacer.')) {
            this.progreso = {
                completados: {},
                historial: []
            };
            this.guardarProgreso();
            location.reload();
        }
    }

    obtenerEstadisticas() {
        const categorias = {
            libros: 0,
            devocionales: 0,
            aplicaciones: 0,
            musica: 0,
            fondos: 0
        };

        Object.values(this.progreso.completados).forEach(item => {
            if (categorias.hasOwnProperty(item.categoria)) {
                categorias[item.categoria]++;
            }
        });

        return {
            total: Object.keys(this.progreso.completados).length,
            libros: categorias.libros,
            devocionales: categorias.devocionales,
            aplicaciones: categorias.aplicaciones,
            musica: categorias.musica,
            fondos: categorias.fondos
        };
    }

    formatearCategoria(categoria) {
        const nombres = {
            'libros': '📚 Libro',
            'devocionales': '📖 Devocional',
            'aplicaciones': '📱 Aplicación',
            'musica': '🎵 Canción',
            'fondos': '🖼️ Fondo de Pantalla'
        };
        return nombres[categoria] || categoria;
    }
}

// Instancia global del manager de progreso
const progresoManager = new ProgresoManager();

// ── Función para crear un item de recurso (usado por apps, libros, etc) ──
function crearRecursoItem(recurso, categoria) {
    const estaCompletado = progresoManager.estaCompletado(recurso.id);
    
    const item = document.createElement('div');
    item.className = `resource-item${estaCompletado ? ' completed' : ''}`;
    item.setAttribute('data-id', recurso.id);
    
    item.innerHTML = `
    ${recurso.imagen ? `
        <div class="app-image">
            <img src="${recurso.imagen}" alt="${recurso.titulo}">
        </div>
    ` : ''}

    <h3>${recurso.titulo}</h3>
    <p class="resource-description">${recurso.descripcion}</p>

    <div class="resource-actions">
        <a href="${recurso.url}" target="_blank" rel="noopener" class="btn-link">Abrir →</a>
    </div>

    <div class="checkbox-wrapper">
        <input type="checkbox" id="${recurso.id}" ${estaCompletado ? 'checked' : ''}>
        <label for="${recurso.id}">
            ${estaCompletado ? 'Completado ✓' : 'Marcar como completado'}
        </label>
    </div>
`;

    
    // Event listener para el checkbox
    const checkbox = item.querySelector('input[type="checkbox"]');
    const label = item.querySelector('label');
    
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (progresoManager.marcarCompletado(recurso.id, recurso.titulo, categoria)) {
                item.classList.add('completed');
                label.textContent = 'Completado ✓';
                mostrarNotificacion('¡Recurso marcado como completado! 🎉');
            }
        } else {
            if (progresoManager.desmarcarCompletado(recurso.id)) {
                item.classList.remove('completed');
                label.textContent = 'Marcar como completado';
                mostrarNotificacion('Recurso desmarcado');
            }
        }
    });
    
    return item;
}

// Renderiza un array de recursos en un grid dado
function renderizarGrid(items, gridId, categoria) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(item => grid.appendChild(crearRecursoItem(item, categoria)));
}

// ── Función para mostrar notificaciones ──
function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27AE60, #229954);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 5000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Agregar animaciones CSS dinámicas
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ── Actualizar estadísticas en la página principal ──
function actualizarEstadisticasHome() {
    const stats = progresoManager.obtenerEstadisticas();
    
    const totalEl = document.getElementById('home-total');
    const librosEl = document.getElementById('home-libros');
    const devocionalesEl = document.getElementById('home-devocionales');
    const musicaEl = document.getElementById('home-musica');
    
    if (totalEl) totalEl.textContent = stats.total;
    if (librosEl) librosEl.textContent = stats.libros;
    if (devocionalesEl) devocionalesEl.textContent = stats.devocionales;
    if (musicaEl) musicaEl.textContent = stats.musica;
}

// ── Scroll header (páginas internas) ──
function iniciarScrollHeader() {
    const header  = document.querySelector('.header');
    const homeBtn = document.querySelector('.home-minimal');
    if (!header && !homeBtn) return;
    window.addEventListener('scroll', () => {
        const pasado = window.scrollY > 120;
        if (header)  header.style.transform  = pasado ? 'translateY(-100%)' : 'translateY(0)';
        if (homeBtn) homeBtn.classList.toggle('visible', pasado);
    }, { passive: true });
}

// ── Inicializar al cargar el DOM ──
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar stats si estamos en home
    const pagina = window.location.pathname.split('/').pop() || 'index.html';
    if (pagina === 'index.html' || pagina === '' || pagina === '/') {
        actualizarEstadisticasHome();
    } else if (pagina === 'progreso.html') {
        cargarPaginaProgreso();
    }
    
    console.log('✨ Exceso de Luz cargado correctamente');
});

// ═══════════════════════════════════════════════════════
// PÁGINA DE PROGRESO - Funciones específicas
// ═══════════════════════════════════════════════════════

function cargarPaginaProgreso() {
    const stats = progresoManager.obtenerEstadisticas();
    
    // Actualizar estadísticas en las cards
    const ids = {
        'total-completados': stats.total,
        'libros-leidos': stats.libros,
        'devocionales-completados': stats.devocionales,
        'apps-probadas': stats.aplicaciones,
        'musica-escuchada': stats.musica,
        'fondos-descargados': stats.fondos
    };
    
    Object.entries(ids).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    });
    
    // Crear gráfico de barras
    crearGraficoProgreso(stats);
    
    // Actualizar historial
    actualizarHistorial();
    
    // Botón limpiar
    const btnLimpiar = document.getElementById('limpiar-progreso');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            progresoManager.limpiarTodo();
        });
    }
}

function crearGraficoProgreso(stats) {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) return;
    
    // Contar recursos totales dinámicamente desde cada página
    const totales = {
        libros: contarRecursos('libros'),
        devocionales: contarRecursos('devocionales'),
        aplicaciones: contarRecursos('aplicaciones'),
        musica: contarRecursos('musica'),
        fondos: contarRecursos('fondos')
    };
    
    const categorias = [
        { nombre: '📚 Libros', valor: stats.libros, total: totales.libros },
        { nombre: '📖 Devocionales', valor: stats.devocionales, total: totales.devocionales },
        { nombre: '📱 Aplicaciones', valor: stats.aplicaciones, total: totales.aplicaciones },
        { nombre: '🎵 Música', valor: stats.musica, total: totales.musica },
        { nombre: '🖼️ Fondos', valor: stats.fondos, total: totales.fondos }
    ];
    
    chartContainer.innerHTML = '';
    
    categorias.forEach(cat => {
        const porcentaje = cat.total > 0 ? (cat.valor / cat.total) * 100 : 0;
        
        const barHTML = `
            <div class="chart-bar">
                <div class="chart-label">${cat.nombre}</div>
                <div class="chart-progress">
                    <div class="chart-fill" style="width: ${porcentaje}%"></div>
                    <div class="chart-numbers">${cat.valor}/${cat.total}</div>
                </div>
            </div>
        `;
        chartContainer.insertAdjacentHTML('beforeend', barHTML);
    });
}

// Función para contar recursos dinámicamente
function contarRecursos(categoria) {
    // Obtener de localStorage el conteo guardado
    const conteos = JSON.parse(localStorage.getItem('exceso_luz_conteos') || '{}');
    return conteos[categoria] || 0;
}

// Función para guardar el conteo de una categoría
function guardarConteoCategoria(categoria, cantidad) {
    const conteos = JSON.parse(localStorage.getItem('exceso_luz_conteos') || '{}');
    conteos[categoria] = cantidad;
    localStorage.setItem('exceso_luz_conteos', JSON.stringify(conteos));
}

function actualizarHistorial() {
    const historialList = document.getElementById('historial-list');
    if (!historialList) return;
    
    if (progresoManager.progreso.historial.length === 0) {
        historialList.innerHTML = '<p class="empty-state">Aún no has marcado ningún recurso como completado.</p>';
        return;
    }
    
    historialList.innerHTML = progresoManager.progreso.historial.map(item => `
        <div class="historial-item">
            <div class="historial-info">
                <div class="historial-title">${item.titulo}</div>
                <div class="historial-category">${progresoManager.formatearCategoria(item.categoria)}</div>
            </div>
            <div class="historial-date">${item.fecha}</div>
        </div>
    `).join('');
}
