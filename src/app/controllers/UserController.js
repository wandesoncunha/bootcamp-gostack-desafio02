import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    // Validar dados da requisição
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }

    // Validar se o email já está sendo utilizado
    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Criar novo usuário
    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    // Validar dados da requisição
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().ondeOf([Yup.ref('password')]) : field
      ),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      // Validar se o email já está sendo utilizado
      const userExist = await User.findOne({ where: { email } });

      if (userExist) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    // Validar senha
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    // Atualizar usuário
    const { id, name } = await user.update(req.body);

    return res.json({ id, name, email });
  }
}

export default new UserController();
