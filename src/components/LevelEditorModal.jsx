import { useState } from 'react';
import { X, Plus, Play, Trash2, Edit3, Save } from 'lucide-react';
import useGameStore from '../store/useGameStore';
import { getCustomLevels, saveCustomLevel, deleteCustomLevel, createCustomLevelId, buildLevelConfig, ALL_COMPONENTS } from '../engine/CustomLevels';

const COMPONENT_LABELS = {
  server: 'Server', database: 'Database', loadBalancer: 'Load Balancer',
  cache: 'Cache', cdn: 'CDN', region: 'Region', replica: 'Replica',
  healthCheck: 'Health Check', apiGateway: 'API Gateway', messageQueue: 'Message Queue',
  worker: 'Worker', autoScaler: 'Auto-Scaler', circuitBreaker: 'Circuit Breaker',
};

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 8,
  background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
  color: 'var(--text-primary)', fontSize: 13, fontFamily: "'Inter', sans-serif",
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4, display: 'block',
};

const sliderRow = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 };

function EditorForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [budget, setBudget] = useState(initial?.budget || 5000);
  const [targetRps, setTargetRps] = useState(initial?.targetRps || 5000);
  const [latencyTarget, setLatencyTarget] = useState(initial?.latencyTarget || 100);
  const [sustainSeconds, setSustainSeconds] = useState(initial?.sustainSeconds || 10);
  const [components, setComponents] = useState(initial?.components || [...ALL_COMPONENTS]);
  const [failOnOverload, setFailOnOverload] = useState(initial?.failOnOverload !== false);
  const [failOnDown, setFailOnDown] = useState(initial?.failOnDown || false);

  const toggleComponent = (comp) => {
    setComponents(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: initial?.id || createCustomLevelId(),
      name: name.trim(),
      description: description.trim(),
      budget,
      targetRps,
      latencyTarget,
      sustainSeconds,
      components,
      failOnOverload,
      failOnDown,
      createdAt: initial?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Level Name</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="My Custom Level" />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Describe the challenge..."
        />
      </div>

      <div style={sliderRow}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Budget: ${budget.toLocaleString()}</label>
          <input type="range" min={1000} max={50000} step={500} value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-healthy)' }} />
        </div>
      </div>

      <div style={sliderRow}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Target RPS: {targetRps.toLocaleString()}</label>
          <input type="range" min={500} max={100000} step={500} value={targetRps}
            onChange={e => setTargetRps(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-info)' }} />
        </div>
      </div>

      <div style={sliderRow}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Latency Target: {latencyTarget}ms</label>
          <input type="range" min={10} max={500} step={10} value={latencyTarget}
            onChange={e => setLatencyTarget(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-warning)' }} />
        </div>
      </div>

      <div style={sliderRow}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Sustain Time: {sustainSeconds}s</label>
          <input type="range" min={5} max={60} step={5} value={sustainSeconds}
            onChange={e => setSustainSeconds(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--text-accent)' }} />
        </div>
      </div>

      {/* Fail conditions */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Fail Conditions</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <input type="checkbox" checked={failOnOverload} onChange={() => setFailOnOverload(!failOnOverload)}
              style={{ accentColor: 'var(--color-critical)' }} />
            Overloaded server
          </label>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <input type="checkbox" checked={failOnDown} onChange={() => setFailOnDown(!failOnDown)}
              style={{ accentColor: 'var(--color-critical)' }} />
            System down
          </label>
        </div>
      </div>

      {/* Available components */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Available Components</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ALL_COMPONENTS.map(comp => (
            <button
              key={comp}
              onClick={() => toggleComponent(comp)}
              style={{
                padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                cursor: 'pointer', transition: 'all 150ms',
                background: components.includes(comp) ? 'var(--color-info-bg)' : 'var(--bg-primary)',
                color: components.includes(comp) ? 'var(--color-info)' : 'var(--text-muted)',
                border: `1px solid ${components.includes(comp) ? 'var(--color-info)' : 'var(--border-primary)'}`,
              }}
            >
              {COMPONENT_LABELS[comp]}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '8px 16px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={!name.trim()} style={{
          padding: '8px 20px', background: 'var(--text-accent)', color: 'var(--bg-primary)',
          border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer',
          opacity: name.trim() ? 1 : 0.5,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Save size={12} /> Save Level
        </button>
      </div>
    </div>
  );
}

export default function LevelEditorModal() {
  const showLevelEditor = useGameStore(s => s.showLevelEditor);
  const toggleLevelEditor = useGameStore(s => s.toggleLevelEditor);
  const loadCustomLevel = useGameStore(s => s.loadCustomLevel);

  const [customLevels, setCustomLevels] = useState(getCustomLevels);
  const [editing, setEditing] = useState(null); // null = list, 'new' = new form, object = editing existing
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (!showLevelEditor) return null;

  const handleSave = (level) => {
    const updated = saveCustomLevel(level);
    setCustomLevels(updated);
    setEditing(null);
  };

  const handleDelete = (id) => {
    const updated = deleteCustomLevel(id);
    setCustomLevels(updated);
    setConfirmDelete(null);
  };

  const handlePlay = (custom) => {
    toggleLevelEditor();
    loadCustomLevel(custom);
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '20px 0',
      }}
      onClick={toggleLevelEditor}
    >
      <div
        className="animate-slide-up"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--text-accent)',
          borderRadius: 20,
          maxWidth: 520, width: '90%',
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px 14px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editing && (
              <button onClick={() => setEditing(null)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: 2, display: 'flex',
              }}>
                <X size={16} />
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {editing === 'new' ? 'Create Level' : editing ? 'Edit Level' : 'Level Editor'}
            </h2>
          </div>
          <button
            onClick={toggleLevelEditor}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '0 24px 20px' }}>
          {editing ? (
            <EditorForm
              initial={editing === 'new' ? null : editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <>
              {/* Create button */}
              <button
                onClick={() => setEditing('new')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 10, width: '100%',
                  background: 'var(--text-accent)', color: 'var(--bg-primary)',
                  border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  marginBottom: 16,
                }}
              >
                <Plus size={16} /> Create New Level
              </button>

              {/* Level list */}
              {customLevels.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  No custom levels yet. Create your first one!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {customLevels.map(lvl => (
                    <div key={lvl.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{lvl.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {lvl.targetRps?.toLocaleString()} RPS &middot; ${lvl.budget?.toLocaleString()} &middot; {lvl.latencyTarget}ms
                        </div>
                      </div>
                      <button onClick={() => handlePlay(lvl)} style={{
                        padding: '6px 10px', background: 'var(--color-healthy-bg)', color: 'var(--color-healthy)',
                        border: '1px solid var(--color-healthy)', borderRadius: 6, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
                      }}>
                        <Play size={11} /> Play
                      </button>
                      <button onClick={() => setEditing(lvl)} style={{
                        padding: '6px 8px', background: 'var(--bg-primary)', color: 'var(--text-muted)',
                        border: '1px solid var(--border-primary)', borderRadius: 6, cursor: 'pointer', display: 'flex',
                      }}>
                        <Edit3 size={12} />
                      </button>
                      {confirmDelete === lvl.id ? (
                        <button onClick={() => handleDelete(lvl.id)} style={{
                          padding: '6px 8px', background: 'var(--color-critical)', color: 'white',
                          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 700,
                        }}>
                          Confirm
                        </button>
                      ) : (
                        <button onClick={() => setConfirmDelete(lvl.id)} style={{
                          padding: '6px 8px', background: 'var(--color-critical-bg)', color: 'var(--color-critical)',
                          border: '1px solid var(--color-critical)', borderRadius: 6, cursor: 'pointer', display: 'flex',
                        }}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
