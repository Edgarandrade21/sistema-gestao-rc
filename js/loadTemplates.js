// Função para carregar um template
async function loadTemplate(templateName, containerId) {
    try {
        const response = await fetch(`templates/${templateName}.html`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
            // Disparar evento de template carregado
            const event = new CustomEvent('templateLoaded', { detail: { templateName, containerId } });
            document.dispatchEvent(event);
        } else {
            console.error(`Container ${containerId} não encontrado`);
        }
    } catch (error) {
        console.error(`Erro ao carregar o template ${templateName}:`, error);
    }
}

// Carregar todos os templates quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar templates principais
    await loadTemplate('organograma', 'organograma-container');
    await loadTemplate('esg', 'esg-container');
    await loadTemplate('documentos', 'documentos-container');
    await loadTemplate('processos-internos', 'processos-internos-container');
    await loadTemplate('requisitos-legais', 'requisitos-legais-container');
}); 