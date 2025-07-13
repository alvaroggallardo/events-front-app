import React, { useState, useEffect } from 'react';
import { addDays } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import ModalDisciplinas from './components/ModalDisciplinas.jsx';
import { Button, Box } from '@mui/material';

import {
  MusicNote,
  FilmSlate,
  Palette,
  BookOpen,
  Users,
  Microphone,
  Robot,
  MapTrifold,
  ForkKnife,
  Baby,
  Heartbeat,
  Megaphone,
  MaskHappy,
  Star,
  CalendarCheck,
  Leaf,
} from "phosphor-react";

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

  navigator.clipboard.writeText(message)
    .then(() => alert("¡Evento copiado al portapapeles!"))
    .catch(err => console.error("Error copiando texto:", err));
}

/* ================================
   Diccionarios de iconos y colores
================================ */

const disciplinaIcons = {
  'Cine': FilmSlate,
  'Artes Escénicas': MaskHappy,
  'Música': MusicNote,
  'Artes Visuales': Palette,
  'Narración Oral': Microphone,
  'Conferencias': Megaphone,
  'Literatura': BookOpen,
  'Danza': Users,
  'Formación / Taller': CalendarCheck,
  'Cultura Tradicional': Star,
  'Itinerarios Patrimoniales': MapTrifold,
  'Público Infantil / Familiar': Baby,
  'Medio Ambiente': Leaf,
  'Salud y Bienestar': Heartbeat,
  'Tecnología / Innovación': Robot,
  'Gastronomía': ForkKnife,
  'Sociedad / Inclusión': Users,
  'Divulgación / Institucional': Megaphone,
  'Multidisciplinar': Users,
  'Actividades especiales': Star,
  'Eventos': CalendarCheck,
  'Deportes / Actividad Física': Users,
  'Otros': Users,
};

const disciplinaColors = {
  'Cine': '#FFE4E1',
  'Artes Escénicas': '#E1F5FE',
  'Música': '#FFF9C4',
  'Artes Visuales': '#F8BBD0',
  'Narración Oral': '#FFECB3',
  'Conferencias': '#D1C4E9',
  'Literatura': '#B2DFDB',
  'Danza': '#FCE4EC',
  'Formación / Taller': '#FFCCBC',
  'Cultura Tradicional': '#DCEDC8',
  'Itinerarios Patrimoniales': '#C5CAE9',
  'Público Infantil / Familiar': '#FFCDD2',
  'Medio Ambiente': '#C8E6C9',
  'Salud y Bienestar': '#B3E5FC',
  'Tecnología / Innovación': '#E0F7FA',
  'Gastronomía': '#FFF8E1',
  'Sociedad / Inclusión': '#F1F8E9',
  'Divulgación / Institucional': '#F3E5F5',
  'Multidisciplinar': '#E6EE9C',
  'Actividades especiales': '#FFCCBC',
  'Eventos': '#FFE0B2',
  'Deportes / Actividad Física': '#FFB74D',
  'Otros': '#E0E0E0',
};

/* ================================
   Componente Evento
================================ */

