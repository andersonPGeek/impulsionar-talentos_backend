const { BaseController } = require('./index');
const { pool } = require('../utils/supabase');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

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

  /**
   * Criar novo usuário
   * POST /api/usuarios/cliente/:id_cliente
   */
  async criarUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;
      const {
        nome,
        cargo,
        perfil_acesso,
        idade,
        data_nascimento,
        email,
        senha,
        id_gestor,
        id_departamento
      } = req.body;

      logger.info('Iniciando criação de usuário', {
        id_cliente,
        nome,
        email
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      if (!nome || nome.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_NAME',
          message: 'Nome é obrigatório'
        });
      }

      if (!email || email.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Email é obrigatório'
        });
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_EMAIL_FORMAT',
          message: 'Formato de email inválido'
        });
      }

      if (!senha || senha.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PASSWORD',
          message: 'Senha é obrigatória'
        });
      }

      // Validar IDs opcionais se fornecidos
      if (cargo && isNaN(cargo)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CARGO_ID',
          message: 'ID do cargo deve ser um número válido'
        });
      }

      if (perfil_acesso && isNaN(perfil_acesso)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PERFIL_ACESSO_ID',
          message: 'ID do perfil de acesso deve ser um número válido'
        });
      }

      if (id_gestor && isNaN(id_gestor)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_GESTOR_ID',
          message: 'ID do gestor deve ser um número válido'
        });
      }

      if (id_departamento && isNaN(id_departamento)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_DEPARTAMENTO_ID',
          message: 'ID do departamento deve ser um número válido'
        });
      }

      if (idade && (isNaN(idade) || idade < 0 || idade > 120)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_AGE',
          message: 'Idade deve ser um número válido entre 0 e 120'
        });
      }

      // Verificar se já existe usuário com mesmo email
      const existeEmailQuery = `
        SELECT id FROM usuarios
        WHERE LOWER(email) = LOWER($1)
      `;
      const existeEmailResult = await client.query(existeEmailQuery, [email.trim()]);

      if (existeEmailResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Já existe um usuário com este email'
        });
      }

      // Validar se o cliente existe
      const clienteExisteQuery = `
        SELECT id FROM clientes WHERE id = $1
      `;
      const clienteExisteResult = await client.query(clienteExisteQuery, [id_cliente]);

      if (clienteExisteResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'CLIENT_NOT_FOUND',
          message: 'Cliente não encontrado'
        });
      }

      // Validar se o cargo existe e pertence ao cliente (se fornecido)
      if (cargo) {
        const cargoExisteQuery = `
          SELECT id FROM cargo WHERE id = $1 AND id_cliente = $2
        `;
        const cargoExisteResult = await client.query(cargoExisteQuery, [cargo, id_cliente]);

        if (cargoExisteResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'CARGO_NOT_FOUND',
            message: 'Cargo não encontrado para este cliente'
          });
        }
      }

      // Validar se o departamento existe e pertence ao cliente (se fornecido)
      if (id_departamento) {
        const departamentoExisteQuery = `
          SELECT id FROM departamento WHERE id = $1 AND id_cliente = $2
        `;
        const departamentoExisteResult = await client.query(departamentoExisteQuery, [id_departamento, id_cliente]);

        if (departamentoExisteResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'DEPARTAMENTO_NOT_FOUND',
            message: 'Departamento não encontrado para este cliente'
          });
        }
      }

      // Validar se o perfil de acesso existe (se fornecido)
      if (perfil_acesso) {
        const perfilExisteQuery = `
          SELECT id FROM perfil_usuario WHERE id = $1
        `;
        const perfilExisteResult = await client.query(perfilExisteQuery, [perfil_acesso]);

        if (perfilExisteResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'PERFIL_NOT_FOUND',
            message: 'Perfil de acesso não encontrado'
          });
        }
      }

      // Validar se o gestor existe e pertence ao mesmo cliente (se fornecido)
      if (id_gestor) {
        const gestorExisteQuery = `
          SELECT id FROM usuarios WHERE id = $1 AND id_cliente = $2
        `;
        const gestorExisteResult = await client.query(gestorExisteQuery, [id_gestor, id_cliente]);

        if (gestorExisteResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'GESTOR_NOT_FOUND',
            message: 'Gestor não encontrado para este cliente'
          });
        }
      }

      // Criar usuário
      const criarUsuarioQuery = `
        INSERT INTO usuarios (
          id_cliente,
          nome,
          cargo,
          perfil_acesso,
          idade,
          data_nascimento,
          email,
          senha,
          id_gestor,
          id_departamento
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, nome, email, created_at
      `;

      // Criptografar senha com bcrypt (salt rounds = 10)
      const hashedPassword = await bcrypt.hash(senha.trim(), 10);

      const valores = [
        id_cliente,
        nome.trim(),
        cargo || null,
        perfil_acesso || null,
        idade || null,
        data_nascimento || null,
        email.trim().toLowerCase(),
        hashedPassword, // Em produção, deve ser hash da senha
        id_gestor || null,
        id_departamento || null
      ];

      const criarResult = await client.query(criarUsuarioQuery, valores);
      const novoUsuario = criarResult.rows[0];

      logger.info('Usuário criado com sucesso', {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cliente_id: id_cliente
      });

      return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          id_cliente: parseInt(id_cliente),
          created_at: novoUsuario.created_at
        }
      });

    } catch (error) {
      logger.error('Erro ao criar usuário', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente,
        email: req.body.email
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

  /**
   * Buscar todos os usuários por cliente
   * GET /api/usuarios/cliente/:id_cliente
   */
  async buscarUsuariosPorCliente(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de usuários por cliente', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar usuários do cliente com informações relacionadas
      const usuariosQuery = `
        SELECT 
          u.id,
          u.nome,
          u.email,
          u.idade,
          u.data_nascimento,
          u.created_at,
          u.id_cliente,
          u.id_departamento,
          u.id_gestor,
          u.perfil_acesso,
          u.cargo,
          c.nome_cargo,
          d.titulo_departamento as departamento_nome,
          p.perfil as perfil_acesso_nome,
          g.nome as gestor_nome
        FROM usuarios u
        LEFT JOIN cargo c ON u.cargo = c.id
        LEFT JOIN departamento d ON u.id_departamento = d.id
        LEFT JOIN perfil_usuario p ON u.perfil_acesso = p.id
        LEFT JOIN usuarios g ON u.id_gestor = g.id
        WHERE u.id_cliente = $1 AND u.perfil_acesso = 2
        ORDER BY u.nome ASC
      `;

      const result = await client.query(usuariosQuery, [id_cliente]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum usuário encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            usuarios: []
          }
        });
      }

      // Processar os resultados
      const usuarios = result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        email: row.email,
        idade: row.idade,
        data_nascimento: row.data_nascimento,
        id_cliente: row.id_cliente,
        id_departamento: row.id_departamento,
        departamento_nome: row.departamento_nome,
        id_gestor: row.id_gestor,
        gestor_nome: row.gestor_nome,
        perfil_acesso: row.perfil_acesso,
        perfil_acesso_nome: row.perfil_acesso_nome,
        cargo: row.cargo,
        nome_cargo: row.nome_cargo,
        created_at: row.created_at
      }));

      logger.info('Usuários buscados com sucesso', {
        cliente_id: id_cliente,
        usuarios_count: usuarios.length
      });

      return res.status(200).json({
        success: true,
        message: 'Usuários buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          usuarios
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar usuários por cliente', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente
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

  /**
   * Buscar usuários sem gestor
   * GET /api/usuarios/sem-gestor/:id_cliente
   */
  async buscarUsuariosSemGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de usuários sem gestor', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar usuários sem gestor (id_gestor is null)
      const usuariosQuery = `
        SELECT 
          u.id,
          u.nome as nome_usuario,
          g.nome as nome_gestor,
          d.titulo_departamento as nome_departamento
        FROM usuarios u
        LEFT JOIN usuarios g ON u.id_gestor = g.id
        LEFT JOIN departamento d ON u.id_departamento = d.id
        WHERE u.id_cliente = $1 AND u.id_gestor IS NULL
        ORDER BY u.nome ASC
      `;

      const result = await client.query(usuariosQuery, [id_cliente]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum usuário sem gestor encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            usuarios: []
          }
        });
      }

      // Processar os resultados
      const usuarios = result.rows.map(row => ({
        id: row.id,
        nome_usuario: row.nome_usuario,
        nome_gestor: row.nome_gestor, // Sempre será null neste caso
        nome_departamento: row.nome_departamento
      }));

      logger.info('Usuários sem gestor buscados com sucesso', {
        cliente_id: id_cliente,
        usuarios_count: usuarios.length
      });

      return res.status(200).json({
        success: true,
        message: 'Usuários sem gestor buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          usuarios
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar usuários sem gestor', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente
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

  /**
   * Buscar usuários com gestor
   * GET /api/usuarios/com-gestor/:id_cliente
   */
  async buscarUsuariosComGestor(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de usuários com gestor', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar usuários com gestor (id_gestor is not null)
      const usuariosQuery = `
        SELECT 
          u.id,
          u.nome as nome_usuario,
          g.nome as nome_gestor,
          d.titulo_departamento as nome_departamento
        FROM usuarios u
        LEFT JOIN usuarios g ON u.id_gestor = g.id
        LEFT JOIN departamento d ON u.id_departamento = d.id
        WHERE u.id_cliente = $1 AND u.id_gestor IS NOT NULL
        ORDER BY u.nome ASC
      `;

      const result = await client.query(usuariosQuery, [id_cliente]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum usuário com gestor encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            usuarios: []
          }
        });
      }

      // Processar os resultados
      const usuarios = result.rows.map(row => ({
        id: row.id,
        nome_usuario: row.nome_usuario,
        nome_gestor: row.nome_gestor,
        nome_departamento: row.nome_departamento
      }));

      logger.info('Usuários com gestor buscados com sucesso', {
        cliente_id: id_cliente,
        usuarios_count: usuarios.length
      });

      return res.status(200).json({
        success: true,
        message: 'Usuários com gestor buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          usuarios
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar usuários com gestor', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente
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

  /**
   * Remover gestor de usuário
   * PUT /api/usuarios/:id_usuario/remover-gestor/:id_usuario_gestor
   */
  async removerGestorUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario, id_usuario_gestor } = req.params;

      logger.info('Iniciando remoção de gestor do usuário', {
        id_usuario,
        id_usuario_gestor
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      if (!id_usuario_gestor || isNaN(id_usuario_gestor)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_GESTOR_ID',
          message: 'ID do gestor é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o usuário existe e tem o gestor especificado
      const verificarUsuarioQuery = `
        SELECT id, nome, id_gestor
        FROM usuarios
        WHERE id = $1 AND id_gestor = $2
      `;
      const verificarResult = await client.query(verificarUsuarioQuery, [id_usuario, id_usuario_gestor]);

      if (verificarResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'USER_GESTOR_NOT_FOUND',
          message: 'Usuário não encontrado ou não possui o gestor especificado'
        });
      }

      // Remover gestor (definir id_gestor como NULL)
      const removerGestorQuery = `
        UPDATE usuarios 
        SET id_gestor = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND id_gestor = $2
        RETURNING id, nome, id_gestor
      `;

      const updateResult = await client.query(removerGestorQuery, [id_usuario, id_usuario_gestor]);
      const usuarioAtualizado = updateResult.rows[0];

      logger.info('Gestor removido do usuário com sucesso', {
        usuario_id: usuarioAtualizado.id,
        usuario_nome: usuarioAtualizado.nome,
        gestor_removido_id: id_usuario_gestor
      });

      return res.status(200).json({
        success: true,
        message: 'Gestor removido do usuário com sucesso',
        data: {
          usuario_id: usuarioAtualizado.id,
          nome_usuario: usuarioAtualizado.nome,
          id_gestor: usuarioAtualizado.id_gestor // Será null
        }
      });

    } catch (error) {
      logger.error('Erro ao remover gestor do usuário', { 
        error: error.message, 
        stack: error.stack,
        usuario_id: req.params.id_usuario,
        gestor_id: req.params.id_usuario_gestor
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

  /**
   * Atribuir gestor a usuário
   * PUT /api/usuarios/:id_usuario/atribuir-gestor/:id_usuario_gestor
   */
  async atribuirGestorUsuario(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_usuario, id_usuario_gestor } = req.params;

      logger.info('Iniciando atribuição de gestor ao usuário', {
        id_usuario,
        id_usuario_gestor
      });

      // Validações básicas
      if (!id_usuario || isNaN(id_usuario)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_USER_ID',
          message: 'ID do usuário é obrigatório e deve ser um número válido'
        });
      }

      if (!id_usuario_gestor || isNaN(id_usuario_gestor)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_GESTOR_ID',
          message: 'ID do gestor é obrigatório e deve ser um número válido'
        });
      }

      // Verificar se o usuário e gestor existem
      const verificarUsuarioQuery = `
        SELECT id, nome, id_cliente
        FROM usuarios
        WHERE id = $1
      `;
      const usuarioResult = await client.query(verificarUsuarioQuery, [id_usuario]);

      if (usuarioResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado'
        });
      }

      const usuario = usuarioResult.rows[0];

      // Verificar se o gestor existe e pertence ao mesmo cliente
      const verificarGestorQuery = `
        SELECT id, nome, id_cliente
        FROM usuarios
        WHERE id = $1
      `;
      const gestorResult = await client.query(verificarGestorQuery, [id_usuario_gestor]);

      if (gestorResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'GESTOR_NOT_FOUND',
          message: 'Gestor não encontrado'
        });
      }

      const gestor = gestorResult.rows[0];

      // Verificar se pertencem ao mesmo cliente
      if (usuario.id_cliente !== gestor.id_cliente) {
        return res.status(400).json({
          success: false,
          error: 'DIFFERENT_CLIENTS',
          message: 'Usuário e gestor devem pertencer ao mesmo cliente'
        });
      }

      // Verificar se não está tentando atribuir o usuário como gestor de si mesmo
      if (parseInt(id_usuario) === parseInt(id_usuario_gestor)) {
        return res.status(400).json({
          success: false,
          error: 'SELF_ASSIGNMENT',
          message: 'Um usuário não pode ser gestor de si mesmo'
        });
      }

      // Atribuir gestor
      const atribuirGestorQuery = `
        UPDATE usuarios 
        SET id_gestor = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, nome, id_gestor
      `;

      const updateResult = await client.query(atribuirGestorQuery, [id_usuario, id_usuario_gestor]);
      const usuarioAtualizado = updateResult.rows[0];

      logger.info('Gestor atribuído ao usuário com sucesso', {
        usuario_id: usuarioAtualizado.id,
        usuario_nome: usuarioAtualizado.nome,
        gestor_id: usuarioAtualizado.id_gestor,
        gestor_nome: gestor.nome
      });

      return res.status(200).json({
        success: true,
        message: 'Gestor atribuído ao usuário com sucesso',
        data: {
          usuario_id: usuarioAtualizado.id,
          nome_usuario: usuarioAtualizado.nome,
          id_gestor: usuarioAtualizado.id_gestor,
          nome_gestor: gestor.nome
        }
      });

    } catch (error) {
      logger.error('Erro ao atribuir gestor ao usuário', { 
        error: error.message, 
        stack: error.stack,
        usuario_id: req.params.id_usuario,
        gestor_id: req.params.id_usuario_gestor
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

  /**
   * Buscar todos os usuários por cliente (perfil_acesso = 1)
   * GET /api/usuarios/all-usuarios/:id_cliente
   */
  async buscarTodosUsuariosPorCliente(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de todos os usuários por cliente', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar usuários com perfil_acesso = 1
      const usuariosQuery = `
        SELECT 
          u.id,
          u.nome,
          u.email,
          d.titulo_departamento as departamento
        FROM usuarios u
        LEFT JOIN departamento d ON u.id_departamento = d.id
        WHERE u.id_cliente = $1 AND u.perfil_acesso = 1
        ORDER BY u.nome ASC
      `;

      const result = await client.query(usuariosQuery, [id_cliente]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum usuário encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            usuarios: []
          }
        });
      }

      // Processar os resultados
      const usuarios = result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        email: row.email,
        departamento: row.departamento
      }));

      logger.info('Todos os usuários buscados com sucesso', {
        cliente_id: id_cliente,
        usuarios_count: usuarios.length
      });

      return res.status(200).json({
        success: true,
        message: 'Usuários buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          usuarios
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar todos os usuários por cliente', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente
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

  /**
   * Buscar todos os gestores por cliente (perfil_acesso in (2,3))
   * GET /api/usuarios/all-gestores/:id_cliente
   */
  async buscarTodosGestoresPorCliente(req, res) {
    const client = await pool.connect();
    
    try {
      const { id_cliente } = req.params;

      logger.info('Iniciando busca de todos os gestores por cliente', {
        id_cliente
      });

      // Validações básicas
      if (!id_cliente || isNaN(id_cliente)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CLIENT_ID',
          message: 'ID do cliente é obrigatório e deve ser um número válido'
        });
      }

      // Buscar gestores com perfil_acesso in (2,3)
      const gestoresQuery = `
        SELECT 
          u.id,
          u.nome,
          u.email,
          d.titulo_departamento
        FROM usuarios u
        LEFT JOIN departamento d ON u.id_departamento = d.id
        WHERE u.id_cliente = $1 AND u.perfil_acesso IN (2, 3)
        ORDER BY u.nome ASC
      `;

      const result = await client.query(gestoresQuery, [id_cliente]);

      if (result.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum gestor encontrado para este cliente',
          data: {
            cliente_id: parseInt(id_cliente),
            gestores: []
          }
        });
      }

      // Processar os resultados
      const gestores = result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        email: row.email,
        titulo_departamento: row.titulo_departamento
      }));

      logger.info('Todos os gestores buscados com sucesso', {
        cliente_id: id_cliente,
        gestores_count: gestores.length
      });

      return res.status(200).json({
        success: true,
        message: 'Gestores buscados com sucesso',
        data: {
          cliente_id: parseInt(id_cliente),
          gestores
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar todos os gestores por cliente', { 
        error: error.message, 
        stack: error.stack,
        cliente_id: req.params.id_cliente
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
