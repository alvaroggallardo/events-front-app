import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { addDays } from 'date-fns';



/* ================================
   Funciones utilitarias
================================ */

function clean(txt) {
  if (txt === null || txt === undefined) return '';
  return String(txt)
    .replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑüÜ.,:;()¿?¡!/\-\"'\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLugar(lugar) {
  if (!lugar) return { nombre: '', url: '' };

  try {
    if (typeof lugar === 'object') return lugar;

    const regex = /=HYPERLINK\("([^"]+)",\s*"([^"]+)"\)/i;
    const match = lugar.match(regex);

    if (match) {
      return {
        nombre: clean(match[2]) || '',
        url: match[1] || ''
      };
    }

    if (lugar.startsWith('http')) {
      return { nombre: '', url: lugar };
    }

    return { nombre: clean(lugar) || '', url: '' };
  } catch (e) {
    console.error("Error parseando lugar:", e);
    return { nombre: '', url: '' };
  }
}

function addToGoogleCalendar(evento) {
  const title = encodeURIComponent(evento.evento || "Evento sin título");
  const details = encodeURIComponent(evento.evento);
  const location = encodeURIComponent(evento.lugar || "");

  const start = evento.fecha
    ? new Date(evento.fecha)
    : new Date();

  let end;
  if (evento.fecha_fin) {
    end = new Date(evento.fecha_fin);
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  const formatDate = (date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+Z$/, "Z");

  const dates = `${formatDate(start)}/${formatDate(end)}`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;

  window.open(url, "_blank");
}

function shareEvento(evento) {
  const title = evento.evento || "Evento sin título";
  const disciplina = evento.disciplina || "";
  const lugar = evento.lugar || "";
  const link = evento.link || "";
  const fecha = evento.fecha
    ? new Date(evento.fecha).toLocaleDateString("es-ES", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const message = `
📅 *${title}*
Disciplina: ${disciplina}
Fecha: ${fecha}
Lugar: ${lugar}

${link ? `🔗 Más info: ${link}` : ""}
  `.trim();

  if (navigator.clipboard) {
    navigator.clipboard.writeText(message)
      .then(() => alert("¡Evento copiado al portapapeles!"))
      .catch(err => console.error("Error copiando texto:", err));
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = message;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert("¡Evento copiado al portapapeles!");
  }
}

/* ================================
   Diccionarios de iconos y colores
================================ */

const disciplinaIcons = {
  'Cine': Film,
  'Artes Escénicas': Theater,
  'Música': Music,
  'Artes Visuales': Palette,
  'Narración Oral': Mic,
  'Conferencias': Megaphone,
  'Literatura': BookOpen,
  'Danza': Users,
  'Formación / Taller': CalendarCheck,
  'Cultura Tradicional': Star,
  'Itinerarios Patrimoniales': Map,
  'Público Infantil / Familiar': Baby,
  'Medio Ambiente': Leaf,
  'Salud y Bienestar': Heart,
  'Tecnología / Innovación': Bot,
  'Gastronomía': Utensils,
  'Sociedad / Inclusión': Users,
  'Divulgación / Institucional': Megaphone,
  'Multidisciplinar': Users,
  'Actividades especiales': Star,
  'Eventos': CalendarCheck,
  'Deportes / Actividad Física': Users,
  'Otros': Users,
};

const disciplinaColors = {
  'Cine': '#FF6B6B',
  'Artes Escénicas': '#4ECDC4',
  'Música': '#FFE66D',
  'Artes Visuales': '#FF8A95',
  'Narración Oral': '#FFB74D',
  'Conferencias': '#BA68C8',
  'Literatura': '#81C784',
  'Danza': '#F48FB1',
  'Formación / Taller': '#FFAB91',
  'Cultura Tradicional': '#AED581',
  'Itinerarios Patrimoniales': '#9FA8DA',
  'Público Infantil / Familiar': '#EF5350',
  'Medio Ambiente': '#66BB6A',
  'Salud y Bienestar': '#42A5F5',
  'Tecnología / Innovación': '#26C6DA',
  'Gastronomía': '#FFC107',
  'Sociedad / Inclusión': '#9CCC65',
  'Divulgación / Institucional': '#CE93D8',
  'Multidisciplinar': '#D4E157',
  'Actividades especiales': '#FFAB91',
  'Eventos': '#FFCC02',
  'Deportes / Actividad Física': '#FF9800',
  'Otros': '#9E9E9E',
};

/* ================================
   Componente Loading
================================ */

function LoadingSpinner({ message = "Cargando eventos..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
}

/* ================================
   Componente Error
================================ */

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <p className="text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

/* ================================
   Componente Notification
================================ */

function Notification({ message, type = "info", onClose }) {
  const bgColor = type === "success" ? "bg-green-500" : "bg-purple-600";
  const Icon = type === "success" ? CheckCircle : Calendar;

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg mb-4 flex items-center justify-between`}>
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2" />
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ================================
   Componente Modal Disciplinas
================================ */

function ModalDisciplinas({ 
  open, 
  onClose, 
  disciplinasOptions, 
  disciplinasSeleccionadas, 
  toggleDisciplina, 
  conteoInicial 
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Filtrar por disciplinas</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {disciplinasOptions.map((disciplina) => {
              const count = conteoInicial[disciplina] || 0;
              const isSelected = disciplinasSeleccionadas.includes(disciplina);
              const IconComponent = disciplinaIcons[disciplina] || Star;
              const color = disciplinaColors[disciplina] || '#9E9E9E';

              return (
                <button
                  key={disciplina}
                  onClick={() => toggleDisciplina(disciplina)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: color }}
                    >
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{disciplina}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================
   Componente Evento
================================ */

function Evento({ item }) {
  if (!item) return null;

  const evento = item.evento ? clean(item.evento) : 'Evento sin título';
  const disciplina = item.disciplina || 'Otros';
  const hora = item.hora ? clean(item.hora) : '';

  const IconComponent = disciplinaIcons[disciplina] || Star;
  const color = disciplinaColors[disciplina] || '#9E9E9E';

  const fechaBonita = item.fecha
    ? new Date(item.fecha).toLocaleDateString("es-ES", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const fechaBonitaFin = item.fecha_fin
    ? new Date(item.fecha_fin).toLocaleDateString("es-ES", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const lugarParseado = parseLugar(item.lugar);
  const linkEvento = item.link || '#';

  let mapsLink = '#';
  if (lugarParseado.url) {
    mapsLink = lugarParseado.url;
  } else if (lugarParseado.nombre) {
    mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(lugarParseado.nombre)}`;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 p-4 mb-4 hover:shadow-lg transition-shadow duration-200"
         style={{ borderLeftColor: color }}>
      <div className="flex items-start">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
            {evento}
          </h3>

          <div className="text-sm text-gray-600 space-y-1">
            {fechaBonita && (
              <p className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {fechaBonita}
              </p>
            )}

            {fechaBonitaFin && fechaBonitaFin !== fechaBonita && (
              <p className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Hasta {fechaBonitaFin}
              </p>
            )}

            {hora && (
              <p className="flex items-center">
                <CalendarCheck className="w-4 h-4 mr-1" />
                {hora}
              </p>
            )}

            {lugarParseado.nombre && (
              <p className="flex items-center">
                <Map className="w-4 h-4 mr-1" />
                {lugarParseado.nombre}
              </p>
            )}
          </div>

          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {disciplina}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        {linkEvento !== '#' && (
          <button
            onClick={() => window.open(linkEvento, "_blank")}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors duration-200"
            title="Ver evento"
            aria-label="Ver evento"
          >
            <Eye className="w-5 h-5" />
          </button>
        )}

        {mapsLink !== '#' && (
          <button
            onClick={() => window.open(mapsLink, "_blank")}
            className="w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-colors duration-200"
            title="Ver en Maps"
            aria-label="Ver en Maps"
          >
            <Map className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => addToGoogleCalendar(item)}
          className="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors duration-200"
          title="Añadir a Calendario"
          aria-label="Añadir a Calendario"
        >
          <CalendarCheck className="w-5 h-5" />
        </button>

        <button
          onClick={() => shareEvento(item)}
          className="w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center transition-colors duration-200"
          title="Compartir evento"
          aria-label="Compartir evento"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ================================
   Componente DatePicker Simple
================================ */

function DatePicker({ selected, onChange, placeholderText }) {
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value) {
      onChange(new Date(value));
    } else {
      onChange(null);
    }
  };

  return (
    <input
      type="date"
      value={selected ? formatDate(selected) : ''}
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      placeholder={placeholderText}
    />
  );
}

/* ================================
   Componente principal
================================ */

export default function App() {
  const [eventos, setEventos] = useState([]);
  const [disciplinasSeleccionadas, setDisciplinasSeleccionadas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [conteoInicial, setConteoInicial] = useState({});

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hoy = new Date();
      const fin = addDays(hoy, 7);
      const formato = (d) => d.toISOString().split("T")[0];
      
      // Simulating API call since we can't actually make the request
      // In real app, uncomment the next lines:
      // const url = `https://web-production-1f968.up.railway.app/eventos?fecha_inicio=${formato(hoy)}&fecha_fin=${formato(fin)}`;
      // const response = await fetch(url);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          evento: "Concierto de música clásica",
          disciplina: "Música",
          fecha: new Date().toISOString(),
          hora: "20:00",
          lugar: "Teatro Campoamor",
          link: "https://example.com"
        },
        {
          id: 2,
          evento: "Exposición de arte contemporáneo",
          disciplina: "Artes Visuales",
          fecha: addDays(new Date(), 1).toISOString(),
          hora: "10:00",
          lugar: "Museo de Bellas Artes",
          link: "https://example.com"
        },
        {
          id: 3,
          evento: "Taller de cocina asturiana",
          disciplina: "Gastronomía",
          fecha: addDays(new Date(), 2).toISOString(),
          hora: "16:00",
          lugar: "Centro Cultural",
          link: "https://example.com"
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      setEventos(mockData);
      const totalConteo = mockData.reduce((acc, ev) => {
        const disciplina = ev.disciplina || 'Otros';
        acc[disciplina] = (acc[disciplina] || 0) + 1;
        return acc;
      }, {});
      setConteoInicial(totalConteo);
      
    } catch (err) {
      setError("Error al cargar los eventos. Por favor, inténtalo de nuevo.");
      console.error("Error fetching eventos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const disciplinasOptions = Object.keys(disciplinaIcons);

  const toggleDisciplina = useCallback((d) => {
    setDisciplinasSeleccionadas(prev => 
      prev.includes(d) 
        ? prev.filter(x => x !== d)
        : [...prev, d]
    );
  }, []);

  const eventosFiltrados = useMemo(() => {
    return eventos.filter((e) => {
      // Filtro por fecha
      if (fechaInicio || fechaFin) {
        const evStart = e.fecha ? new Date(e.fecha) : null;
        const evEnd = e.fecha_fin ? new Date(e.fecha_fin) : evStart;
        const filtroInicio = fechaInicio || new Date('1900-01-01');
        const filtroFin = fechaFin || new Date('2999-12-31');
        if (!(evStart <= filtroFin && evEnd >= filtroInicio)) return false;
      }

      // Filtro por disciplina
      if (disciplinasSeleccionadas.length > 0 && !disciplinasSeleccionadas.includes(e.disciplina)) {
        return false;
      }

      // Filtro por texto
      if (textoBusqueda.trim() !== '') {
        const searchLower = textoBusqueda.trim().toLowerCase();
        const campos = [e.evento || '', e.disciplina || '', e.lugar || '', e.link || ''].join(' ').toLowerCase();
        if (!campos.includes(searchLower)) return false;
      }

      return true;
    });
  }, [eventos, fechaInicio, fechaFin, disciplinasSeleccionadas, textoBusqueda]);

  const eventosFiltradosOrdenados = useMemo(() => {
    return [...eventosFiltrados].sort((a, b) => {
      const fechaA = new Date(a.fecha || '2100-01-01');
      const fechaB = new Date(b.fecha || '2100-01-01');
      return fechaA - fechaB;
    });
  }, [eventosFiltrados]);

  const clearFilters = useCallback(() => {
    setDisciplinasSeleccionadas([]);
    setFechaInicio(null);
    setFechaFin(null);
    setTextoBusqueda('');
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          Cosas que hacer en Asturias
        </h1>
        <p className="text-gray-600">Descubre eventos y actividades culturales</p>
      </header>

      {/* Notification */}
      {showNotification && (
        <Notification
          message="Mostrando solo eventos de los próximos 7 días. Si quieres buscar más adelante usa los filtros de fecha."
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Error */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchEventos}
        />
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio
            </label>
            <DatePicker 
              selected={fechaInicio} 
              onChange={setFechaInicio} 
              placeholderText="Fecha inicio" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin
            </label>
            <DatePicker 
              selected={fechaFin} 
              onChange={setFechaFin} 
              placeholderText="Fecha fin" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Buscar evento..."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Disciplinas
          </button>
          
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Quitar filtros
          </button>
        </div>
      </div>

      {/* Chips seleccionadas */}
      {disciplinasSeleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {disciplinasSeleccionadas.map((d) => {
            const count = conteoInicial[d] || 0;
            return (
              <div
                key={d}
                className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                <span className="mr-2">{d}</span>
                <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2">
                  {count}
                </span>
                <button
                  onClick={() => toggleDisciplina(d)}
                  className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  title={`Quitar filtro ${d}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ModalDisciplinas
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        disciplinasOptions={disciplinasOptions}
        disciplinasSeleccionadas={disciplinasSeleccionadas}
        toggleDisciplina={toggleDisciplina}
        conteoInicial={conteoInicial}
      />

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Lista de eventos */}
      {!loading && (
        <div>
          {eventosFiltradosOrdenados.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron eventos con los filtros seleccionados.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Mostrando {eventosFiltradosOrdenados.length} evento{eventosFiltradosOrdenados.length !== 1 ? 's' : ''}
              </p>
              {eventosFiltradosOrdenados.map(evento => (
                <Evento key={evento.id} item={evento} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}