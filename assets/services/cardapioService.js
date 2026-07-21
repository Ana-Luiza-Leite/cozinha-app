import { getAll } from '../js/db.js';
import { calcularEstoque } from './estoqueService.js';

/**
 * Gera um cardápio para `dias` dias.
 * - seleciona pratos (fichasTecnicas) dando preferencia aos que têm mais estoque disponível
 * - tenta garantir que em cada dia haja pelo menos 1 prato com grupo 'Carboidrato' e 1 com 'Proteína'
 * - retorna objeto com dias: [{ diaIndex, prato, porcoes, ingredientesUsados: [{nome,qtd,unidade,custo}] , custoDia }]
 */
export async function gerarCardapio({ dias = 5, porcoesPorDia = 1 }) {
    const [fichas, entradas, insumos] = await Promise.all([
        getAll("fichasTecnicas"),
        getAll("entradas"),
        getAll("insumos")
    ]);

    const estoque = await calcularEstoque();

    // função auxiliar: calcula quantas porções de uma ficha cabem no estoque atual
    function maxPorcoesDisponiveis(ficha) {
        if (!ficha.itens || !ficha.itens.length) return 0;
        // suposição: item.quantidadePerCapita é a quantidade por porção
        let maxPorcoes = Infinity;
        ficha.itens.forEach(i => {
            const reqPorcao = Number(i.quantidadePerCapita || i.quantidadeTotal || 0);
            if (!reqPorcao || reqPorcao <= 0) return;
            const disponivel = Number(estoque[i.produto] || estoque[i.nome] || 0);
            const porcoes = Math.floor(disponivel / reqPorcao);
            if (porcoes < maxPorcoes) maxPorcoes = porcoes;
        });
        return isFinite(maxPorcoes) ? maxPorcoes : 0;
    }

    // avaliar fichas com score = maxPorcoesDisponiveis (priorizar o que tem mais estoque)
    const fichasAvaliadas = (fichas || []).map(f => ({
        ficha: f,
        disponiveis: maxPorcoesDisponiveis(f)
    })).sort((a,b) => b.disponiveis - a.disponiveis);

    // helpers para identificar grupo do prato (procura nos insumos se há proteína/carbo)
    function fichaTemGrupo(ficha, grupoBuscado) {
        if (!ficha.itens) return false;
        return ficha.itens.some(it => {
            const info = insumos.find(ins => (ins.nome === it.produto) || (ins.nome === it.nome));
            return info && (info.categoria || "").toLowerCase().includes(grupoBuscado.toLowerCase());
        });
    }

    const diaResultados = [];

    for (let d = 1; d <= dias; d++) {
        // estratégia: escolher um prato principal priorizando maior disponivel
        let escolhido = fichasAvaliadas.find(fa => fa.disponiveis >= porcoesPorDia);
        if (!escolhido) {
            // se nenhum tem porcoes suficientes, escolher o que tem maior disponivel
            escolhido = fichasAvaliadas[0];
        }

        if (!escolhido) {
            diaResultados.push({ dia: d, prato: null, ingredientesUsados: [], custoDia: 0, mensagem: "Sem fichas cadastradas" });
            continue;
        }

        // marcar uso temporário no estoque (consumir para os dias seguintes)
        const ingredientesUsados = [];
        (escolhido.ficha.itens || []).forEach(it => {
            const reqPorcao = Number(it.quantidadePerCapita || it.quantidadeTotal || 0);
            const qtdNecessaria = reqPorcao * porcoesPorDia;
            // procurar preço unitário nas entradas (usar ultima entrada com valor, ou 0)
            let precoUnit = 0;
            const entradasDoInsumo = entradas.filter(e => e.nome === (it.produto || it.nome) && e.valor_unitario).sort((a,b)=>new Date(b.data)-new Date(a.data));
            if (entradasDoInsumo.length) precoUnit = Number(entradasDoInsumo[0].valor_unitario || 0);
            ingredientesUsados.push({ nome: it.produto || it.nome, qtd: qtdNecessaria, unidade: it.unidadeMedida || it.unidade || 'un', precoUnitario: precoUnit, custo: precoUnit * qtdNecessaria });
            // decrementar do estoque para não usar duas vezes o mesmo insumo além do disponível
            const chave = it.produto || it.nome;
            estoque[chave] = (estoque[chave] || 0) - qtdNecessaria;
        });

        const custoDia = ingredientesUsados.reduce((s, x) => s + (Number(x.custo) || 0), 0);

        // atualizar disponibilidade nas fichas avaliadas
        fichasAvaliadas.forEach(fa => fa.disponiveis = maxPorcoesDisponiveis(fa.ficha));

        diaResultados.push({
            dia: d,
            prato: escolhido.ficha.nome || "Prato sem nome",
            porcoes: porcoesPorDia,
            ingredientesUsados,
            custoDia,
            temCarbo: fichaTemGrupo(escolhido.ficha, "carbo"),
            temProteina: fichaTemGrupo(escolhido.ficha, "proteína") || fichaTemGrupo(escolhido.ficha, "proteina")
        });
    }

    // pós-processar: garantir carbo+proteína por dia (simples: marcar aviso se faltou)
    diaResultados.forEach(dia => {
        if (!dia.prato) return;
        if (!dia.temCarbo || !dia.temProteina) {
            dia.alerta = "Verificar: prato pode não conter carboidrato ou proteína. Ajuste manualmente se necessário.";
        }
    });

    const custoSemana = diaResultados.reduce((s, d) => s + (d.custoDia || 0), 0);

    return { dias: diaResultados, custoSemana };
}
