import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, X, Trash2, User, 
  MapPin, AlertCircle, ChevronLeft, ChevronRight, Check, Ban
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Agenda() {
  const [meetings, setMeetings] = useState([]);
  const [contacts, setContacts] = useState([]);
  
  // Date states - Initialized to June 2026 (matching system date)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 18));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 5, 18));

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Demonstração');
  const [contactId, setContactId] = useState('');
  const [dateStr, setDateStr] = useState('2026-06-18');
  const [timeStr, setTimeStr] = useState('14:00');
  const [status, setStatus] = useState('Pendente');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAgendaData();
  }, []);

  const loadAgendaData = () => {
    setMeetings(dbService.getMeetings());
    setContacts(dbService.getContacts().filter(c => c.status !== 'Bloqueado'));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const daysArray = [];
  // Fill empty spaces for days of previous month
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Fill actual days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }

  const getMeetingsForDate = (date) => {
    if (!date) return [];
    const localDateStr = formatDateKey(date);
    return meetings.filter(m => m.date === localDateStr);
  };

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const openNewMeetingModal = (date = selectedDate) => {
    setEditingMeeting(null);
    setTitle('');
    setType('Demonstração');
    setContactId(contacts.length > 0 ? contacts[0].id : '');
    setDateStr(formatDateKey(date));
    setTimeStr('14:00');
    setStatus('Pendente');
    setNotes('');
    setShowModal(true);
  };

  const openEditMeetingModal = (meeting) => {
    setEditingMeeting(meeting);
    setTitle(meeting.title);
    setType(meeting.type);
    setContactId(meeting.contactId);
    setDateStr(meeting.date);
    setTimeStr(meeting.time);
    setStatus(meeting.status);
    setNotes(meeting.notes || '');
    setShowModal(true);
  };

  const handleSaveMeeting = (e) => {
    e.preventDefault();
    if (!title) {
      alert('O título da reunião é obrigatório.');
      return;
    }

    const meetingData = {
      id: editingMeeting ? editingMeeting.id : undefined,
      title,
      type,
      contactId,
      date: dateStr,
      time: timeStr,
      status,
      notes
    };

    dbService.saveMeeting(meetingData);
    loadAgendaData();
    setShowModal(false);

    // If it's a new meeting, log a timeline notice in contact chat
    if (!editingMeeting) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        if (!contact.chatHistory) contact.chatHistory = [];
        contact.chatHistory.push({
          sender: 'agent',
          message: `📅 REUNIÃO AGENDADA - Compromisso "${title}" (${type}) marcado para o dia ${new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')} às ${timeStr}.`,
          timestamp: new Date().toISOString()
        });
        dbService.saveContact(contact);
      }
    }
  };

  const handleDeleteMeeting = (id) => {
    if (window.confirm('Tem certeza que deseja desmarcar esta reunião?')) {
      dbService.deleteMeeting(id);
      loadAgendaData();
      setShowModal(false);
    }
  };

  const getMeetingColorClass = (type) => {
    switch (type) {
      case 'Demonstração': return 'type-demo';
      case 'Reunião Técnica': return 'type-tech';
      case 'Visita Comercial': return 'type-visit';
      default: return 'type-general';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Confirmada': return 'badge-success';
      case 'Pendente': return 'badge-warning';
      case 'Cancelada': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  // Month Names in PT-BR
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const selectedDateMeetings = getMeetingsForDate(selectedDate);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', marginTop: '10px' }}>
      
      {/* Dynamic inline styles for colors */}
      <style>{`
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
        }
        .calendar-header-cell {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 10px 0;
          text-transform: uppercase;
        }
        .calendar-day-cell {
          aspect-ratio: 1.25;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 8px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: 80px;
        }
        .calendar-day-cell:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(245, 158, 11, 0.3);
        }
        .calendar-day-cell.selected {
          border-color: var(--warning);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
          background: rgba(245, 158, 11, 0.02);
        }
        .calendar-day-cell.today {
          border-color: var(--primary);
          background: rgba(0, 210, 255, 0.02);
        }
        .calendar-day-cell.empty {
          background: transparent;
          border: none;
          cursor: default;
        }
        .day-number {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .calendar-day-cell.selected .day-number {
          color: var(--warning);
        }
        .calendar-day-cell.today .day-number {
          color: var(--primary);
        }
        .day-events {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 6px;
          overflow: hidden;
        }
        .day-event-dot {
          height: 6px;
          border-radius: 3px;
          font-size: 0.65rem;
          padding: 1px 6px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          color: #05070c;
          font-weight: 600;
        }
        .type-demo {
          background: var(--primary);
          box-shadow: 0 0 8px var(--primary-glow);
        }
        .type-tech {
          background: var(--info);
        }
        .type-visit {
          background: var(--warning);
          box-shadow: 0 0 8px var(--warning-glow);
        }
        .type-general {
          background: var(--text-secondary);
        }
      `}</style>

      {/* LEFT: CALENDAR WORKSPACE */}
      <div className="table-card glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="collapse-btn" onClick={handlePrevMonth} style={{ width: '32px', height: '32px' }}>
              <ChevronLeft size={16} />
            </button>
            <h2 style={{ fontSize: '1.2rem', minWidth: '150px', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
              {monthNames[month]} {year}
            </h2>
            <button className="collapse-btn" onClick={handleNextMonth} style={{ width: '32px', height: '32px' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => openNewMeetingModal()}>
            <Plus size={16} />
            <span>Agendar Reunião</span>
          </button>
        </div>

        {/* CALENDAR GRID */}
        <div className="calendar-grid">
          {/* Days of Week Headers */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="calendar-header-cell">{day}</div>
          ))}

          {/* Days Cells */}
          {daysArray.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="calendar-day-cell empty"></div>;
            
            const isSelected = formatDateKey(date) === formatDateKey(selectedDate);
            const isToday = formatDateKey(date) === '2026-06-18'; // Simulated local date
            const dateEvents = getMeetingsForDate(date);

            return (
              <div 
                key={date.getTime()} 
                className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="day-number">{date.getDate()}</span>
                <div className="day-events">
                  {dateEvents.slice(0, 2).map(meet => (
                    <div 
                      key={meet.id} 
                      className={`day-event-dot ${getMeetingColorClass(meet.type)}`}
                      title={meet.title}
                    >
                      {meet.time} {meet.title}
                    </div>
                  ))}
                  {dateEvents.length > 2 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      +{dateEvents.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: SELECTED DATE EVENTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compromissos agendados no dia</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
            {selectedDateMeetings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Nenhum compromisso agendado para esta data.
              </div>
            ) : (
              selectedDateMeetings.map(meet => {
                const contact = contacts.find(c => c.id === meet.contactId);
                return (
                  <div 
                    key={meet.id} 
                    className="glass-panel-hover" 
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '10px', cursor: 'pointer' }}
                    onClick={() => openEditMeetingModal(meet)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span className={`badge ${getStatusLabel(meet.status)}`} style={{ fontSize: '0.65rem' }}>
                        {meet.status}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)' }}>
                        <Clock size={12} />
                        <strong>{meet.time}</strong>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {meet.title}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={12} className="icon-info" />
                        <span>{contact ? `${contact.firstName} ${contact.lastName} (${contact.company})` : 'Sem contato associado'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={12} className="icon-warning" />
                        <span>Tipo: {meet.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
            onClick={() => openNewMeetingModal(selectedDate)}
          >
            <Plus size={14} />
            <span>Agendar para este dia</span>
          </button>
        </div>
      </div>

      {/* ==========================================================================
         SCHEDULING MODAL (NEW / EDIT)
         ========================================================================== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '500px', width: '100%' }}>
            
            <div className="modal-header">
              <h3>{editingMeeting ? 'Editar Compromisso' : 'Agendar Novo Compromisso'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div className="form-group">
                  <label>Título do Compromisso *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '14px' }}
                    placeholder="Ex: Reunião Comercial Apresentação"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Vincular a Lead/Cliente *</label>
                  <select 
                    className="filter-select"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                    value={contactId}
                    onChange={e => setContactId(e.target.value)}
                    required
                  >
                    <option value="">Selecione um contato...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.company})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Tipo de Compromisso</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                      value={type}
                      onChange={e => setType(e.target.value)}
                    >
                      <option value="Demonstração">Demonstração Online</option>
                      <option value="Reunião Técnica">Reunião Técnica / Alinhamento</option>
                      <option value="Visita Comercial">Visita Física Presencial</option>
                      <option value="Outro">Outro Compromisso</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Situação</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Data</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      style={{ paddingLeft: '14px' }}
                      value={dateStr}
                      onChange={e => setDateStr(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Horário</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      style={{ paddingLeft: '14px' }}
                      value={timeStr}
                      onChange={e => setTimeStr(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Observações / Notas</label>
                  <textarea 
                    className="form-control" 
                    style={{ paddingLeft: '14px', height: '80px', resize: 'vertical', fontSize: '0.8rem', paddingTop: '8px' }}
                    placeholder="Descrição do objetivo da reunião, pauta, links de reuniões Zoom/Meet, etc."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

              </div>

              <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <div>
                  {editingMeeting && (
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      style={{ padding: '10px 14px' }}
                      onClick={() => handleDeleteMeeting(editingMeeting.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">
                    Salvar Agendamento
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
