const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');

class UsuariosController extends BaseController {
  /**
   * Buscar usuários por email e id_cliente
   * GET /api/usuarios/buscar?email=valor&id_cliente=valor
   */
  async buscarUsuariosPorEmail(req, res) {
    const client = await pool.connect();
    
    try {
      const { email, id_cliente } = req.query;

      logger.info('Iniciando busca de usuários por email e cliente', {
        email,
        id_cliente
      });

      // Validações básicas
      if (!email || email.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'MISSING_EMAIL',
          message: 'Email é obrigatório'
        });
      }

      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Query para buscar usuários por email (LIKE) e id_cliente
      const usuariosQuery = `
        SELECT 
          id,
          nome,
          email
        FROM usuarios
        WHERE email ILIKE $1 AND id_cliente = $2
        ORDER BY nome ASC
      `;

      const emailPattern = `${email.trim()}%`;
      const result = await client.query(usuariosQuery, [emailPattern, id_cliente]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum usuário encontrado para os critérios informados',
          data: {
            email: email.trim(),
            id_cliente: parseInt(id_cliente),
            usuarios: []
          }
        });
      }

      // Processar os resultados
      const usuarios = result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        email: row.email
      }));

      logger.info('Usuários buscados com sucesso', {
        email: email.trim(),
        id_cliente: parseInt(id_cliente),
        usuarios_count: usuarios.length
      });

      return res.status(200).json({
        success: true,
        message: 'Usuários buscados com sucesso',
        data: {
          email: email.trim(),
          id_cliente: parseInt(id_cliente),
          usuarios
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar usuários por email e cliente', { error: error.message, stack: error.stack });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Buscar usuários por gestor
   * GET /api/usuarios/gestor/:id_gestor
   */
  async buscarUsuariosPorGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_gestor } = req.params;

      logger.info('Iniciando busca de usuários por gestor', {
        id_gestor
      });

      // Validações básicas
      if (!id_gestor || isNaN(id_gestor)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_GESTOR_ID',
          message: 'ID do gestor é obrigatório e deve ser um número válido'
        });
      }

      // Query simplificada para buscar todos os usuários que têm o gestor especificado
      const usuariosQuery = `
        SELECT 
          id,
          nome,
          cargo,
          email,
          idade,
          data_nascimento,
          id_cliente,
          id_departamento,
          perfil_acesso,
          id_gestor
        FROM usuarios
        WHERE id_gestor = $1
        ORDER BY nome ASC
      `;

      const result = await client.query(usuariosQuery, [id_gestor]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum usuário encontrado para este gestor',
          data: {
            gestor_id: parseInt(id_gestor),
            usuarios: []
          }
        });
      }

      // Processar os resultados
      const usuarios = result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        cargo: row.cargo,
        email: row.email,
        idade: row.idade,
        data_nascimento: row.data_nascimento,
        id_cliente: row.id_cliente,
        id_departamento: row.id_departamento,
        departamento_nome: null, // Será implementado quando as tabelas relacionadas estiverem disponíveis
        perfil_acesso: row.perfil_acesso,
        perfil_acesso_nome: null // Será implementado quando as tabelas relacionadas estiverem disponíveis
      }));

      logger.info('Usuários buscados com sucesso', {
        gestor_id: id_gestor,
        usuarios_count: usuarios.length
      });

      return res.status(200).json({
        success: true,
        message: 'Usuários buscados com sucesso',
        data: {
          gestor_id: parseInt(id_gestor),
          usuarios
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar usuários por gestor', { error: error.message, stack: error.stack });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }

  /**
   * Buscar dashboard do usuário
   * GET /api/usuarios/dashboard/:id_usuario
   */
  async buscarDashboardUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario } = req.params;

      logger.info('Iniciando busca de dashboard do usuário', {
        id_usuario
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      // 1. Buscar pontuação da árvore da vida
      const arvoreQuery = `
        SELECT pontuacao_geral
        FROM arvore_da_vida
        WHERE id_usuario = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const arvoreResult = await client.query(arvoreQuery, [id_usuario]);
      const pontuacaoGeral = arvoreResult.rows.length > 0 ? arvoreResult.rows[0].pontuacao_geral : null;
      const arvoreVida = pontuacaoGeral ? `${pontuacaoGeral}/10` : "0/10";

      // 2. Buscar contagem de metas concluídas e pendentes
      const metasQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'Concluida') as metas_concluidas,
          COUNT(*) FILTER (WHERE status != 'Concluida') as metas_pendentes,
          COUNT(*) as total_metas
        FROM metas_pdi
        WHERE id_usuario = $1
      `;
      const metasResult = await client.query(metasQuery, [id_usuario]);
      const metasStats = metasResult.rows[0];
      const metasConcluidas = parseInt(metasStats.metas_concluidas) || 0;
      const metasPendentes = parseInt(metasStats.metas_pendentes) || 0;

      // 3. Buscar minhas metas com porcentagem de conclusão
      const minhasMetasQuery = `
        SELECT 
          m.id,
          m.titulo,
          m.prazo,
          COUNT(a.id) as total_atividades,
          COUNT(a.id) FILTER (WHERE a.status_atividade = 'concluida') as atividades_concluidas
        FROM metas_pdi m
        LEFT JOIN atividades_pdi a ON m.id = a.id_meta_pdi
        WHERE m.id_usuario = $1
        GROUP BY m.id, m.titulo, m.prazo
        ORDER BY m.created_at DESC
      `;
      const minhasMetasResult = await client.query(minhasMetasQuery, [id_usuario]);
      
      const minhasMetas = minhasMetasResult.rows.map(row => {
        const totalAtividades = parseInt(row.total_atividades) || 0;
        const atividadesConcluidas = parseInt(row.atividades_concluidas) || 0;
        const porcentagemConclusao = totalAtividades > 0 ? 
          Math.round((atividadesConcluidas / totalAtividades) * 100) : 0;

        return {
          id: row.id,
          titulo_meta: row.titulo,
          prazo: row.prazo,
          porcentagem_conclusao: porcentagemConclusao
        };
      });

      // 4. Buscar análise SWOT
      // Nota: Assumindo que a tabela textos_swot tem campos id_categoria_swot e id_usuario
      // Caso a estrutura seja diferente, esta query precisará ser ajustada
      const swotQuery = `
        SELECT 
          cs.categoria,
          ts.texto
        FROM textos_swot ts
        JOIN analise_swot ans ON ans.id_texto_swot = ts.id
        LEFT JOIN categoria_swot cs ON ans.categoria_swot = cs.id
        WHERE ans.id_usuario = $1
        ORDER BY cs.categoria, ts.created_at
      `;
      const swotResult = await client.query(swotQuery, [id_usuario]);

      // Processar dados SWOT
      const swotMap = {
        'Fortalezas': [],
        'Fraquezas': [],
        'Oportunidades': [],
        'Ameaças': []
      };

      swotResult.rows.forEach(row => {
        if (row.categoria && row.texto && swotMap[row.categoria]) {
          swotMap[row.categoria].push(row.texto);
        }
      });

      const analiseSwot = {
        fortalezas: swotMap['Fortalezas'] || [],
        fraquezas: swotMap['Fraquezas'] || [],
        oportunidades: swotMap['Oportunidades'] || [],
        ameacas: swotMap['Ameaças'] || []
      };

      logger.info('Dashboard do usuário buscado com sucesso', {
        id_usuario,
        arvore_vida: arvoreVida,
        metas_concluidas: metasConcluidas,
        metas_pendentes: metasPendentes,
        total_minhas_metas: minhasMetas.length,
        swot_items: swotResult.rows.length
      });

      return res.status(200).json({
        success: true,
        message: 'Dashboard do usuário buscado com sucesso',
        data: {
          usuario_id: parseInt(id_usuario),
          arvore_da_vida: arvoreVida,
          metas_concluidas: metasConcluidas,
          metas_pendentes: metasPendentes,
          minhas_metas: minhasMetas,
          analise_swot: analiseSwot
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar dashboard do usuário', { 
        error: error.message, 
        stack: error.stack,
        usuario_id: req.params.id_usuario
      });
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      });
    } finally {
      client.release();
    }
  }
}

module.exports = new UsuariosController();
