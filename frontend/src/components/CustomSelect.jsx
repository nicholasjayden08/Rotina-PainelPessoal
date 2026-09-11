import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dropdown customizado pra substituir o <select> nativo (que sempre abre
 * com o estilo padrão do navegador, quebrando o visual escuro do app).
 *
 * options: [{ value, label }]
 * onChange recebe o value direto (não um evento), pra ficar plug-and-play
 * no lugar de `onChange={(e) => setX(e.target.value)}` -> `onChange={setX}`.
 */
export function CustomSelect({ value, onChange, options, placeholder = 'selecionar', className = '', style }) {
    const [aberto, setAberto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickFora(e) {
            if (ref.current && !ref.current.contains(e.target)) setAberto(false);
        }
        function handleEsc(e) {
            if (e.key === 'Escape') setAberto(false);
        }
        document.addEventListener('mousedown', handleClickFora);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickFora);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const selecionado = options.find((o) => String(o.value) === String(value));

    function escolher(opt) {
        onChange(opt.value);
        setAberto(false);
    }

    return (
        <div className={`custom-select ${className}`} style={style} ref={ref}>
            <button
                type="button"
                className={`custom-select-trigger ${aberto ? 'custom-select-trigger-open' : ''}`}
                onClick={() => setAberto((a) => !a)}
            >
        <span className={`custom-select-value ${!selecionado ? 'custom-select-placeholder' : ''}`}>
          {selecionado ? selecionado.label : placeholder}
        </span>
                <ChevronDown size={14} className="custom-select-chevron" />
            </button>

            {aberto && (
                <div className="custom-select-menu">
                    {options.map((opt) => (
                        <button
                            type="button"
                            key={String(opt.value)}
                            className={`custom-select-option ${String(opt.value) === String(value) ? 'custom-select-option-active' : ''}`}
                            onClick={() => escolher(opt)}
                        >
                            <span>{opt.label}</span>
                            {String(opt.value) === String(value) && <Check size={13} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}