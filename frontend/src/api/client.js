/**
 * Cliente HTTP central — todo o resto de api/ passa por aqui.
 *
 * request() já resolve a BASE_URL, injeta Content-Type: application/json,
 * lança ApiError com o status HTTP quando a resposta não é ok (tentando
 * extrair a mensagem do corpo JSON do erro), e trata os dois casos
 * especiais: 204 No Content (retorna null) e corpo vazio em geral
 * (evita JSON.parse('') quebrar).
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body.message || JSON.stringify(body);
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(`Erro ${res.status}: ${detail}`, res.status);
  }

  if (res.status === 204) return null;

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: (path, body) => request(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError };
