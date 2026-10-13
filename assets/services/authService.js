import {
    getAll,
    add,
    put
} from "../js/db.js";

const STORE_USUARIOS = "usuarios";
const CHAVE_SESSAO = "cozinha_usuario_id";
const ITERACOES_PBKDF2 = 310000;
const TAMANHO_SALT = 16;
const TAMANHO_HASH = 256;
const TAMANHO_MINIMO_SENHA = 8;

/* =========================================================
   UTILITÁRIOS
========================================================= */

function normalizarUsuario(usuario) {
    return String(usuario || "")
        .trim()
        .toLowerCase();
}

function validarSenha(senha) {
    if (
        typeof senha !== "string" ||
        senha.length < TAMANHO_MINIMO_SENHA
    ) {
        throw new Error(
            "A senha deve ter pelo menos 8 caracteres."
        );
    }
}

function validarWebCrypto() {
    if (
        !globalThis.crypto?.subtle ||
        !globalThis.crypto?.getRandomValues
    ) {
        throw new Error(
            "A autenticação exige um navegador com Web Crypto " +
            "em contexto seguro (HTTPS ou localhost)."
        );
    }
}

function converterBase64(bytes) {
    let binario = "";

    for (const byte of bytes) {
        binario += String.fromCharCode(byte);
    }

    return btoa(binario);
}

function decodificarBase64(valor) {
    const binario = atob(valor);

    return Uint8Array.from(
        binario,
        caractere => caractere.charCodeAt(0)
    );
}

function usuarioPublico(usuario) {
    if (!usuario) return null;

    const {
        senhaHash,
        salt,
        ...dadosPublicos
    } = usuario;

    return dadosPublicos;
}

async function gerarCredenciais(senha) {
    validarWebCrypto();
    validarSenha(senha);

    const salt = crypto.getRandomValues(
        new Uint8Array(TAMANHO_SALT)
    );

    const material = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(senha),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: ITERACOES_PBKDF2,
            hash: "SHA-256"
        },
        material,
        TAMANHO_HASH
    );

    return {
        salt: converterBase64(salt),
        senhaHash: converterBase64(
            new Uint8Array(bits)
        )
    };
}

async function verificarSenha(senha, usuario) {
    validarWebCrypto();

    if (!usuario?.salt || !usuario?.senhaHash) {
        return false;
    }

    const material = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(senha),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: decodificarBase64(usuario.salt),
            iterations: ITERACOES_PBKDF2,
            hash: "SHA-256"
        },
        material,
        TAMANHO_HASH
    );

    const hashCalculado = new Uint8Array(bits);
    const hashArmazenado = decodificarBase64(
        usuario.senhaHash
    );

    if (hashCalculado.length !== hashArmazenado.length) {
        return false;
    }

    let diferenca = 0;

    for (let i = 0; i < hashCalculado.length; i++) {
        diferenca |= (
            hashCalculado[i] ^ hashArmazenado[i]
        );
    }

    return diferenca === 0;
}

async function buscarPorUsuario(usuario) {
    const usuarios = await getAll(STORE_USUARIOS);
    const usuarioNormalizado = normalizarUsuario(usuario);

    return usuarios.find(
        item => normalizarUsuario(item.usuario) === usuarioNormalizado
    ) || null;
}

async function buscarPorId(id) {
    const usuarios = await getAll(STORE_USUARIOS);

    return usuarios.find(
        item => Number(item.id) === Number(id)
    ) || null;
}

async function exigirAdministrador() {
    const usuario = await getUsuarioAtual();

    if (!usuario || usuario.perfil !== "admin") {
        throw new Error(
            "Operação permitida somente para administradores."
        );
    }

    return usuario;
}

/* =========================================================
   INICIALIZAÇÃO DO ADMINISTRADOR
========================================================= */

/**
 * Cria a conta administrativa inicial uma única vez.
 *
 * A senha deve ser informada durante a configuração local.
 * Nunca redefina a senha automaticamente ao abrir o sistema.
 */
export async function inicializarAdmin(senhaInicial) {
    try {
        validarWebCrypto();
        validarSenha(senhaInicial);

        const usuarios = await getAll(STORE_USUARIOS);

        const administradorExistente = usuarios.find(
            usuario => usuario.perfil === "admin"
        );

        if (administradorExistente) {
            return {
                criado: false,
                mensagem: "A conta administrativa já existe."
            };
        }

        const conflito = usuarios.find(
            usuario => normalizarUsuario(usuario.usuario) === "admin"
        );

        if (conflito) {
            throw new Error(
                "O login admin já está sendo utilizado por outra conta."
            );
        }

        const credenciais = await gerarCredenciais(
            senhaInicial
        );

        await add(STORE_USUARIOS, {
            nome: "Administrador",
            usuario: "admin",
            ...credenciais,
            perfil: "admin",
            status: "ativo",
            criadoEm: new Date().toISOString()
        });

        return {
            criado: true,
            mensagem: "Administrador inicial criado com sucesso."
        };
    } catch (error) {
        console.error(
            "Erro ao inicializar administrador:",
            error
        );

        throw new Error(
            `Não foi possível inicializar o administrador: ${error.message}`
        );
    }
}