function Evento({ item }) {
  if (!item) return null;

  const evento = item.evento ? clean(item.evento) : 'Evento sin título';
  const disciplina = item.disciplina || 'Otros';
  const hora = item.hora ? clean(item.hora) : '';

  const IconComponent = disciplinaIcons[disciplina] || Star;
  const color = disciplinaColors[disciplina] || '#E0E0E0';

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
    <div style={{
      borderLeft: `6px solid ${color}`,
      background: '#fff',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          background: color,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px'
        }}>
          <IconComponent color="#fff" size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.2em' }}>{evento}</h2>
          {fechaBonita && <p>{fechaBonita}</p>}
          {fechaBonitaFin && fechaBonitaFin !== fechaBonita && <p>Hasta {fechaBonitaFin}</p>}
          {hora && <p>{hora}</p>}
          {lugarParseado.nombre && <p>{lugarParseado.nombre}</p>}
          <span style={{
            background: color,
            padding: '4px 8px',
            borderRadius: '8px',
            color: '#333',
            fontWeight: 'bold',
            fontSize: '0.8em'
          }}>{disciplina}</span>
        </div>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        {linkEvento !== '#' && (
          <button onClick={() => window.open(linkEvento, "_blank")}>Ver Evento</button>
        )}
        {mapsLink !== '#' && (
          <button onClick={() => window.open(mapsLink, "_blank")}>Ver en Maps</button>
        )}
        <button onClick={() => addToGoogleCalendar(item)}>Añadir a Calendar</button>
        <button onClick={() => shareEvento(item)}>Compartir</button>
      </div>
    </div>
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
  const [snackbarVisible, setSnackbarVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [conteoInicial, setConteoInicial] = useState({});

  useEffect(() => {
    const hoy = new Date();
    const fin = addDays(hoy, 7);
    const formato = (d) => d.toISOString().split("T")[0];
    const url = `https://web-production-1f968.up.railway.app/eventos?fecha_inicio=${formato(hoy)}&fecha_fin=${formato(fin)}`;
    fetch(url, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => {
        setEventos(data);
        const totalConteo = data.reduce((acc, ev) => {
          const disciplina = ev.disciplina || 'Otros';
          acc[disciplina] = (acc[disciplina] || 0) + 1;
          return acc;
        }, {});
        setConteoInicial(totalConteo);
      })
      .catch(console.error);
  }, []);

  const disciplinasOptions = Object.keys(disciplinaIcons);

  const toggleDisciplina = (d) => {
    if (disciplinasSeleccionadas.includes(d)) {
      setDisciplinasSeleccionadas(disciplinasSeleccionadas.filter((x) => x !== d));
    } else {
      setDisciplinasSeleccionadas([...disciplinasSeleccionadas, d]);
    }
  };

  const eventosFiltrados = eventos.filter((e) => {
    if (fechaInicio || fechaFin) {
      const evStart = e.fecha ? new Date(e.fecha) : null;
      const evEnd = e.fecha_fin ? new Date(e.fecha_fin) : evStart;
      const filtroInicio = fechaInicio || new Date('1900-01-01');
      const filtroFin = fechaFin || new Date('2999-12-31');
      if (!(evStart <= filtroFin && evEnd >= filtroInicio)) return false;
    }
    if (disciplinasSeleccionadas.length > 0 && !disciplinasSeleccionadas.includes(e.disciplina)) {
      return false;
    }
    if (textoBusqueda.trim() !== '') {
      const searchLower = textoBusqueda.trim().toLowerCase();
      const campos = [e.evento || '', e.disciplina || '', e.lugar || '', e.link || ''].join(' ').toLowerCase();
      if (!campos.includes(searchLower)) return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ textAlign: 'center', color: '#673ab7' }}>
        Cosas que hacer en Asturias
      </h1>

      {/* Snackbar */}
      {snackbarVisible && (
        <div style={{
          background: '#673ab7',
          color: '#fff',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          Mostrando solo eventos de los próximos 7 días. Si quieres buscar más adelante usa los botones de fecha.
          <button
            style={{
              marginLeft: '16px',
              background: '#fff',
              color: '#673ab7',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px'
            }}
            onClick={() => setSnackbarVisible(false)}
          >
            OK
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <label>Fecha inicio:</label><br />
          <DatePicker selected={fechaInicio} onChange={setFechaInicio} dateFormat="dd/MM/yyyy" placeholderText="Fecha inicio" />
        </div>
        <div>
          <label>Fecha fin:</label><br />
          <DatePicker selected={fechaFin} onChange={setFechaFin} dateFormat="dd/MM/yyyy" placeholderText="Fecha fin" />
        </div>
        <div style={{ flexGrow: 1 }}>
          <label>Buscar:</label><br />
          <input
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Buscar evento..."
          />
        </div>
      </div>

      {/* Botón para abrir el modal */}
      <Button variant="outlined" onClick={() => setModalOpen(true)}>
        {disciplinasSeleccionadas.length > 0
          `Disciplinas: ${disciplinasSeleccionadas.length}`
      </Button>

      {/* Modal */}
      <ModalDisciplinas
		  open={modalOpen}
		  onClose={() => setModalOpen(false)}
		  disciplinasOptions={disciplinasOptions}
		  disciplinasSeleccionadas={disciplinasSeleccionadas}
		  toggleDisciplina={toggleDisciplina}
		  conteoInicial={conteoInicial}
		  disciplinaColors={disciplinaColors}
		/>

      {/* Chips seleccionadas */}
      {disciplinasSeleccionadas.length > 0 && (
	  
       <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
		  {disciplinasSeleccionadas.map((d) => {
			  
			const count = conteoInicial[d] || 0;

			return (
			  <div
				key={d}
				style={{
				  backgroundColor: '#4285F4',
				  color: '#ffffff',
				  borderRadius: '16px',
				  padding: '4px 10px',
				  display: 'flex',
				  alignItems: 'center',
				  fontWeight: '500',
				  fontSize: '0.85em',
				  height: '32px',
				}}
			  >
				{/* Nombre de disciplina */}
				<span style={{ marginRight: '8px' }}>{d}</span>

				{/* Circulito con número */}
				<span
				  style={{
					background: '#ffffff',
					color: '#4285F4',
					borderRadius: '50%',
					width: '20px',
					height: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '0.75em',
					fontWeight: 'bold',
				  }}
				>
				  {count}
				</span>

				{/* Botón X */}
				<button
				  onClick={() => toggleDisciplina(d)}
				  style={{
					marginLeft: '8px',
					background: 'none',
					border: 'none',
					color: '#E53935',
					fontSize: '1em',
					lineHeight: '1',
					cursor: 'pointer',
				  }}
				  title={`Quitar filtro ${d}`}
				>
				  ×
				</button>
			  </div>
			);
		  })}
		</Box>

		
      )}

      <div style={{ margin: '16px 0' }}>
        <Button variant="contained" color="secondary" onClick={() => setDisciplinasSeleccionadas([])}>
          Quitar filtros
        </Button>
      </div>

      {/* Lista de eventos */}
      {eventosFiltrados.length === 0 && <p>No se encontraron eventos.</p>}
      {eventosFiltrados.map(ev => (
        <Evento key={ev.id} item={ev} />
      ))}
    </div>
  );
}
