const WebSocket = require('ws');
const axios = require('axios');
const logger = require('./logger');

/**
 * Helper para gerenciar conexões WebSocket com ElevenLabs Conversational AI
 * 
 * ⚠️ IMPORTANTE: Limites de tamanho de chunks de áudio
 * 
 * A ElevenLabs pode fechar a conexão silenciosamente se chunks de áudio forem muito grandes.
 * 
 * Limites recomendados:
 * - Máximo: ~30KB base64 (~22KB binário) por chunk
 * - Recomendado: 20-40ms de áudio por chunk
 * - Para PCM16 16kHz: 320 samples (20ms) a 640 samples (40ms)
 * 
 * Frontend deve configurar:
 * - createScriptProcessor(1024, 1, 1) ou menor (não usar 4096)
 * - Isso garante chunks de tamanho apropriado
 * 
 * O backend valida e loga warnings se chunks excederem os limites.
 */
class ElevenLabsWebSocketManager {
  constructor(apiKey, agentId) {
    this.apiKey = apiKey;
    this.agentId = agentId;
  }

  /**
   * Obter URL assinada para WebSocket (para agentes privados)
   */
  async getSignedUrl() {
    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${this.agentId}`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );
      
      return response.data?.signed_url || null;
    } catch (error) {
      logger.warn('Erro ao obter signed URL, usando URL pública', {
        error: error.message,
        status: error.response?.status
      });
      return null;
    }
  }

  /**
   * Criar conexão WebSocket com ElevenLabs e fazer bridge com cliente
   * @param {WebSocket} clientWs - WebSocket do cliente (frontend)
   * @param {Object} context - Contexto adicional para enviar ao agente
   */
  bridgeConnection(clientWs, context = {}) {
    let elevenLabsWs = null;
    let isClosed = false;

    let ready = false;                 // só libera áudio após metadata
    let pendingContextText = context?.text || null;

    const closeConnection = () => {
      if (isClosed) return;
      isClosed = true;

      try {
        if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
          elevenLabsWs.close();
        }
      } catch {}
    };

    (async () => {
      try {
        let wsUrl = await this.getSignedUrl();
        if (!wsUrl) wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId}`;

        logger.info('Conectando ao WebSocket ElevenLabs', { agent_id: this.agentId });

        const wsOptions = {};
        // Se NÃO for signed_url (ou seja, não tem token=), manda xi-api-key no header
        if (!wsUrl.includes('token=')) {
          wsOptions.headers = { 'xi-api-key': this.apiKey };
        }

        elevenLabsWs = new WebSocket(wsUrl, wsOptions);

        elevenLabsWs.on('open', () => {
          logger.info('WebSocket ElevenLabs conectado');

          // 1) INIT OBRIGATÓRIO (ok)
          elevenLabsWs.send(JSON.stringify({
            type: 'conversation_initiation_client_data',
            dynamic_variables: {}
          }));

          logger.info('conversation_initiation_client_data enviado');
        });

        elevenLabsWs.on('message', (raw) => {
          let msg;
          try {
            msg = JSON.parse(raw.toString());
          } catch (e) {
            logger.warn('Mensagem não-JSON do ElevenLabs (inesperado)', { error: e.message });
            return;
          }

          // 2) METADATA = "conexão pronta"
          if (msg.type === 'conversation_initiation_metadata') {
            const meta = msg.conversation_initiation_metadata_event || {};
            ready = true;

            logger.info('Recebido conversation_initiation_metadata', {
              conversation_id: meta.conversation_id,
              agent_output_audio_format: meta.agent_output_audio_format,
              user_input_audio_format: meta.user_input_audio_format
            });

            // agora sim pode mandar contexto
            if (pendingContextText) {
              elevenLabsWs.send(JSON.stringify({
                type: 'contextual_update',
                text: pendingContextText
              }));
              logger.info('Contexto enviado via contextual_update', { context_length: pendingContextText.length });
              pendingContextText = null;
            }

            // avisa o front que está pronto
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'connection_ready',
                message: 'Conectado ao agente de voz',
                conversation_id: meta.conversation_id,
                audio_format: meta.agent_output_audio_format // normalmente pcm_16000
              }));
            }
            return;
          }

          // 3) PING -> PONG
          if (msg.type === 'ping' && msg.ping_event?.event_id) {
            elevenLabsWs.send(JSON.stringify({ type: 'pong', event_id: msg.ping_event.event_id }));
            return;
          }

          // 4) ÁUDIO DO AGENTE vem em event separado: type="audio"
          // repassa pro front como JSON mesmo (ele já espera audio_event.audio_base_64)
          if (msg.type === 'audio' && msg.audio_event?.audio_base_64) {
            if (clientWs.readyState === WebSocket.OPEN) clientWs.send(JSON.stringify(msg));
            return;
          }

          // 5) Outros eventos úteis (agent_response, user_transcript, interruption…)
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify(msg));
          }
        });

        elevenLabsWs.on('close', (code, reasonBuf) => {
          const reason = reasonBuf ? reasonBuf.toString() : '';
          logger.info('WebSocket ElevenLabs fechado', { code, reason });

          closeConnection();

          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'connection_closed',
              message: 'Conexão com o agente encerrada',
              code,
              reason
            }));
          }
        });

        elevenLabsWs.on('error', (error) => {
          logger.error('Erro no WebSocket ElevenLabs', { error: error.message });

          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              message: 'Erro na conexão com o agente',
              error: error.message
            }));
          }
          closeConnection();
        });

        // FRONT -> ELEVENLABS
        // ⚠️ LIMITE DE TAMANHO: Chunks muito grandes podem fazer a ElevenLabs fechar a conexão
        // Recomendado: máximo ~30KB base64 (~22KB binário) por chunk
        // Para PCM16 16kHz: 320-640 samples (20-40ms) por chunk
        // Frontend deve usar: createScriptProcessor(1024, 1, 1) ou menor
        const MAX_AUDIO_CHUNK_SIZE_BYTES = 22000; // ~30KB base64 ≈ ~22KB binário
        const MAX_AUDIO_CHUNK_SIZE_BASE64 = 30000; // ~30KB base64

        clientWs.on('message', (data, isBinary) => {
          try {
            if (!elevenLabsWs || elevenLabsWs.readyState !== WebSocket.OPEN) return;

            // Áudio binário vindo do front (PCM16)
            if (isBinary || Buffer.isBuffer(data)) {
              if (!ready) {
                logger.warn('Áudio recebido antes do metadata (ready=false). Ignorando chunk.');
                return;
              }

              const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
              const bufSize = buf.length;

              // ⚠️ VALIDAÇÃO: Chunks muito grandes podem quebrar a conexão
              if (bufSize > MAX_AUDIO_CHUNK_SIZE_BYTES) {
                logger.warn('Chunk de áudio muito grande recebido - pode causar fechamento da conexão', {
                  size_bytes: bufSize,
                  max_recommended: MAX_AUDIO_CHUNK_SIZE_BYTES,
                  suggestion: 'Frontend deve usar createScriptProcessor(1024, 1, 1) ou menor para chunks de 20-40ms'
                });
                // Ainda envia, mas loga o warning para o desenvolvedor ajustar o frontend
              }

              const base64Audio = buf.toString('base64');
              const base64Size = base64Audio.length;

              // Validação adicional do tamanho base64
              if (base64Size > MAX_AUDIO_CHUNK_SIZE_BASE64) {
                logger.warn('Chunk base64 muito grande - risco de conexão fechar', {
                  size_base64: base64Size,
                  max_recommended: MAX_AUDIO_CHUNK_SIZE_BASE64,
                  binary_size: bufSize
                });
              }

              // ✅ FORMATO CORRETO (SEM type)
              elevenLabsWs.send(JSON.stringify({ user_audio_chunk: base64Audio }));
              
              // Log periódico para debug (apenas chunks normais, não spamma)
              if (bufSize > 1000 && bufSize <= MAX_AUDIO_CHUNK_SIZE_BYTES) {
                logger.debug('Chunk de áudio enviado', {
                  size_bytes: bufSize,
                  size_base64: base64Size,
                  ready: true
                });
              }
              return;
            }

            // Texto JSON do front
            const text = data.toString();
            const parsed = JSON.parse(text);

            // Se o front mandar { user_audio_chunk: "..." }, repassa no formato correto
            if (parsed?.user_audio_chunk) {
              if (!ready) return;
              
              // Validação de tamanho se vier como base64
              const base64Audio = parsed.user_audio_chunk;
              if (typeof base64Audio === 'string' && base64Audio.length > MAX_AUDIO_CHUNK_SIZE_BASE64) {
                logger.warn('Chunk base64 muito grande recebido via JSON', {
                  size_base64: base64Audio.length,
                  max_recommended: MAX_AUDIO_CHUNK_SIZE_BASE64
                });
              }
              
              elevenLabsWs.send(JSON.stringify({ user_audio_chunk: base64Audio }));
              return;
            }

            // Se mandar user_message / contextual_update etc, repassa como está
            elevenLabsWs.send(JSON.stringify(parsed));
          } catch (e) {
            logger.warn('Erro ao processar msg do cliente', { error: e.message });
          }
        });

        clientWs.on('close', () => {
          logger.info('Cliente desconectado');
          closeConnection();
        });

        clientWs.on('error', (error) => {
          logger.error('Erro no WebSocket do cliente', { error: error.message });
          closeConnection();
        });

      } catch (error) {
        logger.error('Erro ao criar bridge WebSocket', { error: error.message, stack: error.stack });

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Erro ao conectar com o agente',
            error: error.message
          }));
          clientWs.close();
        }
      }
    })();
  }
}

module.exports = ElevenLabsWebSocketManager;

