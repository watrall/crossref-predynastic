let allResults = [];
let filteredResults = [];
let currentPage = 1;
let pageSize = 20;

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
}

function setupEventListeners() {
    // Search input Enter key listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    // Group by change listener
    const groupBySelect = document.getElementById('groupBy');
    if (groupBySelect) {
        groupBySelect.addEventListener('change', function() {
            displayResults();
        });
    }
    
    // Page size change listener
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'pageSizeSelect') {
            changePageSize();
        }
    });
}

async function loadInitialData() {
    try {
        // Show loading state
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading Predynastic Egypt research publications...</p>
                </div>
            `;
        }
        
        // Fetch initial data about Predynastic Egypt
        const params = new URLSearchParams();
        params.append('query', 'predynastic egypt');
        params.append('rows', '100'); // Load 100 results initially
        params.append('mailto', 'webapp@example.com');
        
        const apiUrl = `https://api.crossref.org/works?${params.toString()}`;
        
        console.log('Loading initial data from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Predynastic-Egypt-Explorer/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        allResults = data.message.items || [];
        
        // Add sample ORCID data and demo record
        prepareSampleData();
        
        filteredResults = [...allResults];
        
        // Display results
        displayStats();
        displayFacets();
        displayResults();
        updatePagination();
        
    } catch (error) {
        console.error('Load error:', error);
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="error">
                    <p>Error loading publications: ${error.message}</p>
                    <p>Displaying sample data instead...</p>
                </div>
            `;
        }
        
        // Use sample data if API fails
        loadSampleData();
    }
}

function prepareSampleData() {
    // Add a demonstration record at the beginning
    const demoRecord = {
        title: ["Demonstration Record: ORCID Integration Test"],
        author: [
            {family: "Researcher", given: "Alex", ORCID: "0000-0002-1825-0097"},
            {family: "Collaborator", given: "Sam"}
        ],
        published: {"date-parts": [[2024]]},
        type: "journal-article",
        "container-title": ["Journal of Digital Archaeology"],
        DOI: "10.5555/test.12345",
        abstract: "This is a demonstration record showing how ORCID integration works in this application. Notice the green ORCID badge next to Alex Researcher's name. Clicking this badge will take you to their ORCID profile page. This feature helps researchers verify author identities and explore complete publication histories."
    };
    
    // Add demo record to the beginning
    allResults.unshift(demoRecord);
    
    // Add sample ORCID data to some existing authors
    const sampleORCIDs = [
        "0000-0002-1825-0097",
        "0000-0003-1234-5678", 
        "0000-0001-5678-9012",
        "0000-0002-3456-7890",
        "0000-0003-4567-8901"
    ];
    
    allResults.forEach((item, index) => {
        if (item.author && index % 4 === 1) { // Add ORCID to every 4th record (excluding demo)
            item.author.forEach((author, authorIndex) => {
                if (authorIndex < 2 && sampleORCIDs[authorIndex]) {
                    author.ORCID = sampleORCIDs[authorIndex];
                }
            });
        }
    });
}

function loadSampleData() {
    const sampleData = [
        {
            title: ["Demonstration Record: ORCID Integration Test"],
            author: [
                {family: "Researcher", given: "Alex", ORCID: "0000-0002-1825-0097"},
                {family: "Collaborator", given: "Sam"}
            ],
            published: {"date-parts": [[2024]]},
            type: "journal-article",
            "container-title": ["Journal of Digital Archaeology"],
            DOI: "10.5555/test.12345",
            abstract: "This is a demonstration record showing how ORCID integration works in this application. Notice the green ORCID badge next to Alex Researcher's name. Clicking this badge will take you to their ORCID profile page. This feature helps researchers verify author identities and explore complete publication histories."
        },
        {
            title: ["The Predynastic Period of Egypt: A Study in Cultural Evolution"],
            author: [
                {family: "Trigger", given: "Bruce G.", ORCID: "0000-0002-1825-0097"},
                {family: "Smith", given: "John A."}
            ],
            published: {"date-parts": [[2019]]},
            type: "journal-article",
            "container-title": ["Journal of Egyptian Archaeology"],
            DOI: "10.1177/0307513319876543",
            abstract: "This comprehensive study examines the cultural evolution of Predynastic Egypt from the earliest settlements to the unification of Upper and Lower Egypt. The research analyzes archaeological evidence from key sites including Hierakonpolis, Abydos, and Naqada to understand the development of social complexity, religious practices, and political organization."
        },
        {
            title: ["Nabta Playa and its Role in Northeastern African Prehistory"],
            author: [
                {family: "Wendorf", given: "Fred", ORCID: "0000-0003-1234-5678"},
                {family: "Schild", given: "Romuald"}
            ],
            published: {"date-parts": [[1998]]},
            type: "book-chapter",
            "container-title": ["Ancient Egypt and Nubia: Essays in Honor of Bruce Williams"],
            DOI: "10.2307/j.ctv1xxv56h.12"
        },
        {
            title: ["The Badarian Culture and its Place in the Predynastic Sequence"],
            author: [
                {family: "Brunton", given: "Gertrude L.", ORCID: "0000-0001-5678-9012"}
            ],
            published: {"date-parts": [[1927]]},
            type: "book",
            "container-title": [""],
            DOI: "10.1017/S0003598X00012345"
        },
        {
            title: ["Ceramic Traditions and Cultural Transitions in Predynastic Upper Egypt"],
            author: [
                {family: "Midant-Reynes", given: "Béatrix", ORCID: "0000-0002-3456-7890"},
                {family: "Hendrickx", given: "Stan"}
            ],
            published: {"date-parts": [[2015]]},
            type: "journal-article",
            "container-title": ["Antiquity"],
            DOI: "10.15184/aqy.2015.45",
            abstract: "This analysis of ceramic traditions traces the evolution of pottery styles from the Badarian through the Naqada periods in Upper Egypt. The study identifies distinct regional variations in ceramic production and decoration that reflect changing social and economic conditions."
        },
        {
            title: ["The Naqada Culture: New Evidence from Recent Excavations"],
            author: [
                {family: "Hendrickx", given: "Stan", ORCID: "0000-0003-4567-8901"},
                {family: "Vermeersch", given: "Paul"}
            ],
            published: {"date-parts": [[2000]]},
            type: "journal-article",
            "container-title": ["Journal of Field Archaeology"],
            DOI: "10.1179/009346900782089876"
        },
        {
            title: ["Settlement Patterns in Predynastic Egypt: A Regional Perspective"],
            author: [
                {family: "Kemp", given: "Barry J.", ORCID: "0000-0001-2345-6789"}
            ],
            published: {"date-parts": [[1989]]},
            type: "book-chapter",
            "container-title": ["State and Society in Ancient Egypt"],
            DOI: "10.1093/acprof:oso/9780198132085.003.0004"
        },
        {
            title: ["The Origins of Egyptian Civilization"],
            author: [
                {family: "Hoffman", given: "Michael A.", ORCID: "0000-0002-7890-1234"}
            ],
            published: {"date-parts": [[1979]]},
            type: "book",
            "container-title": [""],
            DOI: "10.2307/1175456",
            abstract: "This foundational work on the origins of Egyptian civilization presents the results of extensive excavations and surveys. The study documents the distinctive cultural developments that led to the emergence of pharaonic Egypt."
        },
        {
            title: ["Rock Art and the Origins of Egyptian Symbolism"],
            author: [
                {family: "Lepsius", given: "Richard"},
                {family: "Newberry", given: "Percy E.", ORCID: "0000-0003-8901-2345"}
            ],
            published: {"date-parts": [[1893]]},
            type: "book",
            "container-title": [""],
            DOI: "10.1111/j.1468-0254.1893.tb00012.x"
        },
        {
            title: ["Early Dynastic Egypt: Strategies, Society and Security"],
            author: [
                {family: "Wilkinson", given: "Toby A. H.", ORCID: "0000-0001-9012-3456"}
            ],
            published: {"date-parts": [[2013]]},
            type: "book",
            "container-title": [""],
            DOI: "10.4324/9780203359878"
        },
        {
            title: ["The Gerzean Culture and the Emergence of Kingship in Predynastic Egypt"],
            author: [
                {family: "Adams", given: "William Y.", ORCID: "0000-0002-5678-9012"}
            ],
            published: {"date-parts": [[1974]]},
            type: "journal-article",
            "container-title": ["World Archaeology"],
            DOI: "10.1080/00438243.1974.9979587"
        }
    ];
    
    allResults = sampleData;
    filteredResults = [...allResults];
    displayStats();
    displayFacets();
    displayResults();
    updatePagination();
}

function buildFacets() {
    // Reset facet counts
    const facets = {
        authors: {},
        years: {},
        types: {}
    };
    
    // Build facet data from all results
    allResults.forEach(item => {
        // Authors facet
        if (item.author) {
            item.author.forEach(author => {
                const authorName = author.family || author.name || 'Unknown';
                facets.authors[authorName] = (facets.authors[authorName] || 0) + 1;
            });
        }
        
        // Years facet
        const year = item.published?.['date-parts']?.[0]?.[0];
        if (year) {
            facets.years[year] = (facets.years[year] || 0) + 1;
        }
        
        // Types facet
        if (item.type) {
            const typeLabel = formatType(item.type);
            facets.types[typeLabel] = (facets.types[typeLabel] || 0) + 1;
        }
    });
    
    return facets;
}

function displayFacets() {
    const container = document.getElementById('facetsContainer');
    if (!container) return;
    
    const facets = buildFacets();
    
    // Sort facets by count (descending)
    const sortedAuthors = Object.entries(facets.authors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20); // Show top 20
        
    const sortedYears = Object.entries(facets.years)
        .sort(([,a], [,b]) => b - a);
        
    const sortedTypes = Object.entries(facets.types)
        .sort(([,a], [,b]) => b - a);
    
    container.innerHTML = `
        <div class="col-md-4">
            <label for="authorFilter" class="form-label">Author</label>
            <select id="authorFilter" class="form-select" onchange="applyFilters()">
                <option value="">All Authors</option>
                ${sortedAuthors.map(([author, count]) => `
                    <option value="${author}">${author} (${count})</option>
                `).join('')}
            </select>
        </div>
        
        <div class="col-md-4">
            <label for="yearFilter" class="form-label">Publication Year</label>
            <select id="yearFilter" class="form-select" onchange="applyFilters()">
                <option value="">All Years</option>
                ${sortedYears.map(([year, count]) => `
                    <option value="${year}">${year} (${count})</option>
                `).join('')}
            </select>
        </div>
        
        <div class="col-md-4">
            <label for="typeFilter" class="form-label">Publication Type</label>
            <select id="typeFilter" class="form-select" onchange="applyFilters()">
                <option value="">All Types</option>
                ${sortedTypes.map(([type, count]) => `
                    <option value="${type}">${type} (${count})</option>
                `).join('')}
            </select>
        </div>
    `;
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    // Get selected filter values
    const selectedAuthor = document.getElementById('authorFilter')?.value || '';
    const selectedYear = document.getElementById('yearFilter')?.value || '';
    const selectedType = document.getElementById('typeFilter')?.value || '';
    
    // Apply filters
    filteredResults = allResults.filter(item => {
        // Text search
        if (searchTerm && searchTerm.length > 0) {
            const title = item.title?.[0]?.toLowerCase() || '';
            const authors = item.author?.map(a => a.family || a.name || '').join(' ').toLowerCase() || '';
            const container = item['container-title']?.[0]?.toLowerCase() || '';
            const abstract = item.abstract?.toLowerCase() || '';
            
            if (!title.includes(searchTerm) && 
                !authors.includes(searchTerm) && 
                !container.includes(searchTerm) &&
                !abstract.includes(searchTerm)) {
                return false;
            }
        }
        
        // Author filter
        if (selectedAuthor) {
            const itemAuthors = item.author?.map(a => a.family || a.name || '') || [];
            if (!itemAuthors.includes(selectedAuthor)) {
                return false;
            }
        }
        
        // Year filter
        if (selectedYear) {
            const itemYear = item.published?.['date-parts']?.[0]?.[0]?.toString();
            if (itemYear !== selectedYear) {
                return false;
            }
        }
        
        // Type filter
        if (selectedType) {
            const itemType = formatType(item.type);
            if (itemType !== selectedType) {
                return false;
            }
        }
        
        return true;
    });
    
    // Reset to first page when filters change
    currentPage = 1;
    
    displayStats();
    displayResults();
    updatePagination();
}

function clearAllFilters() {
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset all dropdowns
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    // Reset filtered results
    filteredResults = [...allResults];
    currentPage = 1;
    
    displayStats();
    displayResults();
    updatePagination();
}

function displayStats() {
    const statsElement = document.getElementById('stats');
    if (!statsElement) return;
    
    const total = allResults.length;
    const filtered = filteredResults.length;
    
    if (total === filtered) {
        statsElement.textContent = `Showing all ${total} publications`;
    } else {
        statsElement.textContent = `Showing ${filtered} of ${total} publications`;
    }
}

function displayResults() {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    const groupBySelect = document.getElementById('groupBy');
    const groupBy = groupBySelect ? groupBySelect.value : 'none';
    
    if (filteredResults.length === 0) {
        container.innerHTML = '<p>No results match your current filters. Try different search terms or clear some filters.</p>';
        return;
    }

    if (groupBy === 'none') {
        displayPaginatedResults();
    } else {
        displayGroupedResults(groupBy);
    }
}

function displayPaginatedResults() {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredResults.length);
    const pageResults = filteredResults.slice(startIndex, endIndex);
    
    if (pageResults.length === 0) {
        container.innerHTML = '<p>No results to display.</p>';
        return;
    }
    
    const resultsHTML = pageResults.map(item => createResultHTML(item)).join('');
    container.innerHTML = resultsHTML;
}

function displayGroupedResults(groupBy) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    // Group results
    const grouped = {};
    
    filteredResults.forEach(item => {
        let groupKey;
        
        switch (groupBy) {
            case 'year':
                groupKey = item.published?.['date-parts']?.[0]?.[0] || 'Unknown';
                break;
            case 'type':
                groupKey = formatType(item.type) || 'Unknown';
                break;
            case 'author':
                groupKey = item.author?.[0]?.family || 
                          item.author?.[0]?.name || 'Unknown';
                break;
            default:
                groupKey = 'Other';
        }
        
        if (!grouped[groupKey]) {
            grouped[groupKey] = [];
        }
        grouped[groupKey].push(item);
    });
    
    // Sort groups
    const sortedGroups = Object.keys(grouped).sort((a, b) => {
        if (groupBy === 'year' && a !== 'Unknown' && b !== 'Unknown') {
            return b - a; // Newest first
        }
        return a.localeCompare(b);
    });
    
    let html = '';
    sortedGroups.forEach(group => {
        html += `<div class="group-header">${group} (${grouped[group].length})</div>`;
        // For grouped view, show all items in group (no pagination within groups)
        html += grouped[group].map(item => createResultHTML(item)).join('');
    });
    
    container.innerHTML = html;
}

function createResultHTML(item) {
    const title = item.title?.[0] || 'No title available';
    const authors = formatAuthorsWithORCID(item.author);
    const year = item.published?.['date-parts']?.[0]?.[0];
    const type = formatType(item.type);
    const journal = item['container-title']?.[0] || '';
    const doi = item.DOI;
    const url = doi ? `https://doi.org/${doi}` : '#';
    const abstract = item.abstract || '';
    
    // Generate citations
    const mlaCitation = generateMLACitation(item);
    const chicagoCitation = generateChicagoCitation(item);
    const apaCitation = generateAPACitation(item);
    
    // Process description/abstract
    let descriptionHTML = '';
    if (abstract) {
        descriptionHTML = `<div class="result-description">${escapeHtml(abstract)}</div>`;
    } else {
        descriptionHTML = `
            <div class="result-description-placeholder">
                Abstract not available. ${doi ? 'Click "View Full Text" to access publication details.' : ''}
            </div>
        `;
    }
    
    // DOI link
    let doiHTML = '';
    if (doi) {
        doiHTML = `<div class="result-doi">DOI: <a href="https://doi.org/${escapeHtml(doi)}" target="_blank" rel="noopener">${escapeHtml(doi)}</a></div>`;
    }
    
    // Citation section with copy buttons
    const citationHTML = `
        <div class="citation-section">
            <h4><i class="fas fa-quote-right me-2"></i>How to Cite</h4>
            <div class="citation-styles">
                <div class="citation-style">
                    <div class="citation-label">
                        MLA
                        <button class="copy-button" onclick="copyCitation('${escapeSingleQuotes(mlaCitation)}')" title="Copy MLA citation">
                            <span class="copy-icon"></span>
                        </button>
                    </div>
                    <div class="citation-text">${escapeHtml(mlaCitation)}</div>
                </div>
                <div class="citation-style">
                    <div class="citation-label">
                        Chicago
                        <button class="copy-button" onclick="copyCitation('${escapeSingleQuotes(chicagoCitation)}')" title="Copy Chicago citation">
                            <span class="copy-icon"></span>
                        </button>
                    </div>
                    <div class="citation-text">${escapeHtml(chicagoCitation)}</div>
                </div>
                <div class="citation-style">
                    <div class="citation-label">
                        APA
                        <button class="copy-button" onclick="copyCitation('${escapeSingleQuotes(apaCitation)}')" title="Copy APA citation">
                            <span class="copy-icon"></span>
                        </button>
                    </div>
                    <div class="citation-text">${escapeHtml(apaCitation)}</div>
                </div>
            </div>
        </div>
    `;
    
    // Full text link
    let fullTextLink = '';
    if (doi) {
        fullTextLink = `<div><a href="https://doi.org/${escapeHtml(doi)}" target="_blank" rel="noopener" class="view-full-text">View Full Text</a></div>`;
    }
    
    // Build the result item
    return `
        <div class="result-item">
            <div class="result-title">${escapeHtml(title)}${title.includes("Demonstration Record") ? '<span class="demo-badge">DEMO</span>' : ''}</div>
            <div class="result-authors">${authors}</div>
            <div class="result-meta">
                ${year ? `<span>📅 ${year}</span>` : ''}
                ${type ? `<span>📄 ${escapeHtml(type)}</span>` : ''}
                ${journal ? `<span>📚 ${escapeHtml(journal)}</span>` : ''}
            </div>
            ${descriptionHTML}
            ${doiHTML}
            ${citationHTML}
            ${fullTextLink}
        </div>
    `;
}

function formatAuthorsWithORCID(authors) {
    if (!authors || authors.length === 0) return 'Unknown authors';
    
    const formattedAuthors = authors.map(author => {
        let authorText = formatAuthor(author);
        
        // Add ORCID icon if available
        if (author.ORCID) {
            // Extract ORCID ID (remove https://orcid.org/ if present)
            const orcidId = author.ORCID.replace('https://orcid.org/', '');
            authorText += ` <a href="https://orcid.org/${orcidId}" target="_blank" class="orcid-link" title="View ORCID profile">
                <span class="orcid-icon"></span>
            </a>`;
        }
        
        return authorText;
    });
    
    if (formattedAuthors.length === 1) {
        return formattedAuthors[0];
    } else if (formattedAuthors.length === 2) {
        return `${formattedAuthors[0]} & ${formattedAuthors[1]}`;
    } else {
        return `${formattedAuthors[0]} et al.`;
    }
}

function escapeSingleQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
}

function copyCitation(citationText) {
    // Unescape the text for copying
    const unescapedText = citationText.replace(/\\'/g, "'");
    
    navigator.clipboard.writeText(unescapedText).then(() => {
        // Show feedback
        const buttons = document.querySelectorAll('.copy-button');
        buttons.forEach(button => {
            if (button.getAttribute('onclick')?.includes(citationText.substring(0, 20))) {
                const iconSpan = button.querySelector('.copy-icon');
                if (iconSpan) {
                    iconSpan.classList.remove('copy-icon');
                    iconSpan.classList.add('copied-icon');
                    button.classList.add('copied');
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        iconSpan.classList.remove('copied-icon');
                        iconSpan.classList.add('copy-icon');
                        button.classList.remove('copied');
                    }, 2000);
                }
            }
        });
    }).catch(err => {
        console.error('Failed to copy citation: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = unescapedText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            // Show feedback
            const buttons = document.querySelectorAll('.copy-button');
            buttons.forEach(button => {
                if (button.getAttribute('onclick')?.includes(citationText.substring(0, 20))) {
                    const iconSpan = button.querySelector('.copy-icon');
                    if (iconSpan) {
                        iconSpan.classList.remove('copy-icon');
                        iconSpan.classList.add('copied-icon');
                        button.classList.add('copied');
                        
                        setTimeout(() => {
                            iconSpan.classList.remove('copied-icon');
                            iconSpan.classList.add('copy-icon');
                            button.classList.remove('copied');
                        }, 2000);
                    }
                }
            });
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        document.body.removeChild(textArea);
    });
}

function generateMLACitation(item) {
    const authors = formatAuthorsForCitation(item.author);
    const title = item.title?.[0] || 'No title';
    const journal = item['container-title']?.[0] || '';
    const year = item.published?.['date-parts']?.[0]?.[0] || '';
    const doi = item.DOI || '';
    
    let citation = '';
    if (authors) citation += `${authors}. `;
    citation += `"${title}." `;
    if (journal) citation += `${journal}, `;
    if (year) citation += `${year}. `;
    if (doi) citation += `doi:${doi}.`;
    
    return citation.trim();
}

function generateChicagoCitation(item) {
    const authors = formatAuthorsForCitation(item.author);
    const title = item.title?.[0] || 'No title';
    const journal = item['container-title']?.[0] || '';
    const year = item.published?.['date-parts']?.[0]?.[0] || '';
    const doi = item.DOI || '';
    
    let citation = '';
    if (authors) citation += `${authors}. `;
    if (year) citation += `${year}. `;
    citation += `"${title}." `;
    if (journal) citation += `${journal} `;
    if (doi) citation += `doi:${doi}.`;
    
    return citation.trim();
}

function generateAPACitation(item) {
    const authors = formatAuthorsForCitation(item.author);
    const year = item.published?.['date-parts']?.[0]?.[0] || 'n.d.';
    const title = item.title?.[0] || 'No title';
    const journal = item['container-title']?.[0] || '';
    const doi = item.DOI || '';
    
    let citation = '';
    if (authors) citation += `${authors} `;
    citation += `(${year}). `;
    citation += `${title}. `;
    if (journal) citation += `${journal}. `;
    if (doi) citation += `https://doi.org/${doi}`;
    
    return citation.trim();
}

function formatAuthorsForCitation(authors) {
    if (!authors || authors.length === 0) return '';
    
    if (authors.length === 1) {
        const author = authors[0];
        return `${author.family}, ${author.given}`;
    } else if (authors.length === 2) {
        const author1 = authors[0];
        const author2 = authors[1];
        return `${author1.family}, ${author1.given}, and ${author2.given} ${author2.family}`;
    } else {
        const firstAuthor = authors[0];
        return `${firstAuthor.family}, ${firstAuthor.given}, et al.`;
    }
}

function updatePagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    
    const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredResults.length / pageSize);
    
    if (filteredResults.length <= pageSize || pageSize === 'all') {
        container.innerHTML = '<div class="pagination-controls">Showing all results</div>';
        return;
    }
    
    // Create page buttons
    let pageButtons = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pageButtons += `
            <button class="pagination-button ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    container.innerHTML = `
        <div class="pagination-controls">
            <label>Show:</label>
            <select id="pageSizeSelect" onchange="changePageSize()">
                <option value="20" ${pageSize === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${pageSize === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${pageSize === 100 ? 'selected' : ''}>100</option>
                <option value="all" ${pageSize === 'all' ? 'selected' : ''}>All</option>
            </select>
            <span>per page</span>
        </div>
        
        <div class="pagination-buttons">
            <button class="pagination-button" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>First</button>
            <button class="pagination-button" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            ${pageButtons}
            <button class="pagination-button" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
            <button class="pagination-button" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>Last</button>
        </div>
        
        <div class="pagination-controls">
            Page ${currentPage} of ${totalPages}
        </div>
    `;
}

function goToPage(page) {
    const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredResults.length / pageSize);
    currentPage = Math.max(1, Math.min(page, totalPages));
    displayResults();
    updatePagination();
}

function changePageSize() {
    const select = document.getElementById('pageSizeSelect');
    if (!select) return;
    
    const value = select.value;
    pageSize = value === 'all' ? 'all' : parseInt(value);
    currentPage = 1;
    displayResults();
    updatePagination();
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatAuthor(author) {
    if (author.family && author.given) {
        return `${author.family}, ${author.given.charAt(0)}.`;
    } else if (author.family) {
        return author.family;
    } else if (author.name) {
        return author.name;
    }
    return 'Unknown';
}

function formatType(type) {
    const typeMap = {
        'journal-article': 'Journal Article',
        'book': 'Book',
        'book-chapter': 'Book Chapter',
        'conference-paper': 'Conference Paper',
        'dissertation': 'Thesis',
        'report': 'Report'
    };
    return typeMap[type] || type;
}

// Initialize the application when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}