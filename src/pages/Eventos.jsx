import React, { useState, useEffect, useMemo } from 'react';
import { addDays } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ModalDisciplinas from '../components/ModalDisciplinas.jsx';
import { Button, Box } from '@mui/material';
import {
  CalendarCheck,
  Eye,
  MapTrifold,
  ShareNetwork
} from "phosphor-react";

// Iconos y colores
import { disciplinaIcons, disciplinaColors } from '../utils/disciplinaMaps';

function clean(txt) {
  if (txt === null || txt === undefined) return '';
  return String(txt)
    .replace(/[^     .replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑüÜ.,:;()¿?¡!/\-\"'\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLugar(lugar) {
  if (!lugar) return { nombre: '', url: '' };
  try {
    if (typeof lugar === 'object') return lugar;
    const regex = /=HYPERLINK\("([^"]+)",\s*"([^"]+)"\)/i;
    const match = lugar.match(regex);
    if (match) return { nombre: clean(match[2]), url: match[1] };
    if (lugar.startsWith('http')) return { nombre: '', url: lugar };
    return { nombre: clean(lugar), url: '' };
  } catch (e) {
    console.error("Error parseando lugar:", e);
    return { nombre: '', url: '' };
  }
}

function addToGoogleCalendar(evento) {
  const title = encodeURIComponent(evento.evento || "Evento sin título");
  const details = encodeURIComponent(evento.evento);
  const location = encodeURIComponent(evento.lugar || "");
  const start = evento.fecha ? new Date(evento.fecha) : new Date();
  const end = evento.fecha_fin ? new Date(evento.fecha_fin) : new Date(start.getTime() + 60 * 60 * 1000);
  const formatDate = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${formatDate(start)}/${formatDate(end)}`;
  window.open(url, "_blank");
}

function shareEvento(evento) {
  const title = evento.evento || "Evento sin título";
  const disciplina = evento.disciplina || "";
  const lugar = evento.lugar || "";
  const link = evento.link || "";
  const fecha = evento.fecha ? new Date(evento.fecha).toLocaleDateString("es-ES", {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }) : '';
  const message = `📅 *${title}*\nDisciplina: ${disciplina}\nFecha: ${fecha}\nLugar: ${lugar}\n\n${link ? `🔗 Más info: ${link}` : ""}`.trim();
  navigator.clipboard.writeText(message)
    .then(() => alert("¡Evento copiado al portapapeles!"))
    .catch(err => console.error("Error copiando texto:", err));
}

function Evento({ item }) {
  const isMobile = window.innerWidth <= 600;
  const evento = item.evento ? clean(item.evento) : 'Evento sin título';
  const disciplina = item.disciplina || 'Otros';
  const hora = item.hora ? clean(item.hora) : '';
  const IconComponent = disciplinaIcons[disciplina] || CalendarCheck;
  const color = disciplinaColors[disciplina] || '#E0E0E0';
  const fechaBonita = item.fecha ? new Date(item.fecha).toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const fechaBonitaFin = item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const lugarParseado = parseLugar(item.lugar);
  const linkEvento = item.link || '#';
  let mapsLink = lugarParseado.url || (lugarParseado.nombre ? `https://www.google.com/maps/search/${encodeURIComponent(lugarParseado.nombre)}` : '#');

  return (
    <div style={{ borderLeft: `6px solid ${color}`, background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ background: color, borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
          <IconComponent color="#fff" size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.2em' }}>{evento}</h2>
          {fechaBonita && <p style={{ margin: '4px 0', fontSize: '0.95em', color: '#555' }}>{fechaBonita}</p>}
          {fechaBonitaFin && fechaBonitaFin !== fechaBonita && <p style={{ margin: '4px 0', fontSize: '0.95em', color: '#555' }}>Hasta {fechaBonitaFin}</p>}
          {hora && <p style={{ margin: '4px 0', fontSize: '0.95em', color: '#555' }}>{hora}</p>}
          {lugarParseado.nombre && <p style={{ margin: '4px 0', fontSize: '0.95em', color: '#555' }}>{lugarParseado.nombre}</p>}
          <span style={{ background: color, padding: '4px 8px', borderRadius: '8px', color: '#333', fontWeight: 'bold', fontSize: '0.8em' }}>{disciplina}</span>
        </div>
      </div>
      <div style={{marginTop: '12px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
        {linkEvento !== '#' && <button onClick={() => window.open(linkEvento, "_blank")} style={{ background: '#7B1FA2', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}><Eye size={28} color="#fff" /></button>}
        {mapsLink !== '#' && <button onClick={() => window.open(mapsLink, "_blank")} style={{ background: '#009688', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}><MapTrifold size={28} color="#fff" /></button>}
        <button onClick={() => addToGoogleCalendar(item)} style={{ background: '#FF7043', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}><CalendarCheck size={28} color="#fff" /></button>
        <button onClick={() => shareEvento(item)} style={{ background: '#FDD835', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}><ShareNetwork size={28} color="#fff" /></button>
      </div>
    </div>
  );
}

export default function EventosPage() {
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
	hoy.setHours(0, 0, 0, 0);
    const finRango = addDays(hoy, 30);
    const formato = (d) => d.toISOString().split("T")[0];
    const url = `https://spread-production-b053.up.railway.app/eventos?fecha_inicio=${formato(hoy)}&fecha_fin=${formato(finRango)}`;

    fetch(url)
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

  const fechaLimiteInicial = addDays(new Date(), 7);
	fechaLimiteInicial.setHours(23, 59, 59, 999);
	
  const eventosFiltradosOrdenados = useMemo(() => {
    const filtrados = eventos.filter((e) => {
      const evStart = e.fecha ? new Date(e.fecha) : null;
      const evEnd = e.fecha_fin ? new Date(e.fecha_fin) : evStart;
      const filtroInicio = fechaInicio || (() => {
	  const d = new Date();
		  d.setHours(0, 0, 0, 0);
		  return d;
	  })();
      const filtroFin = fechaFin || fechaLimiteInicial;
      if (!(evStart <= filtroFin && evEnd >= filtroInicio)) return false;
      if (disciplinasSeleccionadas.length > 0 && !disciplinasSeleccionadas.includes(e.disciplina)) return false;
      if (textoBusqueda.trim() !== '') {
        const searchLower = textoBusqueda.trim().toLowerCase();
        const campos = [e.evento || '', e.disciplina || '', e.lugar || '', e.link || ''].join(' ').toLowerCase();
        if (!campos.includes(searchLower)) return false;
      }
      return true;
    });
    return filtrados.sort((a, b) => new Date(a.fecha || '2100-01-01') - new Date(b.fecha || '2100-01-01'));
  }, [eventos, fechaInicio, fechaFin, disciplinasSeleccionadas, textoBusqueda]);

  return (
    <div style={{ width: '100%', padding: '16px', paddingBottom: '80px' }}>
      <h1 style={{ textAlign: 'center', color: '#673ab7' }}>Cosas que hacer en Asturias</h1>

      {snackbarVisible && (
        <div style={{ background: '#673ab7', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          Mostrando solo eventos de los próximos 7 días. Si quieres buscar más adelante usa los botones de fecha.
          <button onClick={() => setSnackbarVisible(false)} style={{ marginLeft: '16px', background: '#fff', color: '#673ab7', border: 'none', borderRadius: '4px', padding: '4px 8px' }}>OK</button>
        </div>
      )}

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

      <Button variant="outlined" onClick={() => setModalOpen(true)}>{`Disciplinas:`}</Button>
      <ModalDisciplinas
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        disciplinasOptions={Object.keys(disciplinaIcons)}
        disciplinasSeleccionadas={disciplinasSeleccionadas}
        toggleDisciplina={(d) => {
          if (disciplinasSeleccionadas.includes(d)) {
            setDisciplinasSeleccionadas(disciplinasSeleccionadas.filter(x => x !== d));
          } else {
            setDisciplinasSeleccionadas([...disciplinasSeleccionadas, d]);
          }
        }}
        conteoInicial={conteoInicial}
        disciplinaColors={disciplinaColors}
      />

      {disciplinasSeleccionadas.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {disciplinasSeleccionadas.map((d) => {
            const count = conteoInicial[d] || 0;
            return (
              <div key={d} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: 'linear-gradient(135deg, #4A90E2, #4285F4)', borderRadius: '20px', color: '#fff', fontWeight: '500', fontSize: '0.85em', height: '32px' }}>
                <span style={{ marginRight: '8px' }}>{d}</span>
                <span style={{ background: '#fff', color: '#4285F4', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75em', fontWeight: 'bold', marginRight: '8px' }}>{count}</span>
                <button onClick={() => setDisciplinasSeleccionadas(disciplinasSeleccionadas.filter(x => x !== d))} style={{ background: '#fff', color: '#4285F4', borderRadius: '50%', width: '20px', height: '20px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', cursor: 'pointer' }}>×</button>
              </div>
            );
          })}
        </Box>
      )}

      <div style={{ margin: '16px 0' }}>
        <Button variant="contained" color="secondary" onClick={() => setDisciplinasSeleccionadas([])}>Quitar filtros</Button>
      </div>

      {eventosFiltradosOrdenados.length === 0 && <p>No se encontraron eventos.</p>}
      {eventosFiltradosOrdenados.map(ev => <Evento key={ev.id} item={ev} />)}
    </div>
  );
}
