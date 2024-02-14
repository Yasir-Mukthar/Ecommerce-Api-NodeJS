import jwt from 'jsonwebtoken';
   

function authJwt() {
    const secret = "my-own-secret";

    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized request' });
        }

        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized token' });
            }
console.log(decoded);
            req.user = decoded;
            next();
        });
    };
}

function isAdmin(req, res, next) {
    console.log("is admin middleware", req.user);

    if (req.user.isAdmin !== true) {
      return res.status(403).json({ message: 'Forbidden - You do not have permission to access this resource' });
    }
    next();
  }

  export {isAdmin};

export default authJwt;
