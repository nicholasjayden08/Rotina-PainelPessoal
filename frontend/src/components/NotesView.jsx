import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Trash2, FileText, Eye, Edit3, Columns2, Search, Pin, Bold, Italic, Heading2, List, Link2, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LoadingBlock, ErrorBlock, EmptyHint } from './Shared';

function fmtDataNota(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const FERRAMENTAS_MARKDOWN = [
    { icon: Bold, title: 'negrito', prefixo: '**', sufixo: '**', placeholder: 'texto em negrito' },
    { icon: Italic, title: 'itálico', prefixo: '*', sufixo: '*', placeholder: 'texto em itálico' },
    { icon: Heading2, title: 'título', prefixo: '## ', sufixo: '', placeholder: 'título', linha: true },
    { icon: List, title: 'lista', prefixo: '- ', sufixo: '', placeholder: 'item da lista', linha: true },
    { icon: Link2, title: 'link', prefixo: '[', sufixo: '](url)', placeholder: 'texto do link' },
    { icon: Code, title: 'código', prefixo: '`', sufixo: '`', placeholder: 'código' },
];

export function NotesView({ notas, loading, error, criar, atualizar, excluir, fixar }) {
    const [idSelecionado, setIdSelecionado] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [modo, setModo] = useState('editar');
    const [salvando, setSalvando] = useState(false);
    const [busca, setBusca] = useState('');
    const saveTimeout = useRef(null);
    const ultimoSalvo = useRef({ titulo: '', conteudo: '' });
    const textareaRef = useRef(null);

    const notaSelecionada = notas.find((n) => n.id === idSelecionado) || null;

    const notasFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return notas;
        return notas.filter((n) =>
            (n.titulo || '').toLowerCase().includes(termo) ||
            (n.conteudo || '').toLowerCase().includes(termo)
        );
    }, [notas, busca]);

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

    function aplicarFormatacao(ferramenta) {
        const el = textareaRef.current;
        if (!el) return;
        const { selectionStart, selectionEnd } = el;
        const selecionado = conteudo.slice(selectionStart, selectionEnd);
        let novoConteudo, novaSelecaoInicio, novaSelecaoFim;

        if (ferramenta.linha) {
            const inicioLinha = conteudo.lastIndexOf('\n', selectionStart - 1) + 1;
            novoConteudo = conteudo.slice(0, inicioLinha) + ferramenta.prefixo + conteudo.slice(inicioLinha);
            novaSelecaoInicio = selectionStart + ferramenta.prefixo.length;
            novaSelecaoFim = selectionEnd + ferramenta.prefixo.length;
        } else {
            const texto = selecionado || ferramenta.placeholder;
            novoConteudo = conteudo.slice(0, selectionStart) + ferramenta.prefixo + texto + ferramenta.sufixo + conteudo.slice(selectionEnd);
            novaSelecaoInicio = selectionStart + ferramenta.prefixo.length;
            novaSelecaoFim = novaSelecaoInicio + texto.length;
        }

        setConteudo(novoConteudo);
        salvarComDebounce(titulo, novoConteudo);

        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(novaSelecaoInicio, novaSelecaoFim);
        });
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

    async function handleFixar(id, e) {
        e.stopPropagation();
        await fixar(id);
    }

    return (
        <div className="view-wrap fade-in" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="notes-layout">

                {/* Lista de notas */}
                <div className="notes-sidebar">
                    <div className="notes-sidebar-header">
                        <div>
                            <p className="eyebrow">routinely</p>
                            <h1 className="page-title">anotações</h1>
                        </div>
                        <button className="icon-btn" onClick={handleNova} title="nova nota"><Plus size={16} /></button>
                    </div>

                    <div className="notes-search-wrap">
                        <Search size={13} className="notes-search-icon" />
                        <input
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="buscar notas..."
                            className="notes-search-input"
                        />
                    </div>

                    <div className="notes-list">
                        <ErrorBlock text={error} />
                        {loading ? (
                            <LoadingBlock text="carregando notas..." />
                        ) : notas.length === 0 ? (
                            <EmptyHint text="nenhuma nota ainda. crie a primeira!" />
                        ) : notasFiltradas.length === 0 ? (
                            <EmptyHint text="nenhuma nota encontrada." />
                        ) : (
                            notasFiltradas.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => setIdSelecionado(n.id)}
                                    className={`notes-list-item ${idSelecionado === n.id ? 'notes-list-item-active' : ''}`}
                                >
                                    <FileText size={13} className="notes-list-item-icon" />
                                    <div className="notes-list-item-body">
                                        <p className={`notes-list-item-title ${idSelecionado === n.id ? 'notes-list-item-title-active' : ''}`}>
                                            {n.titulo || 'sem título'}
                                        </p>
                                        <p className="notes-list-item-meta">{fmtDataNota(n.dataAtualizacao)}</p>
                                    </div>
                                    <button
                                        className={`icon-btn notes-list-item-pin ${n.fixado ? 'notes-list-item-pin-active' : ''}`}
                                        onClick={(e) => handleFixar(n.id, e)}
                                        title={n.fixado ? 'desafixar' : 'fixar'}
                                    >
                                        <Pin size={12} />
                                    </button>
                                    <button className="icon-btn notes-list-item-delete" onClick={(e) => handleExcluir(n.id, e)}><Trash2 size={12} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Editor */}
                <div className="notes-editor">
                    {!notaSelecionada ? (
                        <div className="notes-editor-empty">
                            <FileText size={36} strokeWidth={1.25} />
                            <p>selecione uma nota ou crie uma nova</p>
                            <button className="primary-btn" onClick={handleNova}><Plus size={14} /> nova nota</button>
                        </div>
                    ) : (
                        <>
                            <div className="notes-editor-header">
                                <input
                                    value={titulo}
                                    onChange={handleTituloChange}
                                    placeholder="título da nota"
                                    className="notes-title-input"
                                />
                                <div className="notes-editor-actions">
                                    {salvando && <span className="notes-save-status">salvando...</span>}
                                    {!salvando && <span className="notes-save-status notes-save-status-saved">salvo</span>}
                                    <div className="notes-mode-toggle">
                                        <button
                                            className={`notes-mode-btn ${modo === 'editar' ? 'notes-mode-btn-active' : ''}`}
                                            onClick={() => setModo('editar')}
                                            title="editar"
                                        ><Edit3 size={13} /></button>
                                        <button
                                            className={`notes-mode-btn ${modo === 'split' ? 'notes-mode-btn-active' : ''}`}
                                            onClick={() => setModo('split')}
                                            title="split"
                                        ><Columns2 size={13} /></button>
                                        <button
                                            className={`notes-mode-btn ${modo === 'preview' ? 'notes-mode-btn-active' : ''}`}
                                            onClick={() => setModo('preview')}
                                            title="preview"
                                        ><Eye size={13} /></button>
                                    </div>
                                </div>
                            </div>

                            {modo !== 'preview' && (
                                <div className="notes-toolbar">
                                    {FERRAMENTAS_MARKDOWN.map((f) => (
                                        <button
                                            key={f.title}
                                            className="notes-toolbar-btn"
                                            title={f.title}
                                            onClick={() => aplicarFormatacao(f)}
                                        >
                                            <f.icon size={14} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className={`notes-editor-body ${modo === 'split' ? 'notes-editor-body-split' : ''}`}>
                                {modo !== 'preview' && (
                                    <textarea
                                        ref={textareaRef}
                                        value={conteudo}
                                        onChange={handleConteudoChange}
                                        placeholder={`escreva sua nota em markdown...\n\n# título\n**negrito**, *itálico*\n- item de lista`}
                                        className="notes-textarea"
                                    />
                                )}
                                {modo !== 'editar' && (
                                    <div className="notes-preview-body markdown-preview">
                                        {conteudo ? <ReactMarkdown>{conteudo}</ReactMarkdown> : <p className="notes-preview-empty">nenhum conteúdo pra visualizar ainda.</p>}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}