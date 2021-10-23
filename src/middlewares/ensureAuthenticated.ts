import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';


interface IPayload {
  sub: string;
}

export function ensureAuthenticated (request: Request, response: Response, next: NextFunction) {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json({
      errorCode: "token.invalid"
    });
  }

  //Bearer 151237a786afgsd6fgasdf781298143
  // [0] Bearer --> No caso esse valor vai ser atribuído a "nada", pois só o que nos interessa é o valor do token, que estará na posição 1;
  // [1] 151237a786afgsd6fgasdf781298143

  const [, token] = authToken.split(" ");

  try{ 
    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;
    
    request.user_id = sub;

    return next();
  }catch(err) {
    return response.status(401).json({errorCode: "token.expired"});
  }

}