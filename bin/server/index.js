"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fengari = require("fengari");
const interop = require("fengari-interop");
const fs = require("fs");
const L = fengari.lauxlib.luaL_newstate();
let root;
fengari.lualib.luaL_openlibs(L);
fengari.lauxlib.luaL_requiref(L, fengari.to_luastring("js"), interop.luaopen_js, 1);
const open = function () {
    return function (v) {
        if (v.indexOf(root) < 0) {
            v = `${root}${v}`;
        }
        try {
            let content = fs.readFileSync(v, 'utf8');
            return content;
        }
        catch (e) {
            return null;
        }
    }(this);
};
interop.push(L, open);
fengari.lua.lua_setglobal(L, fengari.to_luastring('open'));
function load(source, chunkname) {
    if (typeof source == "string")
        source = fengari.to_luastring(source);
    else if (!(source instanceof Uint8Array))
        throw new TypeError("expects an array of bytes or javascript string");
    chunkname = chunkname ? fengari.to_luastring(chunkname) : null;
    let ok = fengari.lauxlib.luaL_loadbuffer(L, source, null, chunkname);
    let res;
    if (ok === fengari.lua.LUA_ERRSYNTAX) {
        res = new SyntaxError(fengari.lua.lua_tojsstring(L, -1));
    }
    else {
        res = interop.tojs(L, -1);
    }
    fengari.lua.lua_pop(L, 1);
    if (ok !== fengari.lua.LUA_OK) {
        throw res;
    }
    return res;
}
exports.load = load;
function LuaRestyTemplate(base, path, context) {
    root = base;
    return load(`
    local template = require "src/server/lua-resty-template"
    local context = ${ObjToTable(context)}
    return template.compile("${base}${path}", nil, nil)(context)
  `)();
}
function ObjToTable(obj) {
    let parts = [];
    let key;
    if (Array.isArray(obj)) {
        for (key of obj) {
            if (obj[key] == null) {
                parts.push(`nil`);
                continue;
            }
            if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                parts.push(ObjToTable(obj[key]));
                continue;
            }
            if (typeof obj[key] === 'function') {
                continue;
            }
            if (typeof obj[key] === 'string') {
                parts.push(`"obj[key]"`);
                continue;
            }
            parts.push(`"obj[key]"`);
        }
    }
    else {
        for (key in obj) {
            if (obj[key] == null) {
                parts.push(`["${key}"] = nil`);
                continue;
            }
            if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                parts.push(`["${key}"] = ${ObjToTable(obj[key])}`);
                continue;
            }
            if (typeof obj[key] === 'function') {
                continue;
            }
            if (typeof obj[key] === 'string') {
                parts.push(`["${key}"] = "${obj[key]}"`);
                continue;
            }
            parts.push(`["${key}"] = ${obj[key]}`);
        }
    }
    return `{${parts.join(',')}}`;
}
let str = LuaRestyTemplate(`workspaces/default/themes/light-theme/`, `layouts/homepage.html`, {
    page: {},
    site: {
        name: 'kong',
        colors: {
            green: null
        },
    },
    theme: {
        name: 'kong',
    },
    kong: {
        workspace: {
            name: 'default'
        }
    }
});
console.log(str);
