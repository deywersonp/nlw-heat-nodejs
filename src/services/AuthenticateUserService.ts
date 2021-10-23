import axios from 'axios';
import prismaClient from '../prisma';

/**
 * Receber code(string)
 * Recuperar o access_token no github
 * Recuperar os dados do usuário no Github
 * Verificar se o usuário existe no DB
 * ---- SIM = Gera um token
 * ---- NÃO = Cria no DB e gera um token
 * Retornar o token com as infos do usuário
 */

interface IAccessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  avatar_url: string,
  login: string,
  id: number,
  name: string
}
class AuthenticateUserService {
  async execute(code: string){
    const url = "https://github.com/login/oauth/access_token";

    const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, { 
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      headers: {
        "Accept": "application/json"
      }
    });

    const response = await axios.get<IUserResponse>("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${ accessTokenResponse.access_token }`
      }
    });

    const { login, id, name, avatar_url} = response.data;

    let user = await prismaClient.user.findFirst({ 
      where: {
        github_id: id
      }
    });

    if(!user) {
      await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name
        }
      });
    };


    return response.data;
  }
};

export { AuthenticateUserService };