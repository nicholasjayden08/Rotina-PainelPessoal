import { ServerOff } from 'lucide-react';
import { COLORS } from '../constants';

export function ApiOfflineScreen() {
  return (
    <div className="api-offline-screen">
      <ServerOff size={36} color={COLORS.danger} strokeWidth={1.5} />
      <h1>não consegui falar com o servidor</h1>
      <p>
        O backend Spring Boot não está rodando em <code>http://localhost:8080</code>.
      </p>
      <div className="api-offline-steps">
        <p>pra resolver:</p>
        <ol>
          <li>abre o projeto <code>backend/</code> no IntelliJ</li>
          <li>roda a classe <code>RotinaApplication.java</code> (botão play verde)</li>
          <li>espera aparecer <code>Started RotinaApplication</code> no console</li>
          <li>recarrega essa página</li>
        </ol>
      </div>
      <button onClick={() => window.location.reload()} className="retry-btn">
        tentar de novo
      </button>
    </div>
  );
}
