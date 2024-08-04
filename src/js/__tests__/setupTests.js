const { TextEncoder, TextDecoder } = require('@sinonjs/text-encoding');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