/* =========================================================
   LOGIN E SESSÃO
========================================================= */

export async function login(usuario, senha) {
    try {
        validarWebCrypto();

        if (
            typeof usuario !== "string" ||
            !normalizarUsuario(usuario) ||
            typeof senha !== "string" ||
            !senha
        ) {
            throw new Error(
                "Informe o usuário e a senha."
            );
        }

        const conta = await buscarPorUsuario(usuario);

        if (!conta) {
            throw new Error(
                "Usuário ou senha inválidos."
            );
        }

        const senhaValida = await verificarSenha(
            senha,
            conta
        );

        if (!senhaValida) {
            throw new Error(
                "Usuário ou senha inválidos."
            );
        }

        if (conta.status === "pendente") {
            throw new Error(
                "Seu cadastro ainda aguarda aprovação."
            );
        }

        if (conta.status !== "ativo") {
            throw new Error(
                "Esta conta não está autorizada a entrar."
            );
        }

        sessionStorage.setItem(
            CHAVE_SESSAO,
            String(conta.id)
        );

        return usuarioPublico(conta);
    } catch (error) {
        console.error("Erro no login:", error);
        throw error;
    }
}

export async function getUsuarioAtual() {
    try {
        const id = sessionStorage.getItem(CHAVE_SESSAO);

        if (!id) return null;

        const usuario = await buscarPorId(id);

        if (!usuario || usuario.status !== "ativo") {
            logout();
            return null;
        }

        return usuarioPublico(usuario);
    } catch (error) {
        console.error(
            "Erro ao recuperar sessão:",
            error
        );

        logout();
        throw error;
    }
}

export function logout() {
    sessionStorage.removeItem(CHAVE_SESSAO);
}

/* =========================================================
   CADASTRO DE MEMBROS
========================================================= */

/**
 * Todo cadastro público cria um membro pendente.
 * O perfil nunca é recebido do formulário.
 */
export async function solicitarCadastro({
    nome,
    usuario,
    senha
}) {
    try {
        validarWebCrypto();

        const nomeValido = String(nome || "").trim();
        const usuarioValido = normalizarUsuario(usuario);

        if (nomeValido.length < 2) {
            throw new Error(
                "Informe um nome válido."
            );
        }

        if (
            !/^[a-z0-9._-]{3,30}$/.test(usuarioValido)
        ) {
            throw new Error(
                "O usuário deve ter de 3 a 30 caracteres: " +
                "letras, números, ponto, hífen ou sublinhado."
            );
        }

        validarSenha(senha);

        const existente = await buscarPorUsuario(
            usuarioValido
        );

        if (existente) {
            throw new Error(
                "Este nome de usuário já está cadastrado."
            );
        }

        const credenciais = await gerarCredenciais(senha);

        const id = await add(STORE_USUARIOS, {
            nome: nomeValido,
            usuario: usuarioValido,
            ...credenciais,
            perfil: "membro",
            status: "pendente",
            criadoEm: new Date().toISOString()
        });

        return {
            id,
            nome: nomeValido,
            usuario: usuarioValido,
            perfil: "membro",
            status: "pendente"
        };
    } catch (error) {
        console.error(
            "Erro ao solicitar cadastro:",
            error
        );

        throw error;
    }
}

/* =========================================================
   GESTÃO DE MEMBROS
========================================================= */

export async function listarUsuarios() {
    await exigirAdministrador();

    const usuarios = await getAll(STORE_USUARIOS);

    return usuarios.map(usuarioPublico);
}

export async function aprovarUsuario(id) {
    try {
        await exigirAdministrador();

        const usuario = await buscarPorId(id);

        if (!usuario) {
            throw new Error(
                "Usuário não encontrado."
            );
        }

        if (usuario.perfil !== "membro") {
            throw new Error(
                "Somente contas de membros podem ser aprovadas."
            );
        }

        if (usuario.status !== "pendente") {
            throw new Error(
                "Somente cadastros pendentes podem ser aprovados."
            );
        }

        usuario.status = "ativo";
        usuario.aprovadoEm = new Date().toISOString();

        await put(STORE_USUARIOS, usuario);

        return usuarioPublico(usuario);
    } catch (error) {
        console.error(
            "Erro ao aprovar usuário:",
            error
        );

        throw error;
    }
}

export async function bloquearUsuario(id) {
    try {
        await exigirAdministrador();

        const usuario = await buscarPorId(id);

        if (!usuario) {
            throw new Error(
                "Usuário não encontrado."
            );
        }

        if (usuario.perfil !== "membro") {
            throw new Error(
                "Esta operação permite bloquear somente membros."
            );
        }

        if (usuario.status === "bloqueado") {
            throw new Error(
                "Este usuário já está bloqueado."
            );
        }

        usuario.status = "bloqueado";
        usuario.bloqueadoEm = new Date().toISOString();

        await put(STORE_USUARIOS, usuario);

        return usuarioPublico(usuario);
    } catch (error) {
        console.error(
            "Erro ao bloquear usuário:",
            error
        );

        throw error;
    }
}
