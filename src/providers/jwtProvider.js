import JWT from 'jsonwebtoken'

// Generate Token: Create new Token
// 3 params: userInfo, secretSignature, tokenLife
// userInfo: include _id, email of user
// secretSignature== privateKey: private key to create token
// tokenLife: time to live of token
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Sign() to create new token
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

// Verify Token: Check Token
// token need to equal secretSignature in project

const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) { throw new Error(error) }
}

export const jwtProvider = {
  generateToken,
  verifyToken,
}