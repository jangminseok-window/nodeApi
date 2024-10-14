"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysqlConnSam_1 = __importDefault(require("./mysqlConnSam"));
function executeQuery(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, params = []) {
        const [rows] = yield mysqlConnSam_1.default.execute(query, params);
        return rows;
    });
}
function getUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT * FROM users';
        return executeQuery(query);
    });
}
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT * FROM users WHERE id = ?';
        const users = yield executeQuery(query, [id]);
        return users[0] || null;
    });
}
// 쿼리 실행
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield getUsers();
        console.log('All users:', users);
        const user = yield getUserById(1);
        console.log('User with id 1:', user);
    }
    catch (error) {
        console.error('Error:', error);
    }
}))();
