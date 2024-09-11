var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
require('dotenv').config();
var axios = require('axios');
function addIPToWhitelist() {
    return __awaiter(this, void 0, void 0, function () {
        var ipResponse, currentIP, groupId, apiUrl, publicKey, privateKey, payload, response, error_1, err;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, axios.get('https://api.ipify.org?format=json')];
                case 1:
                    ipResponse = _a.sent();
                    currentIP = ipResponse.data.ip;
                    console.log("Current IP: ".concat(currentIP));
                    groupId = process.env.PROJECT_ID;
                    apiUrl = "https://cloud.mongodb.com/api/atlas/v1.0/groups/".concat(groupId, "/accessList");
                    publicKey = process.env.MONGODB_PUBLIC_KEY;
                    privateKey = process.env.MONGODB_PRIVATE_KEY;
                    payload = {
                        ipAddress: currentIP,
                        comment: 'Automated IP Whitelist Entry',
                    };
                    return [4 /*yield*/, axios.post(apiUrl, payload, {
                            auth: {
                                username: publicKey,
                                password: privateKey,
                            },
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })];
                case 2:
                    response = _a.sent();
                    console.log("Response from MongoDB Atlas: ".concat(response.statusText));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    err = error_1;
                    console.error('Error adding IP to whitelist:', err.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
addIPToWhitelist();
// cd backend
// PS C:\Users\gertf\Desktop\FoodApp\backend> npx tsc src/utils/whitelistadd.ts
// npx tsc src/utils/whitelistadd.ts
// other
// npm install --save-dev ts-node
// ts-node whitelistadd.ts
//npx ts-node src/utils/whitelistadd.ts
