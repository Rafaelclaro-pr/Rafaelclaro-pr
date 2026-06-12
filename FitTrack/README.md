# FitTrack

App de monitorização de treinos de ginásio e nutrição diária, com calculadora de balanço calórico personalizada.

## Stack

- **Backend:** Python + FastAPI
- **Base de dados:** SQLite + SQLAlchemy ORM
- **Autenticação:** JWT (python-jose) + bcrypt
- **Frontend:** HTML + CSS + JavaScript puro
- **Gráficos:** Chart.js

## Como executar

### 1. Backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload
```

API disponível em `http://localhost:8000`  
Documentação interativa: `http://localhost:8000/docs`

### 2. Frontend

Abre o ficheiro `frontend/index.html` diretamente no browser.

> Para produção usa um servidor estático (ex: `npx serve frontend`).

## Variáveis de Ambiente

Cria/edita o ficheiro `.env` na raiz:

```env
SECRET_KEY=muda-esta-chave-em-producao
DATABASE_URL=sqlite:///./fittrack.db
```

## Funcionalidades

- Registo e login com JWT (7 dias de validade)
- Calculadora TDEE (Mifflin-St Jeor)
- Meta calórica personalizada por objetivo
- Registo de treinos com exercícios e séries
- Diário alimentar com macronutrientes
- Dashboard com balanço calórico e projeção semanal
- Gráfico de macros (Chart.js)
- Design dark mode responsivo

## Deploy

- **Backend:** Railway — adiciona `web: uvicorn main:app --host 0.0.0.0 --port $PORT` ao `Procfile`
- **Frontend:** Vercel — aponta para a pasta `frontend/`, atualiza `API_BASE` em `js/api.js`
