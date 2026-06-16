# Guia de Configuração - Cloudflare Workers Proxy

Para colocar a sua página da Copa do Mundo FIFA 2026 online no **GitHub Pages** e fazer a atualização de dados funcionar (sem erros de CORS e sem expor a sua chave secreta da API), siga o passo a passo abaixo para criar um **Cloudflare Worker**.

---

## 🚀 Passo a Passo no Cloudflare Dashboard

### 1. Criar o Worker
1. Acesse o painel do Cloudflare em [dash.cloudflare.com](https://dash.cloudflare.com/) e faça login.
2. No menu lateral esquerdo, clique em **Workers & Pages**.
3. Clique no botão **Create Application** (ou **Criar aplicação**).
4. Na tela que se abre ("Create a Worker" / "Criar um Worker"), clique na opção **Start with Hello World!** (ou **Iniciar com Hello World!**).
5. Defina um nome para o seu Worker (por exemplo: `copa2026-proxy`) no campo de texto e clique em **Deploy** (ou **Implantar**).

### 2. Adicionar o Código do Proxy
1. Após implantar, clique em **Edit Code** (ou **Editar código** / **Quick Edit**).
2. Apague todo o código de exemplo existente e cole o seguinte script:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Resposta para a requisição de pré-vôo do CORS (CORS Preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
      }
    })
  }

  // Encaminha apenas requisições GET para a API do football-data
  if (request.method === 'GET') {
    // Monta a URL final com o endpoint oficial da API
    const targetUrl = 'https://api.football-data.org/v4' + url.pathname
    
    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': 'b8ccbe5173d34171823e6245887eb40e', // Injeta sua API key secreta com segurança
          'Accept': 'application/json',
        }
      })

      // Repassa a resposta injetando cabeçalhos CORS liberados
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Access-Control-Allow-Origin', '*')
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
}
```

3. Clique em **Save and Deploy** (ou **Salvar e implantar**) no canto superior direito para aplicar o código.

### 3. Pegar a URL do seu Worker
1. Volte para a página inicial do Worker no painel do Cloudflare.
2. Você verá a **URL pública** gerada abaixo de **Routes** (exemplo: `https://copa2026-proxy.seu-subdominio.workers.dev`).
3. Copie essa URL.

---

## 🛠️ Configurar no seu arquivo `copa2026.html`

Abra o arquivo [copa2026.html](file:///c:/Projects/diogo/copa/copa2026.html) e, na seção de **CONFIG** no início da tag `<script>`, edite a constante `PROXY_PROD` inserindo a URL copiada do Worker:

```javascript
const PROXY_PROD  = 'https://copa2026-proxy.seu-subdominio.workers.dev';
```

### 🧠 Como funciona depois de configurado:
- **Localmente**: O código detecta se você está em `localhost` ou `127.0.0.1` e usa o proxy python local (`http://localhost:8765`).
- **No GitHub Pages**: O código detecta o domínio externo e usa automaticamente a URL do seu Cloudflare Worker. Sua API key estará segura e escondida no lado do servidor do Cloudflare, e você não terá erros de CORS!
