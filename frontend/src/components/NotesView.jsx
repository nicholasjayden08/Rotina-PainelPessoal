import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, FileText, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LoadingBlock, ErrorBlock, EmptyHint } from './Shared';

function fmtDataNota(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function NotesView({ notas, loading, error, criar, atualizar, excluir }) {
    const [idSelecionado, setIdSelecionado] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [modo, setModo] = useState('editar');
    const [salvando, setSalvando] = useState(false);
    const saveTimeout = useRef(null);
    const ultimoSalvo = useRef({ titulo: '', conteudo: '' });

    const notaSelecionada = notas.find((n) => n.id === idSelecionado) || null;

    useEffect(() => {
        if (idSelecionado == null) return;
        const nota = notas.find((n) => n.id === idSelecionado);
        if (!nota) return;
        setTitulo(nota.titulo || '');
        setConteudo(nota.conteudo || '');
        ultimoSalvo.current = { titulo: nota.titulo || '', conteudo: nota.conteudo || '' };
        setModo('editar');
    }, [idSelecionado]);

    const salvarComDebounce = useCallback((novoTitulo, novoConteudo) => {
        if (idSelecionado == null) return;
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            if (novoTitulo === ultimoSalvo.current.titulo && novoConteudo === ultimoSalvo.current.conteudo) return;
            setSalvando(true);
            await atualizar(idSelecionado, { titulo: novoTitulo, conteudo: novoConteudo });
            ultimoSalvo.current = { titulo: novoTitulo, conteudo: novoConteudo };
            setSalvando(false);
        }, 1000);
    }, [idSelecionado, atualizar]);

    function handleTituloChange(e) {
        setTitulo(e.target.value);
        salvarComDebounce(e.target.value, conteudo);
    }

    function handleConteudoChange(e) {
        setConteudo(e.target.value);
        salvarComDebounce(titulo, e.target.value);
    }

    async function handleNova() {
        const nova = await criar({ titulo: 'nova nota', conteudo: '' });
        setIdSelecionado(nova.id);
    }

    async function handleExcluir(id, e) {
        e.stopPropagation();
        await excluir(id);
        if (idSelecionado === id) setIdSelecionado(null);
    }

    return (
        <div className="view-wrap fade-in" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Lista de notas */}
                <div style={{ width: 240, minWidth: 240, background: '#202020', borderRight: '1px solid #2c2c2c', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid #2c2c2c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="eyebrow">routinely</p>
                            <h1 className="page-title" style={{ fontSize: 18, marginBottom: 0 }}>notas</h1>
                        </div>
                        <button className="icon-btn" onClick={handleNova} title="nova nota"><Plus size={16} /></button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                        <ErrorBlock text={error} />
                        {loading ? (
                            <LoadingBlock text="carregando notas..." />
                        ) : notas.length === 0 ? (
                            <EmptyHint text="nenhuma nota ainda. crie a primeira!" />
                        ) : (
                            notas.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => setIdSelecionado(n.id)}
                                    style={{
                                        padding: '10px 14px', cursor: 'pointer',
                                        background: idSelecionado === n.id ? '#2c2c2c' : 'transparent',
                                        borderLeft: idSelecionado === n.id ? '2px solid #3DDC84' : '2px solid transparent',
                                        display: 'flex', alignItems: 'flex-start', gap: 8,
                                    }}
                                >
                                    <FileText size={13} color="#5A5F68" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, color: '#f0efed', fontWeight: idSelecionado === n.id ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {n.titulo || 'sem título'}
                                        </p>
                                        <p style={{ fontSize: 10, color: '#5A5F68', marginTop: 2 }}>{fmtDataNota(n.dataAtualizacao)}</p>
                                    </div>
                                    <button className="icon-btn" onClick={(e) => handleExcluir(n.id, e)} style={{ opacity: 0.4, flexShrink: 0 }}><Trash2 size={12} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {!notaSelecionada ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#5A5F68' }}>
                            <FileText size={36} strokeWidth={1.25} />
                            <p style={{ fontSize: 13 }}>selecione uma nota ou crie uma nova</p>
                            <button className="primary-btn" onClick={handleNova}><Plus size={14} /> nova nota</button>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '12px 20px', borderBottom: '1px solid #2c2c2c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <input
                                    value={titulo}
                                    onChange={handleTituloChange}
                                    placeholder="título da nota"
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0efed', fontSize: 16, fontWeight: 700, fontFamily: 'inherit' }}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    {salvando && <span style={{ fontSize: 11, color: '#5A5F68' }}>salvando...</span>}
                                    {!salvando && <span style={{ fontSize: 11, color: '#3DDC84' }}>salvo</span>}
                                    <button className="secondary-btn" onClick={() => setModo(modo === 'editar' ? 'preview' : 'editar')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                        {modo === 'editar' ? <><Eye size={13} /> preview</> : <><Edit3 size={13} /> editar</>}
                                    </button>
                                </div>
                            </div>

                            {modo === 'editar' ? (
                                <textarea
                                    value={conteudo}
                                    onChange={handleConteudoChange}
                                    placeholder={`escreva sua nota em markdown...\n\n# título\n**negrito**, *itálico*\n- item de lista`}
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: '#f0efed', fontSize: 13, lineHeight: 1.7, padding: '20px', fontFamily: 'inherit', overflowY: 'auto', fontWeight: 400 }}
                                />
                            ) : (
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', color: '#f0efed', fontSize: 13, lineHeight: 1.7 }} className="markdown-preview">
                                    {conteudo ? <ReactMarkdown>{conteudo}</ReactMarkdown> : <p style={{ color: '#5A5F68' }}>nenhum conteúdo pra visualizar ainda.</p>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}