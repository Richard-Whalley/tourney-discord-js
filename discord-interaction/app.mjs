/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const nacl = require('tweetnacl');
const PUBLIC_KEY = '44086f5a33b3b118814eeea782ed009ae7d0235e581e8a5319ba47cc6bd0dd7c';

export const lambdaHandler = async (event, context) => {
    console.log(event)

    const signature = event.headers['x-signature-ed25519']
    const timestamp = event.headers['x-signature-timestamp'];
    const strBody = event.body; // should be string, for successful sign

    const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + strBody),
        Buffer.from(signature, 'hex'),
        Buffer.from(PUBLIC_KEY, 'hex')
    );

    if (!isVerified) {
        return {
            statusCode: 401,
            body: JSON.stringify('invalid request signature'),
        };
    }

    // Replying to ping (requirement 2.)
    const body = JSON.parse(strBody)
    if (body.type == 1) {
        return {
            statusCode: 200,
            body: JSON.stringify({ "type": 1 }),
        }
    }

    // Handle /foo Command
    if (body.data.name == 'yolo') {
        return JSON.stringify({  // Note the absence of statusCode
            "type": 4,  // This type stands for answer with invocation shown
            "data": { "content": "Serverless!" }
        })
    }

    return {
        statusCode: 404  // If no handler implemented for Discord's request
    }
};