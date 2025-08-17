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

      // Buscar usuário pelo email
      const userResult = await query(
        'SELECT id, email, senha, data_nascimento, id_gestor, id_departamento FROM usuarios WHERE email = $1',
        [email]
      );

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
        email: user.email,
        data_nascimento: user.data_nascimento,
        id_gestor: user.id_gestor,
        id_departamento: user.id_departamento
      };

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

      // Preparar dados para inserção (tratar valores null/undefined)
      const insertData = [
        email, 
        hashedPassword, 
        nome || null, 
        data_nascimento || null, 
        cargo || null, 
        idade || null,
        id_gestor || null, 
        id_departamento || null, 
        id_cliente || null, 
        perfil_acesso || null
      ];

      console.log('📝 Dados preparados para inserção:', insertData);

      // Inserir novo usuário
      const insertResult = await query(
        `INSERT INTO usuarios (
          email, senha, nome, data_nascimento, cargo, idade, 
          id_gestor, id_departamento, id_cliente, perfil_acesso
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING id, email, nome, data_nascimento, cargo, idade, 
                  id_gestor, id_departamento, id_cliente, perfil_acesso`,
        insertData
      );

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
        email: newUser.email,
        nome: newUser.nome,
        data_nascimento: newUser.data_nascimento,
        cargo: newUser.cargo,
        idade: newUser.idade,
        id_gestor: newUser.id_gestor,
        id_departamento: newUser.id_departamento,
        id_cliente: newUser.id_cliente,
        perfil_acesso: newUser.perfil_acesso
      };

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