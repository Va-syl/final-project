import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

//import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

//const jwksUrl = 'https://dev-v8ezozqe.us.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJZmc0zv7vLaH9MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi12OGV6b3pxZS51cy5hdXRoMC5jb20wHhcNMjExMDI5MTkyOTM1WhcN
MzUwNzA4MTkyOTM1WjAkMSIwIAYDVQQDExlkZXYtdjhlem96cWUudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1Gkye4UnX1ninnFX
UVhbYu7JjF8si0ExZk5XrpYDSzS1xAX59HjbV9SXZ2KAWhfukLbVB+35dY/apjty
3UumIJV2ckcMMrPHeqnHkH3XRsh/R1M3X1g2wm1I1O4E8oX5n91bIVQWiRj84dCd
rYCGbGQPWA8Ysd7rDBdSf88u1KNvIPRV+9z8gpwChEAOx6N1MOnNtqgw+ajHR+BE
leji6A87ClxXiam3sgIH2v3L0C4KWJDBZQuNfcVAC2IbCwBd52icVoUeuSPMk0cC
0QwDimnfmjqQq0xyyBQNKhWx+U/Kw2d9siPKIXaVOMdJ+ZD5cHp2a+FjTLLdKA2M
VSwjAwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSAW9XTF1OE
zJBDRVSHZp1aE0JVxjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AEcaVTaXM+Vh8Lg/IFJfjBSDEBqjuRyPYapvMqhWVIbYC9N2mX8wMvWz9QWYW7oc
ZuOPfeEK0lnouhHs5soFVme6CMBOJ4xjCAW4WjW/7LtMuVdUmYpv64+pQ79KtnrZ
bXne74QppsbizBg5e8RNwy0c/unUCC3R7bluhpz7d7YPu+TBe25ZLop6NRSweUQF
DrpC02SB3EIy5tOqEmYRvURReSkerqmg6nIfqe2qQQ2FADK3e+FYVXzeFWbN9Mz/
WM1BXdlI61K2+xoyRz2bqh8C8O3c/s84el4oyT0NBfMbPdAiHWFcTZqQPDKpdACS
FhnpZPgiYm6cTfIO/baV69E=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  return verify(token, cert, {algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
