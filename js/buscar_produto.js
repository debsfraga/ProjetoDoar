(function () {
    const INPUT_ID = "buscar";
    const SELECT_ID = "categoria";
    const STORAGE_KEY = "searchQuery";
    const STORAGE_CAT_KEY = "searchCategory";
    const DEBOUNCE_MS = 250;

    const campoBusca = document.querySelector(`#${INPUT_ID}`);
    const categoriaSelect = document.querySelector(`#${SELECT_ID}`);
    if (!campoBusca || !categoriaSelect) return;

    // util
    const normalize = s => (s || "").toString().trim().toLowerCase();
    const debounce = (fn, wait) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    };

    function getCards() {
        return Array.from(document.querySelectorAll(".card"));
    }

    function matchesCard(card, query, categoria) {
        if (!query && !categoria) return true;

        const name = normalize(card.dataset.name || card.querySelector("h2")?.textContent);
        const cardCategory = normalize(card.dataset.category);
        const tags = normalize(card.dataset.tags || "");

        if (categoria && cardCategory !== categoria) return false;
        if (!query) return true;

        return name.includes(query) ||
               cardCategory.includes(query) ||
               tags.split(",").some(t => t.includes(query));
    }

    function applyFilter(value) {
        const q = normalize(value);
        const categoria = normalize(categoriaSelect.value);
        const cards = getCards();

        cards.forEach(card => {
            if (matchesCard(card, q, categoria)) {
                card.classList.remove("invisivel");
            } else {
                card.classList.add("invisivel");
            }
        });

        try {
            sessionStorage.setItem(STORAGE_KEY, value || "");
            sessionStorage.setItem(STORAGE_CAT_KEY, categoria || "");
        } catch (e) {}
    }

    // listeners
    categoriaSelect.addEventListener("change", () => {
        applyFilter(campoBusca.value);
    });

    const debouncedApply = debounce(() => applyFilter(campoBusca.value), DEBOUNCE_MS);
    campoBusca.addEventListener("input", debouncedApply);

    campoBusca.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const q = campoBusca.value.trim();
            const cat = categoriaSelect.value || "";
            if (!/produtos/i.test(window.location.pathname)) {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (cat) params.set("categoria", cat);
                window.location.href = `produtos.html${params.toString() ? "?" + params.toString() : ""}`;
            } else {
                applyFilter(q);
            }
        }
    });

    const searchIcon = document.querySelector(".search-icon");
    if (searchIcon) {
        searchIcon.style.cursor = "pointer";
        searchIcon.addEventListener("click", () => {
            const q = campoBusca.value.trim();
            const cat = categoriaSelect.value || "";
            if (!/produtos/i.test(window.location.pathname)) {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (cat) params.set("categoria", cat);
                window.location.href = `produtos.html${params.toString() ? "?" + params.toString() : ""}`;
            } else {
                applyFilter(q);
            }
        });
    }

    function initFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const qParam = params.get("q") || "";
        const catParam = params.get("categoria") || "";
        const savedQuery = sessionStorage.getItem(STORAGE_KEY) || "";
        const savedCategory = sessionStorage.getItem(STORAGE_CAT_KEY) || "";

        const initialQuery = qParam || savedQuery;
        const initialCategory = catParam || savedCategory;

        if (initialQuery) campoBusca.value = initialQuery;
        if (initialCategory) categoriaSelect.value = initialCategory;

        // aplica filtro após restaurar valores
        applyFilter(initialQuery);
    }

    initFromQuery();

})();