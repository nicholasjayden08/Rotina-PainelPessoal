# rotina — painel pessoal de tarefas e hábitos

App pessoal com backend Java (Spring Boot + H2) e frontend React, pra substituir
o controle manual no Notion: tarefas do dia, hábitos diários e hábitos atômicos
(água, sono, humor, estudos, trabalho) com gráficos de evolução.

## Arquitetura

```
rotina-app/
├── backend/    → API REST em Spring Boot 3 + Java 21 + banco H2 (arquivo local)
└── frontend/   → React + Vite, consome a API
```

Os dados ficam salvos de verdade em disco, em `backend/data/rotina.mv.db`.
Não tem nuvem, não tem login, é 100% local na sua máquina.

---

## 1. Rodando o backend (Spring Boot)

### Pré-requisitos
- Java 21 instalado (você já deve ter, já que usa IntelliJ pra Java)
- IntelliJ IDEA (Community já serve)

### Passo a passo

1. Abra o IntelliJ
2. **File → Open** → selecione a pasta `backend/`
3. O IntelliJ vai reconhecer o `pom.xml` e perguntar se quer importar como projeto Maven — clique em **sim** / **Trust Project**
4. Espere o Maven baixar as dependências (ele faz isso sozinho, só precisa de internet na primeira vez)
5. Localize o arquivo `src/main/java/com/nicholas/rotina/RotinaApplication.java`
6. Clique no ícone de play verde ▶️ ao lado do método `main`, ou clique com botão direito → **Run 'RotinaApplication'**
7. Espere aparecer no console algo como:
   ```
   Started RotinaApplication in X.XXX seconds
   ```
8. Backend rodando em `http://localhost:8080`

### Verificando que funcionou
Abra `http://localhost:8080/api/tarefas` no navegador — deve aparecer `[]`
(lista vazia, já que ainda não criou nenhuma tarefa).

### Console do banco H2 (opcional, pra inspecionar os dados direto)
Acesse `http://localhost:8080/h2-console` com:
- JDBC URL: `jdbc:h2:file:./data/rotina`
- User: `sa`
- Password: *(em branco)*

---

## 2. Rodando o frontend (React)

### Pré-requisitos
- Node.js instalado (versão 18 ou mais recente)

### Passo a passo

1. Abra um terminal na pasta `frontend/`
2. Instale as dependências (só precisa fazer isso uma vez):
   ```bash
   npm install
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra o link que aparecer no terminal, geralmente `http://localhost:5173`

**Importante:** o backend (passo 1) precisa estar rodando ANTES de abrir o
frontend, ou vai aparecer uma tela avisando que não conseguiu conectar.

---

## 3. Acessando pelo celular (mesma rede Wi-Fi)

Por padrão o frontend só aceita conexões de `localhost`. Pra acessar do celular:

1. Descubra o IP local do seu computador na rede (no Windows: `ipconfig`,
   procure por "Endereço IPv4"; no Mac/Linux: `ifconfig` ou `ip addr`)
2. Rode o frontend expondo na rede:
   ```bash
   npm run dev -- --host
   ```
3. No celular (conectado na mesma rede Wi-Fi), abra `http://SEU_IP:5173`
   (ex: `http://192.168.1.42:5173`)
4. **Atenção**: você também precisa liberar o backend para aceitar esse IP.
   Edite `backend/src/main/java/com/nicholas/rotina/config/CorsConfig.java`
   e adicione o IP do seu computador na lista de `allowedOrigins`, algo como
   `"http://192.168.1.42:5173"`, depois reinicie o backend.

---

## 4. Estrutura de dados

### Tarefas do dia
nome, descrição, status (não iniciado / em andamento / concluído),
prioridade (alta/média/baixa), tipo (carreira/pessoal/faculdade),
nível de esforço, prazo.

### Hábitos diários
nome, período (manhã/tarde/noite/durante o dia), meta opcional,
checkbox de feito (resetável com um clique no botão "resetar dia").

### Hábitos atômicos (registro por dia, um por data)
horário que acordou, acordar cedo (sim/não), estudos (sim/não),
trabalho (sim/não), água em litros, humor, qualidade do sono.
Os gráficos de evolução (7/14/30 dias) são calculados a partir disso.

---

## 5. Backup dos seus dados

Todo o seu banco de dados é o arquivo `backend/data/rotina.mv.db`.
Pra fazer backup, basta copiar esse arquivo pra outro lugar (pendrive,
Google Drive, etc). Pra restaurar, é só colocar o arquivo de volta no
mesmo caminho antes de iniciar o backend.

---

## 6. Problemas comuns

**"não consegui falar com o servidor" no navegador**
→ o backend não está rodando. Volte ao passo 1.

**Porta 8080 já em uso**
→ outro programa está usando essa porta. Edite
`backend/src/main/resources/application.properties` e mude
`server.port=8080` pra outra porta (ex: `8081`), e também atualize
`frontend/.env` com a nova porta.

**Erro do Maven ao importar no IntelliJ**
→ verifique sua conexão com a internet (ele precisa baixar as dependências
do Spring Boot na primeira vez) e que você tem o Java 21 configurado como
SDK do projeto (File → Project Structure → Project SDK).
