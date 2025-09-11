const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../utils/supabase');
const ApiResponse = require('../utils/response');
const { BaseController } = require('./index');

class AuthController extends BaseController {
  constructor() {
    super();
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  // Login do usuário
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Primeiro, verificar quais colunas existem na tabela
      const columnsResult = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios' 
        AND column_name IN ('id', 'email', 'senha', 'data_nascimento', 'id_gestor', 'id_departamento', 'id_cliente', 'perfil_acesso')
        ORDER BY column_name;
      `);
      
      const availableColumns = columnsResult.rows.map(row => row.column_name);
      console.log('📋 Colunas disponíveis na tabela usuarios:', availableColumns);

      // Construir query dinamicamente baseada nas colunas disponíveis
      const selectColumns = ['id', 'email', 'senha'];
      
      if (availableColumns.includes('data_nascimento')) selectColumns.push('data_nascimento');
      if (availableColumns.includes('id_gestor')) selectColumns.push('id_gestor');
      if (availableColumns.includes('id_departamento')) selectColumns.push('id_departamento');
      if (availableColumns.includes('id_cliente')) selectColumns.push('id_cliente');
      if (availableColumns.includes('perfil_acesso')) selectColumns.push('perfil_acesso');

      const queryText = `SELECT ${selectColumns.join(', ')} FROM usuarios WHERE email = $1`;
      console.log('🔍 Query de login:', queryText);

      // Buscar usuário pelo email
      const userResult = await query(queryText, [email]);

      if (userResult.rows.length === 0) {
        return ApiResponse.unauthorized(res, 'Email ou senha inválidos');
      }

      const user = userResult.rows[0];

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(senha, user.senha);
      
      if (!isPasswordValid) {
        return ApiResponse.unauthorized(res, 'Email ou senha inválidos');
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Retornar dados do usuário (sem a senha) e token
      const userData = {
        id: user.id,
        email: user.email
      };

      // Adicionar campos opcionais se existirem
      if (user.data_nascimento !== undefined) userData.data_nascimento = user.data_nascimento;
      if (user.id_gestor !== undefined) userData.id_gestor = user.id_gestor;
      if (user.id_departamento !== undefined) userData.id_departamento = user.id_departamento;
      if (user.id_cliente !== undefined) userData.id_cliente = user.id_cliente;
      if (user.perfil_acesso !== undefined) userData.perfil_acesso = user.perfil_acesso;

      return ApiResponse.success(res, {
        user: userData,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }, 'Login realizado com sucesso');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao realizar login');
    }
  }

  // Registro de usuário
  async register(req, res) {
    try {
      const { 
        email, 
        senha, 
        nome, 
        data_nascimento, 
        cargo, 
        idade, 
        id_gestor, 
        id_departamento, 
        id_cliente, 
        perfil_acesso 
      } = req.body;

      // Log para debug em produção
      console.log('📝 Dados de registro recebidos:', {
        email,
        nome,
        data_nascimento,
        cargo,
        idade,
        id_gestor,
        id_departamento,
        id_cliente,
        perfil_acesso
      });

      // Verificar se o email já existe
      const existingUser = await query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return ApiResponse.validationError(res, 'Email já está em uso');
      }

      // Criptografar senha com bcrypt (salt rounds = 10)
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Verificar quais colunas existem na tabela para inserção
      const insertColumnsResult = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios' 
        AND column_name IN ('email', 'senha', 'nome', 'data_nascimento', 'cargo', 'idade', 'id_gestor', 'id_departamento', 'id_cliente', 'perfil_acesso')
        ORDER BY column_name;
      `);
      
      const availableInsertColumns = insertColumnsResult.rows.map(row => row.column_name);
      console.log('📋 Colunas disponíveis para inserção:', availableInsertColumns);

      // Construir query de inserção dinamicamente
      const insertColumns = ['email', 'senha'];
      const insertValues = [email, hashedPassword];
      let paramCount = 2;

      if (availableInsertColumns.includes('nome')) {
        insertColumns.push('nome');
        insertValues.push(nome || null);
        paramCount++;
      }
      if (availableInsertColumns.includes('data_nascimento')) {
        insertColumns.push('data_nascimento');
        insertValues.push(data_nascimento || null);
        paramCount++;
      }
      if (availableInsertColumns.includes('cargo')) {
        insertColumns.push('cargo');
        insertValues.push(cargo || null);
        paramCount++;
      }
      if (availableInsertColumns.includes('idade')) {
        insertColumns.push('idade');
        insertValues.push(idade || null);
        paramCount++;
      }
      if (availableInsertColumns.includes('id_gestor')) {
        insertColumns.push('id_gestor');
        insertValues.push(id_gestor || null);
        paramCount++;
      }
      if (availableInsertColumns.includes('id_departamento')) {
        insertColumns.push('id_departamento');
        insertValues.push(id_departamento || null);
        paramCount++;
      }
      if (availableInsertColumns.includes('id_cliente')) {
        insertColumns.push('id_cliente');
        insertValues.push(id_cliente || null);
        paramCount++;
      }
      if (availableInsertColumns.includes('perfil_acesso')) {
        insertColumns.push('perfil_acesso');
        insertValues.push(perfil_acesso || null);
        paramCount++;
      }

      console.log('📝 Dados preparados para inserção:', insertValues);

      // Construir query de inserção
      const placeholders = insertValues.map((_, index) => `$${index + 1}`).join(', ');
      const insertQuery = `INSERT INTO usuarios (${insertColumns.join(', ')}) VALUES (${placeholders}) RETURNING id, email`;
      
      console.log('🔍 Query de inserção:', insertQuery);

      // Inserir novo usuário
      const insertResult = await query(insertQuery, insertValues);

      const newUser = insertResult.rows[0];

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Retornar dados do usuário (sem a senha) e token
      const userData = {
        id: newUser.id,
        email: newUser.email
      };

      // Adicionar campos opcionais se existirem no resultado
      if (newUser.nome !== undefined) userData.nome = newUser.nome;
      if (newUser.data_nascimento !== undefined) userData.data_nascimento = newUser.data_nascimento;
      if (newUser.cargo !== undefined) userData.cargo = newUser.cargo;
      if (newUser.idade !== undefined) userData.idade = newUser.idade;
      if (newUser.id_gestor !== undefined) userData.id_gestor = newUser.id_gestor;
      if (newUser.id_departamento !== undefined) userData.id_departamento = newUser.id_departamento;
      if (newUser.id_cliente !== undefined) userData.id_cliente = newUser.id_cliente;
      if (newUser.perfil_acesso !== undefined) userData.perfil_acesso = newUser.perfil_acesso;

      return ApiResponse.success(res, {
        user: userData,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }, 'Usuário criado com sucesso', 201);

    } catch (error) {
      console.error('❌ Erro no registro:', error);
      console.error('❌ Stack trace:', error.stack);
      return this.handleError(res, error, 'Erro ao criar usuário');
    }
  }



  // Validar token (rota protegida)
  async validateToken(req, res) {
    try {
      // O middleware de autenticação já validou o token
      // e colocou os dados do usuário em req.user
      const userData = {
        id: req.user.id,
        email: req.user.email
      };

      // Adicionar campos opcionais se existirem no token
      if (req.user.data_nascimento !== undefined) userData.data_nascimento = req.user.data_nascimento;
      if (req.user.id_gestor !== undefined) userData.id_gestor = req.user.id_gestor;
      if (req.user.id_departamento !== undefined) userData.id_departamento = req.user.id_departamento;
      if (req.user.id_cliente !== undefined) userData.id_cliente = req.user.id_cliente;
      if (req.user.perfil_acesso !== undefined) userData.perfil_acesso = req.user.perfil_acesso;

      return ApiResponse.success(res, {
        user: userData,
        valid: true
      }, 'Token válido');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao validar token');
    }
  }

  // Alterar senha
  async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = req.user.id;

      // Buscar usuário atual
      const userResult = await query(
        'SELECT senha FROM usuarios WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return ApiResponse.notFound(res, 'Usuário não encontrado');
      }

      const user = userResult.rows[0];

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(senhaAtual, user.senha);
      
      if (!isCurrentPasswordValid) {
        return ApiResponse.unauthorized(res, 'Senha atual incorreta');
      }

      // Criptografar nova senha
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(novaSenha, saltRounds);

      // Atualizar senha
      await query(
        'UPDATE usuarios SET senha = $1 WHERE id = $2',
        [hashedNewPassword, userId]
      );

      return ApiResponse.success(res, null, 'Senha alterada com sucesso');

    } catch (error) {
      return this.handleError(res, error, 'Erro ao alterar senha');
    }
  }
}

module.exports = new AuthController(); 